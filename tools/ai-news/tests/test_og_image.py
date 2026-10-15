"""Unit test lấy ảnh og:image (CR-035) — không ra Internet: resolver + connection + clock đều giả.

Chạy: python -m unittest discover -s tools/ai-news/tests
"""
import contextlib
import datetime
import hashlib
import html
import http.client
import io
import json
import os
import re
import socket
import struct
import sys
import tempfile
import threading
import time
import unittest
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
FIXTURES = os.path.join(HERE, "fixtures")
sys.path.insert(0, os.path.dirname(HERE))

import generate  # noqa: E402
import og_image  # noqa: E402
from og_image import ImageSkip  # noqa: E402

PUBLIC_IP = "93.184.216.34"
PUBLIC_IP_2 = "151.101.1.140"


# ---------- ảnh tổng hợp (header đủ để đọc kích thước) ----------

def png_bytes(width: int, height: int, salt: bytes = b"") -> bytes:
    return (b"\x89PNG\r\n\x1a\n" + struct.pack(">I", 13) + b"IHDR" + struct.pack(">II", width, height)
            + b"\x08\x02\x00\x00\x00" + b"\x00" * 4 + salt)


def jpeg_bytes(width: int, height: int) -> bytes:
    app0 = b"\xff\xe0" + struct.pack(">H", 16) + b"JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    sof0 = b"\xff\xc0" + struct.pack(">HBHHB", 17, 8, height, width, 3) + b"\x01\x22\x00\x02\x11\x01\x03\x11\x01"
    return b"\xff\xd8" + app0 + sof0 + b"\xff\xd9"


def webp_vp8x_bytes(width: int, height: int) -> bytes:
    chunk = b"VP8X" + struct.pack("<I", 10) + b"\x00" * 4 + (width - 1).to_bytes(3, "little") + (height - 1).to_bytes(3, "little")
    return b"RIFF" + struct.pack("<I", 4 + len(chunk)) + b"WEBP" + chunk


def webp_vp8l_bytes(width: int, height: int) -> bytes:
    bits = (width - 1) | ((height - 1) << 14)
    chunk = b"VP8L" + struct.pack("<I", 5) + b"\x2f" + struct.pack("<I", bits) + b"\x00" * 5
    return b"RIFF" + struct.pack("<I", 4 + len(chunk)) + b"WEBP" + chunk


def page_with(meta: str) -> bytes:
    return f"<html><head><title>x</title>{meta}</head><body>tin</body></html>".encode()


# ---------- mạng giả ----------

class FakeClock:
    def __init__(self):
        self.now = 1000.0

    def __call__(self):
        return self.now


class FakeResponse:
    def __init__(self, status=200, headers=None, body=b"", chunk=None, on_read=None):
        self.status = status
        self._headers = {k.lower(): v for k, v in (headers or {}).items()}
        self._body, self._pos, self._chunk, self._on_read = body, 0, chunk, on_read

    def getheader(self, name):
        return self._headers.get(name.lower())

    def read(self, size):
        raise AssertionError("http.client read(n) chờ đủ n byte — code phải dùng read1")

    def read1(self, size):
        """Như HTTPResponse.read1: tối đa 1 lần recv (giả bằng `chunk` byte)."""
        if self._on_read:
            self._on_read()
        size = min(size, self._chunk or size)
        data = self._body[self._pos:self._pos + size]
        self._pos += len(data)
        return data


def html_response(body: bytes, **kwargs) -> FakeResponse:
    return FakeResponse(200, {"Content-Type": "text/html; charset=utf-8"}, body, **kwargs)


def image_response(body: bytes, content_type="image/jpeg", **kwargs) -> FakeResponse:
    return FakeResponse(200, {"Content-Type": content_type}, body, **kwargs)


def redirect(location: str) -> FakeResponse:
    return FakeResponse(302, {"Location": location})


class FakeNet:
    """routes: {"https://host/path?q": callable → FakeResponse}; dns: {host: [ip, ...]}."""

    def __init__(self, routes=None, dns=None, default_ip=PUBLIC_IP):
        self.routes, self.dns, self.default_ip = routes or {}, dns or {}, default_ip
        self.resolved, self.connections, self.connect_attempts = [], [], []
        self.unreachable = set()
        self.clock = FakeClock()

    def resolver(self, host, port, type=None):
        self.resolved.append(host)
        ips = self.dns.get(host, [self.default_ip])
        if callable(ips):
            ips = ips()
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", (ip, port)) for ip in ips]

    def connection_factory(self, host, ip, timeout):
        return FakeConnection(self, host, ip, timeout)

    def fetcher(self):
        return og_image.Fetcher(self.resolver, self.connection_factory, self.clock)


class FakeConnection:
    def __init__(self, net, host, ip, timeout):
        self.net, self.host, self.ip, self.timeout = net, host, ip, timeout
        self.path = None
        self.sock = None

    def connect(self):
        self.net.connect_attempts.append(self.ip)
        if self.ip in self.net.unreachable:
            raise ConnectionRefusedError("unreachable")

    def request(self, method, path, headers):
        self.path, self.headers = path, headers
        self.net.connections.append(self)

    def getresponse(self):
        route = self.net.routes.get(f"https://{self.host}{self.path}")
        if route is None:
            return FakeResponse(404)
        return route()

    def close(self):
        pass


def get(net, url, max_bytes=og_image.MAX_HTML_BYTES, truncate=True):
    return net.fetcher().get(url, max_bytes, truncate, deadline=net.clock() + 90)


# ---------- guard địa chỉ / URL ----------

class AddressGuardTest(unittest.TestCase):
    def test_public_and_non_public_ips(self):
        for ip in ("8.8.8.8", PUBLIC_IP, "2606:4700:4700::1111", "::ffff:8.8.8.8"):
            self.assertTrue(og_image.is_public_ip(ip), ip)
        for ip in ("127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1",
                   "0.0.0.0", "224.0.0.1", "239.1.1.1", "240.0.0.1", "255.255.255.255", "::1", "::", "fd00::1",
                   "fe80::1", "ff02::1", "::ffff:127.0.0.1", "::ffff:10.0.0.1", "::ffff:169.254.169.254",
                   "64:ff9b::808:808", "64:ff9b::a00:1", "64:ff9b:1::1", "2002:808:808::1", "2002:a00:1::1",
                   "2001:0:4136:e378:8000:63bf:3fff:fdd2", "fe80::1%eth0", "không-phải-ip"):
            self.assertFalse(og_image.is_public_ip(ip), ip)

    def assert_rejected_before_connect(self, url, reason):
        net = FakeNet()
        with self.assertRaisesRegex(ImageSkip, reason):
            get(net, url)
        self.assertEqual(net.resolved, [])
        self.assertEqual(net.connections, [])

    def test_bad_urls_rejected_before_connecting(self):
        self.assert_rejected_before_connect("http://example.com/a", "https")
        self.assert_rejected_before_connect("ftp://example.com/a", "https")
        self.assert_rejected_before_connect("https://example.com:8443/a", "port")
        self.assert_rejected_before_connect("https://example.com:99999/a", "URL hỏng")
        self.assert_rejected_before_connect("https://user:pw@example.com/a", "userinfo")
        self.assert_rejected_before_connect("https://user@example.com/a", "userinfo")
        self.assert_rejected_before_connect("https://10.0.0.5/a", "IP không public")
        self.assert_rejected_before_connect("https://[::1]/a", "IP không public")
        self.assert_rejected_before_connect("https://[::ffff:127.0.0.1]/a", "IP không public")
        self.assert_rejected_before_connect("https:///a", "thiếu host")

    def test_port_443_and_public_ip_literal_allowed(self):
        net = FakeNet(routes={"https://example.com/a": lambda: html_response(b"<html></html>")})
        self.assertEqual(get(net, "https://example.com:443/a")[2], b"<html></html>")

    def test_dns_to_private_rejected(self):
        for ip in ("127.0.0.1", "10.0.0.8", "172.16.5.4", "192.168.0.10", "169.254.169.254", "100.64.1.1",
                   "::1", "fd00::5", "::ffff:127.0.0.1", "64:ff9b::7f00:1"):
            net = FakeNet(routes={"https://news.example/a": lambda: html_response(b"x")},
                          dns={"news.example": [ip]})
            with self.assertRaisesRegex(ImageSkip, "không public"):
                get(net, "https://news.example/a")
            self.assertEqual(net.connections, [], ip)

    def test_one_public_one_private_rejected(self):
        net = FakeNet(dns={"news.example": [PUBLIC_IP, "10.0.0.1"]})
        with self.assertRaisesRegex(ImageSkip, "không public"):
            get(net, "https://news.example/a")
        self.assertEqual(net.connections, [])

    def test_dns_failure_and_empty(self):
        def boom(*_a, **_k):
            raise socket.gaierror("no such host")
        fetcher = og_image.Fetcher(boom, FakeNet().connection_factory, FakeClock())
        with self.assertRaisesRegex(ImageSkip, "DNS lỗi"):
            fetcher.get("https://nx.example/", 10, True, deadline=2000)
        with self.assertRaisesRegex(ImageSkip, "DNS rỗng"):
            get(FakeNet(dns={"news.example": []}), "https://news.example/a")

    def test_connects_to_checked_ip_not_a_second_lookup(self):
        answers = iter([[PUBLIC_IP], ["127.0.0.1"], ["127.0.0.1"]])
        net = FakeNet(routes={"https://news.example/a": lambda: html_response(b"ok")},
                      dns={"news.example": lambda: next(answers)})
        self.assertEqual(get(net, "https://news.example/a")[2], b"ok")
        self.assertEqual(net.resolved, ["news.example"])
        self.assertEqual([(c.host, c.ip) for c in net.connections], [("news.example", PUBLIC_IP)])

    def test_request_headers_are_minimal(self):
        net = FakeNet(routes={"https://news.example/a?x=1": lambda: html_response(b"ok")})
        get(net, "https://news.example/a?x=1#frag")
        headers = net.connections[0].headers
        self.assertEqual(headers["User-Agent"], "nta-web-ai-news/1.0")
        self.assertNotIn("Cookie", headers)
        self.assertNotIn("Authorization", headers)
        self.assertEqual(net.connections[0].path, "/a?x=1")

    def test_real_connection_class_pins_ip_with_hostname_sni(self):
        conn = og_image.PinnedHTTPSConnection("news.example", PUBLIC_IP, 5)
        raw, tls = mock.Mock(), mock.Mock()
        with mock.patch.object(og_image.socket, "create_connection", return_value=raw) as create, \
                mock.patch.object(conn._context, "wrap_socket", return_value=tls) as wrap:
            conn.connect()
        create.assert_called_once_with((PUBLIC_IP, 443), 5)
        wrap.assert_called_once_with(raw, server_hostname="news.example", do_handshake_on_connect=False)
        tls.do_handshake.assert_called_once_with()
        self.assertIs(conn.sock, tls)  # gán trước handshake → watchdog cắt được pha TLS
        self.assertEqual(conn._context.verify_mode, og_image.ssl.CERT_REQUIRED)
        self.assertTrue(conn._context.check_hostname)

    def test_tries_checked_ips_in_order_without_new_lookup(self):
        net = FakeNet(routes={"https://news.example/a": lambda: html_response(b"ok")},
                      dns={"news.example": ["2606:4700::1", PUBLIC_IP, PUBLIC_IP]})
        net.unreachable.add("2606:4700::1")
        self.assertEqual(get(net, "https://news.example/a")[2], b"ok")
        self.assertEqual(net.connect_attempts, ["2606:4700::1", PUBLIC_IP])
        self.assertEqual(net.resolved, ["news.example"])
        self.assertEqual(net.connections[0].ip, PUBLIC_IP)

    def test_all_checked_ips_unreachable(self):
        net = FakeNet(dns={"news.example": [PUBLIC_IP, PUBLIC_IP_2]})
        net.unreachable.update({PUBLIC_IP, PUBLIC_IP_2})
        with self.assertRaisesRegex(ImageSkip, "không kết nối được"):
            get(net, "https://news.example/a")
        self.assertEqual(net.connect_attempts, [PUBLIC_IP, PUBLIC_IP_2])
        self.assertEqual(net.connections, [])


class RedirectTest(unittest.TestCase):
    def test_valid_redirect_followed_and_rechecked(self):
        net = FakeNet(routes={
            "https://news.example/a": lambda: redirect("https://cdn.example/b"),
            "https://cdn.example/b": lambda: redirect("/c"),
            "https://cdn.example/c": lambda: html_response(b"final"),
        }, dns={"cdn.example": [PUBLIC_IP_2]})
        final_url, content_type, body = get(net, "https://news.example/a")
        self.assertEqual((final_url, content_type, body), ("https://cdn.example/c", "text/html", b"final"))
        self.assertEqual(net.resolved, ["news.example", "cdn.example", "cdn.example"])
        self.assertEqual(net.connections[-1].ip, PUBLIC_IP_2)

    def test_redirect_to_private_host_rejected(self):
        net = FakeNet(routes={"https://news.example/a": lambda: redirect("https://internal.example/x")},
                      dns={"internal.example": ["192.168.1.10"]})
        with self.assertRaisesRegex(ImageSkip, "không public"):
            get(net, "https://news.example/a")
        self.assertEqual([c.host for c in net.connections], ["news.example"])

    def test_redirect_to_metadata_ip_literal_rejected(self):
        net = FakeNet(routes={"https://news.example/a": lambda: redirect("https://169.254.169.254/latest")})
        with self.assertRaisesRegex(ImageSkip, "IP không public"):
            get(net, "https://news.example/a")

    def test_redirect_to_http_rejected(self):
        net = FakeNet(routes={"https://news.example/a": lambda: redirect("http://news.example/b")})
        with self.assertRaisesRegex(ImageSkip, "https"):
            get(net, "https://news.example/a")
        self.assertEqual(len(net.connections), 1)

    def test_more_than_three_redirects_rejected(self):
        routes = {f"https://news.example/{i}": (lambda i=i: redirect(f"/{i + 1}")) for i in range(5)}
        net = FakeNet(routes=routes)
        with self.assertRaisesRegex(ImageSkip, "redirect"):
            get(net, "https://news.example/0")
        self.assertEqual(len(net.connections), og_image.MAX_REDIRECTS + 1)

    def test_three_redirects_allowed(self):
        routes = {f"https://news.example/{i}": (lambda i=i: redirect(f"/{i + 1}")) for i in range(3)}
        routes["https://news.example/3"] = lambda: html_response(b"ok")
        self.assertEqual(get(FakeNet(routes=routes), "https://news.example/0")[2], b"ok")

    def test_redirect_without_location_and_http_error(self):
        net = FakeNet(routes={"https://news.example/a": lambda: FakeResponse(301),
                              "https://news.example/b": lambda: FakeResponse(500)})
        with self.assertRaisesRegex(ImageSkip, "Location"):
            get(net, "https://news.example/a")
        with self.assertRaisesRegex(ImageSkip, "HTTP 500"):
            get(net, "https://news.example/b")


class DripServer:
    """Server HTTP thật trên 127.0.0.1: gửi `head` rồi nhỏ giọt `drip` mỗi `interval` giây (tối đa ~20 s)."""

    def __init__(self, head: bytes, drip: bytes, interval: float = 0.05):
        self.head, self.drip, self.interval = head, drip, interval
        self.listener = socket.create_server(("127.0.0.1", 0))
        self.port = self.listener.getsockname()[1]
        threading.Thread(target=self._serve, daemon=True).start()

    def _serve(self):
        try:
            conn, _addr = self.listener.accept()
        except OSError:
            return
        with conn:
            conn.settimeout(5)
            try:
                request = b""
                while b"\r\n\r\n" not in request:
                    data = conn.recv(4096)
                    if not data:
                        return
                    request += data
                conn.sendall(self.head)
                for _ in range(int(20 / self.interval) if self.drip else 0):
                    conn.sendall(self.drip)
                    time.sleep(self.interval)
            except OSError:
                return  # client đã cắt kết nối — đúng mong đợi

    def close(self):
        self.listener.close()


class RealSocketDeadlineTest(unittest.TestCase):
    """http.client THẬT + socket thật: chứng minh watchdog/read1 dừng ≈ deadline (dùng deadline 1 s cho nhanh).
    Guard IP được giữ nguyên: resolver giả trả IP public, chỉ connection factory nối vào server cục bộ."""

    DEADLINE_S = 1.0

    def fetch_from(self, server):
        self.addCleanup(server.close)

        def factory(_host, _ip, timeout):
            return http.client.HTTPConnection("127.0.0.1", server.port, timeout=timeout)

        def resolver(_host, port, type=None):
            return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", (PUBLIC_IP, port))]
        fetcher = og_image.Fetcher(resolver, factory, time.monotonic)
        start = time.monotonic()
        with self.assertRaisesRegex(ImageSkip, "deadline"):
            fetcher.get("https://news.example/a", og_image.MAX_HTML_BYTES, True, deadline=start + self.DEADLINE_S)
        return time.monotonic() - start

    def test_header_drip_cut_by_watchdog(self):
        elapsed = self.fetch_from(DripServer(b"HTTP/1.1 200 OK\r\nX-Pad: ", b"a"))
        self.assertLess(elapsed, self.DEADLINE_S + 1.5)

    def test_body_drip_cut_at_deadline(self):
        head = b"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: 100000\r\n\r\n"
        elapsed = self.fetch_from(DripServer(head, b"a"))
        self.assertLess(elapsed, self.DEADLINE_S + 1.5)

    def test_chunked_body_drip_cut_at_deadline(self):
        head = b"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nTransfer-Encoding: chunked\r\n\r\n1000\r\n"
        elapsed = self.fetch_from(DripServer(head, b"a"))
        self.assertLess(elapsed, self.DEADLINE_S + 1.5)

    def test_fast_server_still_works(self):
        body = page_with('<meta property="og:image" content="/x.png">')
        head = b"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: %d\r\n\r\n" % len(body)
        server = DripServer(head + body, b"", interval=0.5)
        self.addCleanup(server.close)
        fetcher = og_image.Fetcher(
            lambda _h, port, type=None: [(socket.AF_INET, socket.SOCK_STREAM, 6, "", (PUBLIC_IP, port))],
            lambda _h, _ip, timeout: http.client.HTTPConnection("127.0.0.1", server.port, timeout=timeout),
            time.monotonic)
        _url, content_type, read = fetcher.get("https://news.example/a", og_image.MAX_HTML_BYTES, True,
                                               deadline=time.monotonic() + 5)
        self.assertEqual((content_type, read), ("text/html", body))


class DeadlineTest(unittest.TestCase):
    def test_slow_drip_body_stops_at_request_deadline(self):
        net = FakeNet()

        def tick():
            net.clock.now += 3
        net.routes["https://news.example/a"] = lambda: html_response(b"x" * 100, chunk=1, on_read=tick)
        with self.assertRaisesRegex(ImageSkip, "deadline"):
            get(net, "https://news.example/a")
        self.assertLessEqual(net.clock.now - 1000, og_image.REQUEST_DEADLINE_S + 3)

    def test_socket_timeout_never_exceeds_remaining(self):
        net = FakeNet(routes={"https://news.example/a": lambda: html_response(b"ok")})
        net.fetcher().get("https://news.example/a", 10, True, deadline=net.clock() + 2)
        self.assertEqual(net.connections[0].timeout, 2)
        net.fetcher().get("https://news.example/a", 10, True, deadline=net.clock() + 90)
        self.assertEqual(net.connections[1].timeout, og_image.SOCKET_TIMEOUT_S)

    def test_expired_deadline_does_not_connect(self):
        net = FakeNet()
        with self.assertRaisesRegex(ImageSkip, "deadline"):
            net.fetcher().get("https://news.example/a", 10, True, deadline=net.clock() - 1)
        self.assertEqual(net.connections, [])


# ---------- HTML meta ----------

class HtmlMetaTest(unittest.TestCase):
    def test_priority_order(self):
        both = page_with('<meta name="twitter:image" content="/t.png">'
                         '<meta property="og:image:secure_url" content="/s.png">'
                         '<meta property="og:image" content="/o.png">')
        self.assertEqual(og_image.find_og_image(both, "https://n.example/a"), "https://n.example/o.png")
        secure = page_with('<meta name="twitter:image" content="/t.png"><meta property="og:image:secure_url" content="/s.png">')
        self.assertEqual(og_image.find_og_image(secure, "https://n.example/a"), "https://n.example/s.png")
        twitter = page_with('<META NAME="twitter:image" CONTENT="https://img.example/t.png">')
        self.assertEqual(og_image.find_og_image(twitter, "https://n.example/a"), "https://img.example/t.png")

    def test_relative_and_empty_meta(self):
        page = page_with('<meta property="og:image" content=""><meta property="og:image" content="../i.jpg?v=1&amp;w=2">')
        self.assertEqual(og_image.find_og_image(page, "https://n.example/news/post"), "https://n.example/i.jpg?v=1&w=2")
        self.assertIsNone(og_image.find_og_image(page_with('<meta name="description" content="x">'), "https://n.example/"))

    def test_html_over_512kb_only_first_part_read(self):
        body = b"<html>" + b" " * (og_image.MAX_HTML_BYTES + 1000) + b'<meta property="og:image" content="/late.png">'
        net = FakeNet(routes={"https://news.example/a": lambda: html_response(body)})
        _url, _type, read = get(net, "https://news.example/a")
        self.assertEqual(len(read), og_image.MAX_HTML_BYTES)
        with self.assertRaisesRegex(ImageSkip, "og:image"):
            og_image.fetch_item_image("https://news.example/a", net.fetcher(), net.clock() + 90)

    def test_non_html_page_skipped(self):
        net = FakeNet(routes={"https://news.example/a": lambda: FakeResponse(200, {"Content-Type": "application/json"}, b"{}")})
        with self.assertRaisesRegex(ImageSkip, "text/html"):
            og_image.fetch_item_image("https://news.example/a", net.fetcher(), net.clock() + 90)

    def test_relative_og_image_resolved_against_final_url(self):
        image = jpeg_bytes(1200, 630)
        net = FakeNet(routes={
            "https://news.example/a": lambda: redirect("https://www.news.example/story/1"),
            "https://www.news.example/story/1": lambda: html_response(page_with('<meta property="og:image" content="img/cover.jpg">')),
            "https://www.news.example/story/img/cover.jpg": lambda: image_response(image),
        })
        result = og_image.fetch_item_image("https://news.example/a", net.fetcher(), net.clock() + 90)
        self.assertEqual((result.ext, result.width, result.height), ("jpg", 1200, 630))

    def test_og_image_url_goes_through_guard(self):
        for target, reason in (("http://img.example/a.jpg", "https"), ("https://10.0.0.1/a.jpg", "IP không public"),
                               ("data:image/png;base64,AAAA", "https"), ("https://img.example:8080/a.jpg", "port")):
            page = page_with(f'<meta property="og:image" content="{target}">')
            net = FakeNet(routes={"https://news.example/a": lambda page=page: html_response(page)})
            with self.assertRaisesRegex(ImageSkip, reason):
                og_image.fetch_item_image("https://news.example/a", net.fetcher(), net.clock() + 90)
            self.assertEqual(len(net.connections), 1)


# ---------- nhận diện ảnh ----------

class InspectImageTest(unittest.TestCase):
    def test_valid_formats(self):
        for data, ext, size in ((jpeg_bytes(1200, 630), "jpg", (1200, 630)), (png_bytes(800, 400), "png", (800, 400)),
                                (webp_vp8x_bytes(1024, 512), "webp", (1024, 512)),
                                (webp_vp8l_bytes(640, 360), "webp", (640, 360))):
            image = og_image.inspect_image(data)
            self.assertEqual((image.ext, image.width, image.height), (ext, *size))
            self.assertEqual(image.sha256, hashlib.sha256(data).hexdigest())

    def test_rejected_formats(self):
        for data in (b"GIF89a" + b"\x00" * 40, b'<svg xmlns="http://www.w3.org/2000/svg" width="900"></svg>',
                     b"<html><body>not a jpg</body></html>", b"\x00\x00\x00\x1cftypavif" + b"\x00" * 30,
                     b"\x00\x00\x00\x18ftypheic" + b"\x00" * 30, b""):
            with self.assertRaisesRegex(ImageSkip, "JPEG/PNG/WebP"):
                og_image.inspect_image(data)

    def test_size_limits(self):
        with self.assertRaisesRegex(ImageSkip, "nhỏ"):
            og_image.inspect_image(png_bytes(16, 16))
        with self.assertRaisesRegex(ImageSkip, "nhỏ"):
            og_image.inspect_image(jpeg_bytes(1200, 199))
        with self.assertRaisesRegex(ImageSkip, "quá lớn"):
            og_image.inspect_image(png_bytes(9000, 300))
        self.assertEqual(og_image.inspect_image(png_bytes(200, 8192)).height, 8192)
        with self.assertRaisesRegex(ImageSkip, "kích thước"):
            og_image.inspect_image(b"\xff\xd8\xff\xe0\x00\x10JFIF")

    def test_image_over_2mb_with_lying_content_length(self):
        big = png_bytes(800, 600) + b"\x00" * og_image.MAX_IMAGE_BYTES
        net = FakeNet(routes={"https://img.example/a.png": lambda: image_response(big, "image/png")})
        net.routes["https://img.example/a.png"] = lambda: FakeResponse(200, {"Content-Type": "image/png", "Content-Length": "1000"}, big)
        with self.assertRaisesRegex(ImageSkip, "byte"):
            get(net, "https://img.example/a.png", og_image.MAX_IMAGE_BYTES, truncate=False)

    def test_fake_jpg_by_content_type_rejected(self):
        page = page_with('<meta property="og:image" content="https://img.example/a.jpg">')
        net = FakeNet(routes={"https://news.example/a": lambda: html_response(page),
                              "https://img.example/a.jpg": lambda: image_response(b"<html>gotcha</html>", "image/jpeg")})
        with self.assertRaisesRegex(ImageSkip, "JPEG/PNG/WebP"):
            og_image.fetch_item_image("https://news.example/a", net.fetcher(), net.clock() + 90)


# ---------- cả bài: trùng ảnh, timeout, ngân sách ----------

def item_site(net, path, image_bytes):
    """Trang https://news.example/<path> có og:image riêng."""
    net.routes[f"https://news.example/{path}"] = lambda: html_response(
        page_with(f'<meta property="og:image" content="/img/{path}.png">'))
    net.routes[f"https://news.example/img/{path}.png"] = lambda: image_response(image_bytes, "image/png")


class CollectImagesTest(unittest.TestCase):
    def setUp(self):
        self.logs = []

    def test_shared_image_dropped_everywhere(self):
        net = FakeNet()
        logo = png_bytes(600, 600)
        item_site(net, "a", logo)
        item_site(net, "b", png_bytes(800, 400, b"b"))
        item_site(net, "c", logo)
        images = og_image.collect_images([f"https://news.example/{p}" for p in "abc"], net.fetcher(), self.logs.append)
        self.assertEqual(list(images), [2])
        self.assertEqual(sum("trùng ảnh" in line for line in self.logs), 2)

    def test_timeout_only_affects_that_item(self):
        net = FakeNet()
        item_site(net, "a", png_bytes(800, 400, b"a"))

        def hang():
            raise socket.timeout("timed out")
        net.routes["https://news.example/b"] = hang
        item_site(net, "c", png_bytes(800, 400, b"c"))
        images = og_image.collect_images([f"https://news.example/{p}" for p in "abc"], net.fetcher(), self.logs.append)
        self.assertEqual(sorted(images), [1, 3])
        self.assertIn("ảnh tin #2 bỏ: TimeoutError", self.logs)

    def test_unexpected_error_never_raises(self):
        net = FakeNet()

        def broken():
            raise RuntimeError("parser exploded")
        net.routes["https://news.example/a"] = broken
        self.assertEqual(og_image.collect_images(["https://news.example/a"], net.fetcher(), self.logs.append), {})
        self.assertEqual(self.logs, ["ảnh tin #1 bỏ: RuntimeError"])

    def test_budget_exhausted_remaining_items_without_image(self):
        net = FakeNet()
        item_site(net, "a", png_bytes(800, 400, b"a"))
        item_site(net, "b", png_bytes(800, 400, b"b"))
        item_site(net, "c", png_bytes(800, 400, b"c"))
        original = net.connection_factory

        def slow_factory(host, ip, timeout):
            conn = original(host, ip, timeout)

            def close():
                net.clock.now += 45  # mỗi request "mất" 45 s (vẫn trong deadline 10 s/lần đọc giả)
            conn.close = close
            return conn
        fetcher = og_image.Fetcher(net.resolver, slow_factory, net.clock)
        images = og_image.collect_images([f"https://news.example/{p}" for p in "abc"], fetcher, self.logs.append)
        self.assertEqual(list(images), [1])
        self.assertEqual(self.logs, ["ảnh tin #2 bỏ: hết ngân sách 90s", "ảnh tin #3 bỏ: hết ngân sách 90s"])


# ---------- render MDX + CLI ----------

def fixture_items():
    with open(os.path.join(FIXTURES, "items.json"), encoding="utf-8") as fh:
        raw = json.load(fh)["items"]
    with open(os.path.join(FIXTURES, "digest.clean.md"), encoding="utf-8") as fh:
        return generate.validate_items(raw, generate.extract_urls(fh.read()))


WEEK = generate.week_info(datetime.datetime(2026, 10, 12, 8, 0, tzinfo=generate.VN_TZ))
NEWS_IMAGE_RE = re.compile(r'^<NewsImage src="(/uploads/[0-9a-f]{64}\.(?:jpg|png|webp))" alt="([^"\n<>{}]*)" '
                           r'width="(\d+)" height="(\d+)" />$', re.MULTILINE)
I7_RE = re.compile(r"(?:^|(?<=[\"'(\s=]))(/[^\s\"'()<>?#]+\.(?:png|jpe?g|webp|gif|svg|avif))(?=$|[\"')\s>])")


class RenderImagesTest(unittest.TestCase):
    def test_alt_escaped_and_tag_well_formed(self):
        items = fixture_items()
        items[0] = dict(items[0], title_vi='Tiêu "đề" <b>{x}</b> & *y* _z_', title_en='Title "q" <i>{a}</i> & *b* _c_')
        image = og_image.inspect_image(png_bytes(1200, 630))
        for locale in generate.LOCALES:
            text = generate.render_post(locale, WEEK, items, {1: image})
            generate.validate_post(text)
            tags = NEWS_IMAGE_RE.findall(text)
            self.assertEqual(len(tags), 1, text)
            src, alt, width, height = tags[0]
            self.assertEqual(src, f"/uploads/{image.sha256}.png")
            self.assertEqual(html.unescape(alt), items[0]["title_" + locale])
            self.assertEqual((width, height), ("1200", "630"))
            self.assertEqual(I7_RE.findall(text.split("---\n", 2)[2]), [src])
            credit = generate.IMAGE_CREDIT[locale]
            self.assertIn(f"\n\n*{credit}: reddit.com*\n\n", text)
            self.assertIn(f"*{generate.FOOTNOTE[locale]} {generate.IMAGE_FOOTNOTE[locale]}*", text)
            heading = text.index("## 1. ")
            self.assertLess(heading, text.index("<NewsImage"))
            self.assertLess(text.index("<NewsImage"), text.index("## 2. "))
            body_without_tag = NEWS_IMAGE_RE.sub("", text.split("---\n", 2)[2])
            self.assertNotRegex(body_without_tag, r"(?<!\\)[{}<]")

    def test_escape_jsx_attr(self):
        self.assertEqual(generate.escape_jsx_attr('a"b<c>{d}&e\nf'), "a&quot;b&lt;c&gt;&#123;d&#125;&amp;e f")

    def test_no_images_output_unchanged(self):
        items = fixture_items()
        for locale in generate.LOCALES:
            plain = generate.render_post(locale, WEEK, items)
            self.assertEqual(generate.render_post(locale, WEEK, items, {}), plain)
            self.assertNotIn("NewsImage", plain)
            self.assertNotIn(generate.IMAGE_FOOTNOTE[locale], plain)
            self.assertTrue(plain.endswith(f"---\n\n*{generate.FOOTNOTE[locale]}*\n"))

    def test_max_size_post_with_images_within_body_limit(self):
        base = fixture_items()[0]
        items = [dict(base, url=f"https://example.com/n{i}", title_vi="t" * generate.TITLE_MAX,
                      title_en="t" * generate.TITLE_MAX, summary_vi="s" * generate.SUMMARY_MAX,
                      summary_en="s" * generate.SUMMARY_MAX, source="x" * generate.SOURCE_MAX)
                 for i in range(generate.MAX_ITEMS)]
        image = og_image.inspect_image(png_bytes(8192, 8192))
        images = {i: image for i in range(1, generate.MAX_ITEMS + 1)}
        for locale in generate.LOCALES:
            generate.validate_post(generate.render_post(locale, WEEK, items, images))


class CliImagesTest(unittest.TestCase):
    NOW = "2026-10-12T08:00:00+07:00"

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.content = os.path.join(self.tmp.name, "blog")
        self.images = os.path.join(self.tmp.name, "images")

    def run_main(self, argv, fetcher=None):
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = generate.main(argv, fetcher=fetcher)
        return code, out.getvalue(), err.getvalue()

    def render_args(self, *extra):
        return ["render", "--content-dir", self.content, "--now", self.NOW,
                "--clean", os.path.join(FIXTURES, "digest.clean.md"),
                "--items-json", os.path.join(FIXTURES, "items.json"), *extra]

    def read_post(self, locale):
        with open(os.path.join(self.content, locale, "ai-weekly-2026-w42.mdx"), encoding="utf-8") as fh:
            return fh.read()

    def news_net(self):
        """Tin #1 (reddit) có og:image JPEG; tin #4 (arxiv) og:image WebP; các tin khác 404 → chỉ text."""
        net = FakeNet()
        jpg, webp = jpeg_bytes(1200, 630), webp_vp8x_bytes(1000, 500)
        net.routes["https://www.reddit.com/r/LocalLLaMA/comments/abc123/new_model/"] = lambda: html_response(
            page_with('<meta property="og:image" content="https://i.redd.it/cover.jpg">'))
        net.routes["https://i.redd.it/cover.jpg"] = lambda: image_response(jpg)
        net.routes["https://arxiv.org/abs/2610.01234"] = lambda: html_response(
            page_with('<meta name="twitter:image" content="/static/card.webp">'))
        net.routes["https://arxiv.org/static/card.webp"] = lambda: image_response(webp, "image/webp")
        return net, jpg, webp

    def test_render_with_images_writes_mdx_files_and_manifest(self):
        net, jpg, webp = self.news_net()
        code, out, err = self.run_main(self.render_args("--images-out", self.images), net.fetcher())
        self.assertEqual(code, 0, err)
        self.assertIn("status=written", out)
        jpg_sha, webp_sha = hashlib.sha256(jpg).hexdigest(), hashlib.sha256(webp).hexdigest()
        for locale in generate.LOCALES:
            text = self.read_post(locale)
            tags = NEWS_IMAGE_RE.findall(text)
            self.assertEqual([t[0] for t in tags], [f"/uploads/{jpg_sha}.jpg", f"/uploads/{webp_sha}.webp"])
            self.assertIn(f"*{generate.IMAGE_CREDIT[locale]}: arxiv.org*", text)
        with open(os.path.join(self.images, "manifest.json"), encoding="utf-8") as fh:
            manifest = json.load(fh)
        self.assertEqual(manifest["slug"], "ai-weekly-2026-w42")
        first = manifest["images"][0]
        self.assertEqual(first, {"file": f"{jpg_sha}.jpg", "sha256": jpg_sha, "ext": "jpg", "width": 1200, "height": 630,
                                 "bytes": len(jpg), "sourceHost": "reddit.com",
                                 "alt": {"vi": "Mô hình mở mới dẫn đầu bảng xếp hạng lập trình",
                                         "en": "New open-weight model leads a coding benchmark"}})
        self.assertEqual(sorted(os.listdir(self.images)), sorted([f"{jpg_sha}.jpg", f"{webp_sha}.webp", "manifest.json"]))
        with open(os.path.join(self.images, f"{webp_sha}.webp"), "rb") as fh:
            self.assertEqual(fh.read(), webp)
        self.assertIn("ảnh tin #2 bỏ: HTTP 404", err)
        self.assertNotIn("<html>", err)

    def test_all_image_failures_still_publish(self):
        net = FakeNet(dns={})
        net.default_ip = "10.0.0.1"
        code, out, err = self.run_main(self.render_args("--images-out", self.images), net.fetcher())
        self.assertEqual(code, 0, err)
        self.assertNotIn("NewsImage", self.read_post("vi"))
        with open(os.path.join(self.images, "manifest.json"), encoding="utf-8") as fh:
            self.assertEqual(json.load(fh)["images"], [])

    def test_no_images_flag_and_missing_images_out_do_not_fetch(self):
        never = og_image.Fetcher(mock.Mock(side_effect=AssertionError("không được resolve")),
                                 mock.Mock(side_effect=AssertionError("không được kết nối")), FakeClock())
        code, _, err = self.run_main(self.render_args("--images-out", self.images, "--no-images"), never)
        self.assertEqual(code, 0, err)
        self.assertFalse(os.path.exists(self.images))
        with_flag = {locale: self.read_post(locale) for locale in generate.LOCALES}
        items = fixture_items()
        for locale in generate.LOCALES:
            self.assertEqual(with_flag[locale], generate.render_post(locale, WEEK, items))
        for locale in generate.LOCALES:
            os.remove(os.path.join(self.content, locale, "ai-weekly-2026-w42.mdx"))
        code, _, err = self.run_main(self.render_args(), never)
        self.assertEqual(code, 0, err)
        self.assertEqual(self.read_post("en"), with_flag["en"])

    def test_generate_items_out_then_render_without_key(self):
        items_out = os.path.join(self.tmp.name, "work", "items.json")
        with open(os.path.join(FIXTURES, "items.json"), encoding="utf-8") as fh:
            llm_answer = fh.read()
        with mock.patch.dict(os.environ, {"OPENCODE_API_KEY": "test-key"}), \
                mock.patch.object(generate, "call_llm", return_value=llm_answer), \
                mock.patch.object(og_image, "Fetcher", side_effect=AssertionError("generate không được fetch ảnh")):
            code, out, err = self.run_main(["generate", "--content-dir", self.content, "--now", self.NOW,
                                            "--clean", os.path.join(FIXTURES, "digest.clean.md"), "--items-out", items_out])
        self.assertEqual(code, 0, err)
        self.assertIn("status=items", out)
        self.assertFalse(os.path.exists(self.content))
        with open(items_out, encoding="utf-8") as fh:
            self.assertEqual(len(json.load(fh)["items"]), 6)
        saved = os.environ.pop("OPENCODE_API_KEY", None)
        try:
            net, _jpg, _webp = self.news_net()
            code, out, err = self.run_main(["render", "--content-dir", self.content, "--now", self.NOW,
                                            "--clean", os.path.join(FIXTURES, "digest.clean.md"),
                                            "--items-json", items_out, "--images-out", self.images], net.fetcher())
        finally:
            if saved is not None:
                os.environ["OPENCODE_API_KEY"] = saved
        self.assertEqual(code, 0, err)
        self.assertEqual(len(NEWS_IMAGE_RE.findall(self.read_post("vi"))), 2)

    def test_generate_items_out_guard_failure_writes_nothing(self):
        items_out = os.path.join(self.tmp.name, "items.json")
        with mock.patch.dict(os.environ, {"OPENCODE_API_KEY": "test-key"}), \
                mock.patch.object(generate, "call_llm", return_value='{"items": []}'):
            code, _, err = self.run_main(["generate", "--content-dir", self.content, "--now", self.NOW,
                                          "--clean", os.path.join(FIXTURES, "digest.clean.md"), "--items-out", items_out])
        self.assertEqual(code, 1)
        self.assertIn("FAIL", err)
        self.assertFalse(os.path.exists(items_out))

    def test_image_flags_rejected_outside_render(self):
        for argv in (["generate", "--clean", "x", "--images-out", self.images],
                     ["generate", "--clean", "x", "--no-images"],
                     ["render", "--clean", "x", "--items-json", "y", "--items-out", "z"]):
            with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit):
                generate.main(argv)


if __name__ == "__main__":
    unittest.main()
