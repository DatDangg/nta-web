Agent: reviewer

# Review — feature-ai-news-item-images · phase-1-task-01 · round 1 (CR-035)

- **Review level:** STRICT
- **Reason:** fetch URL ngoài trên runner (SSRF), parse HTML/ảnh không tin cậy, output MDX lên prod không người duyệt, tách secret generate/render.
- **Blast radius:** `tools/ai-news/og_image.py` (mới), `tools/ai-news/generate.py` (`generate --items-out`, `render --images-out/--no-images`, `render_post`, `publish`), `tools/ai-news/tests/test_og_image.py`. Không đụng web runtime/DB/workflow. Hạ nguồn: task-02 (`publish-post --images-dir` đọc manifest), task-03 (`NewsImage`), task-04 (workflow).

## Verify commands + result
- `python -m unittest discover -s tools/ai-news/tests` qua `docker run python:3.13-slim`: reviewer KHÔNG chạy được (`docker` không nằm trong allow-list bash của reviewer) → dùng kết quả agent chính: **70 OK** (26 cũ + 44 mới); builder báo 3.12 cũng 70 OK.
- `npm run typecheck` / `npm run lint`: N/A — diff không đụng TS/JS.
- Kiểm tĩnh bằng `git diff` + Read.

## Skill gates
- aislop: skip, không có trong môi trường được phép chạy.
- oxlint (anti-slop): N/A — không có TS/JS.
- ocr (open-code-review): skip, ocr not installed.
- AI-readable: OK (1 indicator: `og_image.py` 316 dòng > 300 — xem MINOR-2; tên rõ, hàm ngắn, không indirection sâu).
- ai-friendly-web: N/A (tool nội bộ).
- blitzstrike: skip (không có môi trường được phép).
- Responsive Checklist Gate: N/A — không đụng UI (component `NewsImage` thuộc task-03).

## Đối chiếu yêu cầu
| Mục | Kết quả |
|---|---|
| C1 `<NewsImage …/>` thay `<img>` | OK — `generate.py` `_image_lines`; `src="/uploads/<sha>.<ext>"` khớp regex I-7 |
| W3a tách secret (`generate --items-out` / `render --images-out`) | OK — cờ ảnh bị từ chối ngoài `render`; render tái guard với `.clean.md` |
| W3b NAT64/6to4/Teredo + IPv4-mapped tự xét | OK — `og_image.py:36-65` |
| W3c deadline tổng 10 s chống nhỏ giọt | **FAIL** — xem MAJOR-1 |
| W3d test 3.13 (+3.12) | OK (theo báo cáo agent chính/builder) |
| https/443/userinfo/IP literal | OK — `check_url`; IP dạng thập phân/hex (`2130706433`) đi qua getaddrinfo rồi bị chặn ở bước kiểm địa chỉ resolve |
| Mọi IP DNS public + pin IP + SNI/verify cert theo hostname | OK — `resolve_public_ip`, `PinnedHTTPSConnection` (default context, `check_hostname=True`) |
| Redirect tay ≤ 3, kiểm lại mỗi hop, https→http từ chối | OK — `Fetcher.get` |
| Proxy/cookie/Authorization | OK — `http.client` không đọc proxy env; header chỉ UA + Accept; `Accept-Encoding: identity` mặc định → không có gzip bomb |
| HTML ≤ 512 KB, chỉ meta, không log/ghi đĩa/LLM | OK — log chỉ lý do ngắn / tên lớp exception, không URL/HTML |
| Ảnh ≤ 2 MB đếm byte thật, magic bytes JPEG/PNG/WebP, 200..8192 | OK — `inspect_image`; parser JPEG luôn tiến offset, không lặp vô hạn |
| Path traversal `--images-out` | OK — tên file = sha256 hex + ext cố định; thư mục do CLI (tin cậy) |
| Escape alt JSX | OK — `& " < > { }` → character reference, gộp whitespace/xuống dòng; builder đã compile thử `@mdx-js/mdx` |
| Không fail bài vì ảnh | OK — `collect_images` bắt mọi `Exception`; vượt `BODY_MAX` → render lại không ảnh |
| Bài không ảnh giống output cũ | OK — `render_post` không ảnh giữ nguyên thứ tự dòng; footnote chỉ đổi khi có ảnh |
| Ảnh trùng sha256 ≥ 2 tin → bỏ cả | OK |

## Đánh giá deviation của builder
1. **`http.client` pin IP thay `urllib` + `ProxyHandler({})`** — CHẤP NHẬN. Đúng hơn yêu cầu gốc: urllib không pin IP được; `http.client` không đọc proxy env, không gửi cookie.
2. **Deadline 10 s cho cả chuỗi redirect** — CHẤP NHẬN về thiết kế (chặt hơn mỗi hop). Nhưng thực thi deadline bị hỏng với `http.client` thật → MAJOR-1.
3. **`sourceHost` bỏ `www.`** — CHẤP NHẬN (hiển thị "tên miền"), nhất quán giữa MDX và manifest (cùng `source_host`).
4. **Vượt `BODY_MAX` → render lại không ảnh** — CHẤP NHẬN, khớp Scope §6 "không bao giờ fail bài vì ảnh"; có log.

## Findings

### [MAJOR-1] Deadline 10 s / ngân sách 90 s không chặn được server nhỏ giọt — `tools/ai-news/og_image.py:181` (+ test sai giả định `tools/ai-news/tests/test_og_image.py:79-85, 286-294`)
`_read_body` kiểm deadline **giữa** các lần `response.read(min(64 KB, …))`. Với `http.client.HTTPResponse` thật, `read(amt)` gọi `BufferedReader.read(amt)` (hoặc `_read_chunked`/`_safe_read`) — **chặn tới khi đủ `amt` byte hoặc EOF**, phát nhiều `recv` nội bộ. `sock.settimeout(≤5 s)` chỉ giới hạn từng `recv`, nên server gửi 1 byte mỗi ~4 s giữ một lần `read()` sống tới ~65536 × 4 s mà không lần kiểm deadline nào chạy. Tương tự với pha header (`getresponse`, tới 100 header × 64 KB) và TLS handshake. Hệ quả: một URL tin (hoặc og:image do trang đó trỏ tới) treo cả job `digest` vượt xa 10 s/90 s — đúng kịch bản W3c bắt buộc chặn.
Test `test_slow_drip_body_stops_at_request_deadline` dùng `FakeResponse.read(size)` trả 1 byte/lần → mô phỏng sai ngữ nghĩa `http.client`, cho false confidence.
**Fix đề xuất:** (a) đọc body bằng `response.read1(n)` (tối đa 1 syscall mỗi lần → mỗi vòng ≤ timeout ≤ thời gian còn lại, rồi kiểm deadline); **và** (b) watchdog phủ cả handshake/header: vd `threading.Timer(remaining, lambda: conn.sock and conn.sock.shutdown(socket.SHUT_RDWR))` bật trong `_get_once`, huỷ ở `finally` (hoặc socket wrapper tự kiểm deadline mỗi `recv`). Test: sửa `FakeResponse` để `read(n)` chỉ trả khi đủ n/EOF (đúng ngữ nghĩa BufferedReader) và assert dùng `read1`, hoặc thêm 1 test tích hợp với socket server cục bộ nhỏ giọt (inject connection factory HTTP thường tới server test) chứng minh dừng ≤ deadline.

### [MINOR-1] `resolve_public_ip` luôn pin `addresses[0]` — `tools/ai-news/og_image.py:113`
Nếu bản ghi đầu là IPv6 mà runner không có IPv6 → kết nối lỗi → tin mất ảnh dù có IPv4 hợp lệ. Không phải lỗ bảo mật (mọi IP đều đã kiểm). Đề xuất: thử lần lượt các địa chỉ đã kiểm (vẫn chỉ trong tập đã kiểm), hoặc ưu tiên IPv4.

### [MINOR-2] `tools/ai-news/og_image.py` 316 dòng (> 300 dòng theo chuẩn reviewer)
Có thể tách phần nhận diện ảnh (`_png_size`/`_jpeg_size`/`_webp_size`/`inspect_image`) sang module riêng khi sửa MAJOR-1. Không chặn PASS riêng.

### [MINOR-3] Ghi chú cho task-02 — `tools/ai-news/generate.py` `write_images`
Thư mục `--images-out` có thể còn file `<sha>.<ext>` từ lần chạy trước; manifest chỉ liệt kê ảnh lần này. Task-02 phải chỉ lưu ảnh có trong `manifest.json` (không glob thư mục). Không phải lỗi task này.

## Residual risk
- Chưa fetch mạng thật (đúng phạm vi); TLS/SNI thật chỉ kiểm qua test lớp `PinnedHTTPSConnection`.
- Ảnh chỉ kiểm header (không decode) — polyglot JPEG+HTML có thể lọt; an toàn phụ thuộc cách `/uploads` phục vụ (Content-Type theo ext + `nosniff`) ở task-02/03.
- `html.parser` trên 512 KB HTML độc hại: phụ thuộc bản vá CPython của image `node:22-trixie`.
- Reviewer không tự chạy test (docker ngoài allow-list); dựa vào kết quả 70 OK của agent chính.

## Verdict
❌ **FAIL** — 1 MAJOR (MAJOR-1: W3c deadline chống nhỏ giọt không có hiệu lực với `http.client` thật, test mô phỏng sai). Các guard SSRF còn lại, escape alt, tách secret, fallback không ảnh đạt yêu cầu. Sửa MAJOR-1 (+ test đúng ngữ nghĩa) rồi review round 2.
