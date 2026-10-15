Agent: reviewer

# Review — feature-ai-news-item-images · phase-1-task-01 · round 2 (CR-035)

- **Review level:** STRICT
- **Reason:** fetch URL ngoài trên runner (SSRF), parse HTML/ảnh không tin cậy, thread watchdog cắt socket (concurrency), output MDX lên prod không người duyệt.
- **Blast radius:** `tools/ai-news/og_image.py` (Fetcher: watchdog, `_connect_any`, `read1`), `tools/ai-news/image_sniff.py` (mới, tách từ og_image), `tools/ai-news/tests/test_og_image.py` (+ `RealSocketDeadlineTest`, `FakeResponse.read` ném lỗi), task file T01/T02 + run journal. `generate.py` không đổi logic so với round 1 (chỉ `import og_image`, `og_image` re-export `Image/ImageSkip/inspect_image`). Không đụng web runtime/DB/workflow.

## Verify commands + result
- `MSYS_NO_PATHCONV=1 docker run --rm -v "D:/prj/nta-web:/w" -w /w python:3.13-slim python -m unittest discover -s tools/ai-news/tests` → **Ran 76 tests, OK** (agent chính chạy; builder báo 3.12 cũng 76 OK). Reviewer không chạy được: `docker`/`python` ngoài allow-list, `pytest` không cài trên máy.
- `npm run typecheck` / `npm run lint`: N/A — diff không đụng TS/JS.
- Kiểm tĩnh: `git status`, `git diff`, Read `og_image.py` (299 dòng), `image_sniff.py` (79 dòng), test.

## Skill gates
- aislop / ocr / blitzstrike: skip (không có trong môi trường được phép).
- oxlint: N/A (không TS/JS). Responsive / ai-friendly-web: N/A.
- AI-readable: OK — cả 2 file ≤ 300 dòng, trách nhiệm tách rõ (fetch/guard vs nhận diện ảnh).

## Đối chiếu finding round 1
| Finding | Trạng thái | Bằng chứng |
|---|---|---|
| MAJOR-1 deadline không hiệu lực với http.client | **ĐÓNG** | `og_image.py:163-186` mỗi hop chạy dưới `threading.Timer(deadline-now)` → `_abort` `shutdown(SHUT_RDWR)`; mọi kết quả sau khi `expired` set (kể cả EOF giả/exception) → `ImageSkip("quá deadline")`. `PinnedHTTPSConnection.connect` (`:123-127`) gán `self.sock` trước `do_handshake()` → phủ pha TLS. Body dùng `read1` + `_timeout` mỗi vòng (`:222-239`). Test socket thật 127.0.0.1 nhỏ giọt header / body Content-Length / body chunked dừng < deadline+1.5 s; `FakeResponse.read` ném AssertionError buộc `read1`. Builder báo mutation tắt watchdog → test header-drip FAIL. |
| MINOR-1 chỉ pin `addresses[0]` | **ĐÓNG** | `resolve_public_ips` trả mọi IP (bỏ trùng), vẫn yêu cầu **tất cả** public trước khi thử bất kỳ IP nào; `_connect_any` chỉ thử trong tập đã kiểm, không resolve lại; mỗi IP mới tính lại `_timeout` → hết deadline thì không kết nối IP kế. |
| MINOR-2 file > 300 dòng | **ĐÓNG** | `og_image.py` 299 dòng, `image_sniff.py` 79 dòng. |
| MINOR-3 note T02 | **ĐÓNG** | `phase-1-task-02.md` Scope 1 thêm note chỉ lưu ảnh có trong `manifest.json`. |

## Kiểm lỗ mới do fix
- **Guard IP mọi IP thử:** OK — kiểm toàn bộ tập DNS trước vòng thử; không có đường nối tới IP chưa kiểm.
- **Test không nới guard code chạy thật:** OK — `RealSocketDeadlineTest` chỉ tiêm `connection_factory` (HTTP thường tới 127.0.0.1) và resolver trả IP public; không patch `is_public_ip`/`check_url`/module global. Mặc định `Fetcher()` vẫn `socket.getaddrinfo` + `PinnedHTTPSConnection`.
- **Đóng socket từ thread khác:** OK — `_abort` chỉ `shutdown` (không `close`) qua `socket.socket.shutdown` (bỏ qua override SSL), `close` vẫn ở thread chính trong `finally`. Socket đã `close()` có fd = -1 → `shutdown` ném OSError được nuốt, không có nguy cơ cắt nhầm fd tái sử dụng. `HTTPConnection.close()` đặt `self.sock=None` trước khi đóng.
- **Thread leak:** OK — 1 Timer/hop, `daemon=True`, `cancel()` trong `finally` của mọi đường thoát (kể cả exception từ `_exchange`).
- **Race watchdog nổ khi `conn.sock` chưa có:** xem MINOR-1 (r2) — cửa sổ rất hẹp, không chặn PASS.

## Findings

### [MINOR-1 r2] Watchdog một phát — nổ đúng lúc `conn.sock is None` thì mất bảo vệ cho handshake/header — `tools/ai-news/og_image.py:169-172, 130-134, 202-210`
`fire()` chỉ chạy 1 lần; nếu lúc đó `current[0].sock` còn `None` (đang trong `socket.create_connection`, hoặc giữa `conn.close()` IP trước và `current[:] = [conn]` IP sau) thì `_abort` no-op, `expired` set nhưng không ai kiểm lại cho tới `_read_body`. Nếu TCP connect hoàn tất ngay sau đó (timeout connect = `deadline - t0` nên chỉ có thể trễ hơn deadline vài µs–ms), pha TLS handshake + `getresponse` chạy chỉ với timeout per-recv ≤ 5 s → server nhỏ giọt vẫn giữ được lâu. Cửa sổ khai thác rất hẹp (attacker phải canh SYN-ACK trùng deadline tới cỡ µs–ms; Timer thường nổ trễ nên càng hẹp) → MINOR, không chặn PASS.
**Đề xuất (tuỳ chọn, có thể làm sau):** kiểm `expired` ngay sau khi `self.sock` được gán / sau `conn.connect()` và trước `conn.request` (raise "quá deadline"), hoặc `fire()` tự hẹn lại sau ~50 ms khi `sock is None` cho tới khi `_get_once` kết thúc. Ngoài ra khuyến nghị task-04 đặt `timeout-minutes` cho step render ảnh làm lưới an toàn cuối.

## Residual risk
- Pha TLS thật của `PinnedHTTPSConnection` (shutdown socket nền khi đang `do_handshake`) chỉ kiểm bằng lập luận + test lớp mock; test socket thật dùng HTTP thường. Hành vi CPython/OpenSSL chuẩn (SSL op trả lỗi khi fd bị shutdown) → chấp nhận.
- Các residual round 1 giữ nguyên: chưa fetch mạng thật; ảnh chỉ kiểm header (polyglot) — phụ thuộc `nosniff`/Content-Type theo ext ở task-02/03; `html.parser` trên HTML độc hại phụ thuộc bản vá CPython.
- Reviewer không tự chạy test; dựa vào kết quả 76 OK của agent chính.

## Verdict
✅ **PASS** — MAJOR-1 và 3 MINOR round 1 đã đóng có bằng chứng; fix không mở lỗ SSRF/leak mới. Còn 1 MINOR (race watchdog cửa sổ rất hẹp) để cân nhắc, không chặn commit.
