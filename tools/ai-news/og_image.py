"""og_image.py — Lấy ảnh og:image của từng tin (CR-035, R-09c 4.3.0). Python stdlib only.

Ranh giới tin cậy: URL tin (đã qua guard allow-list) và HTML/ảnh tải về là dữ liệu KHÔNG tin cậy.
- Chỉ fetch URL tin + URL og:image của chính trang đó; mọi hop (redirect, URL ảnh) qua cùng guard:
  https, port 443, không userinfo, mọi IP DNS phải public (chặn private/loopback/link-local/CGNAT/ULA/
  NAT64/6to4/Teredo, IPv4-mapped xét IPv4 bên trong), chỉ kết nối tới IP đã kiểm (chống DNS rebinding).
- Redirect tự xử lý (≤ 3 hop), timeout socket 5 s + deadline tổng 10 s/request do watchdog cưỡng chế
  (phủ connect + TLS + header + body), ngân sách cả bước ≤ 90 s.
- HTML chỉ đọc ≤ 512 KB để lấy <meta>; không ghi đĩa, không log, không tới LLM.
- Ảnh ≤ 2 MB, nhận diện ở image_sniff.py (magic bytes JPEG/PNG/WebP, cạnh 200..8192 px).
http.client không đọc proxy env và không gửi cookie/Authorization → không cần ProxyHandler.
"""
import collections
import html.parser
import http.client
import ipaddress
import socket
import ssl
import threading
import time
import urllib.parse

from image_sniff import Image, ImageSkip, inspect_image

__all__ = ["Fetcher", "Image", "ImageSkip", "check_url", "collect_images", "fetch_item_image", "find_og_image",
           "inspect_image", "is_public_ip"]

USER_AGENT = "nta-web-ai-news/1.0"
SOCKET_TIMEOUT_S = 5
REQUEST_DEADLINE_S = 10
TOTAL_BUDGET_S = 90
MAX_REDIRECTS = 3
MAX_HTML_BYTES = 512 * 1024
MAX_IMAGE_BYTES = 2 * 1024 * 1024
CHUNK_BYTES = 64 * 1024
REDIRECT_STATUSES = (301, 302, 303, 307, 308)
META_PRIORITY = ("og:image", "og:image:secure_url", "twitter:image")

# Dải IPv6 nhúng IPv4 (NAT64, 6to4, Teredo): có thể trỏ về IPv4 nội bộ dù `is_global` → chặn hẳn.
_EMBEDDED_V4_NETWORKS = tuple(ipaddress.ip_network(net) for net in
                              ("64:ff9b::/96", "64:ff9b:1::/48", "2002::/16", "2001::/32"))


# ---------- guard địa chỉ ----------

def _is_public_ipv4(ip: ipaddress.IPv4Address) -> bool:
    return ip.is_global and not (ip.is_multicast or ip.is_reserved or ip.is_loopback or ip.is_link_local)


def is_public_ip(text: str) -> bool:
    """True chỉ khi IP định tuyến công khai. IPv4-mapped xét IPv4 bên trong (không dựa `is_global` của
    IPv6 vì khác nhau giữa Python 3.12/3.13)."""
    try:
        ip = ipaddress.ip_address(text.split("%", 1)[0])
    except ValueError:
        return False
    if ip.version == 4:
        return _is_public_ipv4(ip)
    if ip.ipv4_mapped is not None:
        return _is_public_ipv4(ip.ipv4_mapped)
    if any(ip in network for network in _EMBEDDED_V4_NETWORKS):
        return False
    return ip.is_global and not (ip.is_multicast or ip.is_reserved or ip.is_loopback or ip.is_link_local)


def check_url(url: str) -> tuple:
    """Kiểm cú pháp URL trước khi resolve/kết nối. Trả (host ASCII, path+query)."""
    try:
        parts = urllib.parse.urlsplit(url.strip())
        port = parts.port
    except ValueError as exc:
        raise ImageSkip("URL hỏng") from exc
    if parts.scheme.lower() != "https":
        raise ImageSkip("không phải https")
    if port not in (None, 443):
        raise ImageSkip("port lạ")
    if "@" in parts.netloc or parts.username is not None:
        raise ImageSkip("URL có userinfo")
    host = (parts.hostname or "").rstrip(".")
    if not host:
        raise ImageSkip("thiếu host")
    try:
        host = host.encode("idna").decode("ascii")
    except UnicodeError as exc:
        raise ImageSkip("host không hợp lệ") from exc
    if _looks_like_ip(host) and not is_public_ip(host):
        raise ImageSkip("IP không public")
    path = urllib.parse.urlunsplit(("", "", parts.path or "/", parts.query, ""))
    return host, path


def _looks_like_ip(host: str) -> bool:
    try:
        ipaddress.ip_address(host)
    except ValueError:
        return False
    return True


def resolve_public_ips(host: str, resolver) -> list:
    """Mọi địa chỉ DNS trả về phải public; trả danh sách (thứ tự DNS, bỏ trùng) để thử lần lượt."""
    try:
        infos = resolver(host, 443, type=socket.SOCK_STREAM)
    except (OSError, UnicodeError) as exc:
        raise ImageSkip("DNS lỗi") from exc
    addresses = list(dict.fromkeys(info[4][0] for info in infos))
    if not addresses:
        raise ImageSkip("DNS rỗng")
    if not all(is_public_ip(address) for address in addresses):
        raise ImageSkip("DNS trả IP không public")
    return addresses


# ---------- kết nối ----------

class PinnedHTTPSConnection(http.client.HTTPSConnection):
    """Kết nối tới IP đã kiểm nhưng SNI + verify cert theo hostname."""

    def __init__(self, host: str, ip: str, timeout: float):
        super().__init__(host, 443, timeout=timeout, context=ssl.create_default_context())
        self._pinned_ip = ip

    def connect(self):
        sock = socket.create_connection((self._pinned_ip, 443), self.timeout)
        # Gán self.sock TRƯỚC handshake để watchdog cắt được cả server nhỏ giọt ở pha TLS.
        self.sock = self._context.wrap_socket(sock, server_hostname=self.host, do_handshake_on_connect=False)
        self.sock.do_handshake()


def _abort(conn) -> None:
    """Gọi từ thread watchdog: shutdown socket → recv/handshake đang chặn ở thread chính trả về ngay."""
    sock = getattr(conn, "sock", None)
    if sock is None:
        return
    try:
        socket.socket.shutdown(sock, socket.SHUT_RDWR)  # bản socket gốc, không đụng trạng thái SSL
    except OSError:
        pass  # socket đã đóng — không còn gì để cắt


class Fetcher:
    """GET an toàn. resolver/connection_factory/clock tiêm được để test không ra Internet."""

    def __init__(self, resolver=socket.getaddrinfo, connection_factory=PinnedHTTPSConnection, clock=time.monotonic):
        self.resolver = resolver
        self.connection_factory = connection_factory
        self.clock = clock

    def get(self, url: str, max_bytes: int, truncate: bool, deadline: float) -> tuple:
        """Theo redirect tay; trả (URL cuối, content-type thường, bytes)."""
        deadline = min(deadline, self.clock() + REQUEST_DEADLINE_S)
        for _hop in range(MAX_REDIRECTS + 1):
            status, location, content_type, body = self._get_once(url, max_bytes, truncate, deadline)
            if status not in REDIRECT_STATUSES:
                if status != 200:
                    raise ImageSkip(f"HTTP {status}")
                return url, content_type, body
            if not location:
                raise ImageSkip("redirect thiếu Location")
            url = urllib.parse.urljoin(url, location)
        raise ImageSkip("quá nhiều redirect")

    def _get_once(self, url: str, max_bytes: int, truncate: bool, deadline: float) -> tuple:
        """1 hop dưới watchdog: hết deadline → shutdown socket; mọi kết quả sau đó (kể cả EOF giả) = bỏ."""
        host, path = check_url(url)
        ips = resolve_public_ips(host, self.resolver)
        expired, current = threading.Event(), []

        def fire():
            expired.set()
            if current:
                _abort(current[0])
        watchdog = threading.Timer(max(0.0, deadline - self.clock()), fire)
        watchdog.daemon = True
        watchdog.start()
        try:
            result = self._exchange(host, ips, path, (max_bytes, truncate, deadline), current)
        except Exception as exc:
            if expired.is_set():
                raise ImageSkip("quá deadline") from exc
            raise
        finally:
            watchdog.cancel()
        if expired.is_set():
            raise ImageSkip("quá deadline")
        return result

    def _exchange(self, host: str, ips: list, path: str, limits: tuple, current: list) -> tuple:
        max_bytes, truncate, deadline = limits
        conn = self._connect_any(host, ips, deadline, current)
        try:
            conn.request("GET", path, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
            response = conn.getresponse()
            if response.status in REDIRECT_STATUSES:
                return response.status, response.getheader("Location"), "", b""
            content_type = (response.getheader("Content-Type") or "").split(";", 1)[0].strip().lower()
            body = self._read_body(conn, response, max_bytes, truncate, deadline) if response.status == 200 else b""
            return response.status, None, content_type, body
        finally:
            conn.close()

    def _connect_any(self, host: str, ips: list, deadline: float, current: list):
        """Thử lần lượt các IP ĐÃ KIỂM (vd IPv6 đầu không tới được → IPv4), không resolve lại."""
        last_error = None
        for ip in ips:
            conn = self.connection_factory(host, ip, self._timeout(deadline))
            current[:] = [conn]
            try:
                conn.connect()
                return conn
            except OSError as exc:
                conn.close()
                last_error = exc
        raise ImageSkip(f"không kết nối được ({type(last_error).__name__})") from last_error

    def _timeout(self, deadline: float) -> float:
        remaining = deadline - self.clock()
        if remaining <= 0:
            raise ImageSkip("quá deadline")
        return min(SOCKET_TIMEOUT_S, remaining)

    def _read_body(self, conn, response, max_bytes: int, truncate: bool, deadline: float) -> bytes:
        """read1 = tối đa 1 lần recv → kiểm deadline sau mỗi lần nhận (read(n) chờ đủ n byte nên bị nhỏ giọt
        giữ lâu). Đếm byte thật, không tin Content-Length."""
        chunks, total = [], 0
        while True:
            timeout = self._timeout(deadline)
            sock = getattr(conn, "sock", None)
            if sock is not None:
                sock.settimeout(timeout)
            chunk = response.read1(min(CHUNK_BYTES, max_bytes + 1 - total))
            if not chunk:
                return b"".join(chunks)
            chunks.append(chunk)
            total += len(chunk)
            if total > max_bytes:
                if truncate:
                    return b"".join(chunks)[:max_bytes]
                raise ImageSkip(f"quá {max_bytes} byte")


# ---------- HTML meta ----------

class _MetaParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.found = {}

    def handle_starttag(self, tag, attrs):
        if tag != "meta":
            return
        values = {key.lower(): (value or "") for key, value in attrs}
        name = (values.get("property") or values.get("name") or "").strip().lower()
        content = values.get("content", "").strip()
        if name in META_PRIORITY and content and name not in self.found:
            self.found[name] = content


def find_og_image(html_bytes: bytes, page_url: str):
    """URL ảnh theo thứ tự META_PRIORITY, resolve tương đối theo URL cuối; không có → None."""
    parser = _MetaParser()
    parser.feed(html_bytes.decode("utf-8", errors="replace"))
    for name in META_PRIORITY:
        if name in parser.found:
            return urllib.parse.urljoin(page_url, parser.found[name])
    return None

# ---------- luồng 1 tin + cả bài ----------

def fetch_item_image(page_url: str, fetcher: Fetcher, deadline: float) -> Image:
    final_url, content_type, html_bytes = fetcher.get(page_url, MAX_HTML_BYTES, truncate=True, deadline=deadline)
    if content_type != "text/html":
        raise ImageSkip("trang không phải text/html")
    image_url = find_og_image(html_bytes, final_url)
    if not image_url:
        raise ImageSkip("không có og:image")
    _final, _type, data = fetcher.get(image_url, MAX_IMAGE_BYTES, truncate=False, deadline=deadline)
    return inspect_image(data)


def collect_images(urls: list, fetcher: Fetcher, log) -> dict:
    """{index (1-based): Image}. Tuần tự, best-effort, ngân sách TOTAL_BUDGET_S; ảnh trùng sha256 ở ≥ 2 tin → bỏ cả."""
    budget_deadline = fetcher.clock() + TOTAL_BUDGET_S
    images = {}
    for index, url in enumerate(urls, start=1):
        if fetcher.clock() >= budget_deadline:
            log(f"ảnh tin #{index} bỏ: hết ngân sách {TOTAL_BUDGET_S}s")
            continue
        try:
            images[index] = fetch_item_image(url, fetcher, budget_deadline)
        except ImageSkip as exc:
            log(f"ảnh tin #{index} bỏ: {exc}")
        except Exception as exc:  # noqa: BLE001 — lỗi ảnh (mạng/TLS/parse) không bao giờ được làm fail bài
            log(f"ảnh tin #{index} bỏ: {type(exc).__name__}")
    counts = collections.Counter(image.sha256 for image in images.values())
    for index in [i for i, image in images.items() if counts[image.sha256] >= 2]:
        log(f"ảnh tin #{index} bỏ: trùng ảnh với tin khác")
        del images[index]
    return images
