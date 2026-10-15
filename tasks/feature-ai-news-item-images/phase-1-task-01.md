# feature-ai-news-item-images · phase-1-task-01 — generate.py lấy og:image từng tin (fetch an toàn) + render ảnh vào MDX

- **CR:** CR-035 · change doc `spec/changes/2026-10-15-ai-news-item-images.md` · liên quan CR-019 (R-09c), CR-034 (4.2.1 publish-db), CR-031 R-16d (upload)
- **Classification / Risk:** ADDITIVE (pipeline nội dung tự động) · **HIGH**
  - Expected review level: **STRICT** — fetch URL ngoài trên runner VPS (SSRF), parse dữ liệu không tin cậy (HTML/ảnh), output lên prod không người duyệt.
  - Blast radius: `tools/ai-news/generate.py`, module mới `tools/ai-news/og_image.py` (stdlib), `tools/ai-news/tests/*` (+ fixture ảnh nhỏ). Không đổi web runtime, DB, workflow (task-04).
  - Doc impact: `tools/ai-news/README.md` (ranh giới tin cậy + bước ảnh) — làm ở task-04 cùng runbook.
  - Decision impact: append `.context/decisions.md` (fetch ảnh trong job `digest` không secret DB; ảnh chuyển sang `publish-db` qua artifact).
  - Migration gate: không áp dụng.

## Quyết định user (2026-10-15)
Q1 chấp nhận rủi ro bản quyền + runbook gỡ ảnh · Q2 "Ảnh: <tên miền>" dưới ảnh + chú thích cuối bài · Q3 bỏ GIF · Q4 tự bỏ ảnh trùng. Plan đã duyệt.

## Sửa sau spec-validation round 1 (C1, W3 — bắt buộc)
- **C1:** MDX 3 KHÔNG map JSX viết thẳng (`<img>` thường) sang `components.img` (`@mdx-js/mdx/lib/plugin/recma-jsx-rewrite.js:177-180`). → Render ảnh bằng component viết hoa **`<NewsImage src="/uploads/<sha>.<ext>" alt="…" width="W" height="H" />`** (đăng ký trong `mdxComponents` ở T03). Thay cho thẻ `<img>` ở Scope §5. Regex I-7 (`content-rules.ts:222`) vẫn bắt `src="/uploads/…"`.
- **W3a tách secret:** fetch ảnh KHÔNG chạy trong process có `OPENCODE_API_KEY`. Thêm `generate --items-out <file>` (LLM + guard, ghi JSON tin đã qua guard, không ghi MDX); bước sau `render --clean … --items-json <file> --images-out <dir>` (không key) fetch ảnh + ghi MDX. `generate` không `--items-out` giữ hành vi cũ.
- **W3b:** chặn thêm NAT64 `64:ff9b::/96`, `64:ff9b:1::/48`, 6to4 `2002::/16`, Teredo `2001::/32` (và IPv4 nhúng) dù `is_global`; IPv4-mapped xét IPv4 bên trong bằng code riêng (không dựa `is_global` khác nhau giữa 3.12/3.13).
- **W3c:** ngoài timeout socket 5 s, mỗi request có **deadline tổng 10 s** (đọc từng chunk, quá hạn → bỏ) chống nhỏ giọt.
- **W3d:** chạy test bằng `python:3.13-slim` (khớp container `node:22-trixie`), thêm 3.12 nếu rẻ.

## Scope
1. **Chỉ fetch URL tin đã qua guard**: sau `validate_items` (URL gốc lấy từ dòng `- URL:` của `.clean.md`), tuần tự từng tin, best-effort. Không fetch URL nào khác ngoài URL tin + URL `og:image` của chính trang đó.
2. **Guard mạng (`og_image.py`)** — áp cho MỌI hop (trang tin, mỗi redirect, URL ảnh):
   - chỉ `https`, port 443 (hoặc không ghi port); không userinfo (`user@host`); IP literal chỉ nhận nếu global.
   - resolve DNS (`getaddrinfo`) → **mọi** địa chỉ phải `ipaddress.ip_address(x).is_global` (loại loopback, private, link-local 169.254.0.0/16 gồm metadata, CGNAT 100.64.0.0/10, multicast, reserved, ULA fc00::/7, IPv4-mapped `::ffff:x` xét theo IPv4 bên trong); kết nối **đúng IP đã kiểm** (pin IP, SNI + verify cert theo hostname) → chống DNS rebinding.
   - redirect xử lý tay (không auto-follow), tối đa **3** hop, mỗi hop kiểm lại từ đầu; `https→http` = từ chối.
   - timeout connect/read **5 s**/request; ngân sách tổng bước ảnh **≤ 90 s** (hết → tin còn lại không ảnh).
   - bỏ qua proxy env (`ProxyHandler({})`), User-Agent `nta-web-ai-news/1.0`, không gửi cookie/Authorization.
   - HTML: chỉ đọc khi `Content-Type` text/html, đọc tối đa **512 KB** đầu, parse bằng `html.parser` chỉ lấy `<meta property="og:image">` / `og:image:secure_url` / `name="twitter:image"` (thứ tự ưu tiên); URL tương đối resolve theo URL cuối sau redirect. **HTML không bao giờ đi tới LLM, không ghi ra đĩa, không log.**
   - ảnh: đọc tối đa **2 MB** (đếm byte thật, không tin `Content-Length`); **không tin `Content-Type`**: kiểm magic bytes + đọc kích thước **JPEG/PNG/WebP**, đồng bộ quy tắc `src/lib/uploads/image-file.ts` (cạnh 1..8192 px). GIF/SVG/AVIF/HEIC → bỏ (xem Q3 change doc). Thêm cạnh tối thiểu **200 px** (loại favicon/pixel).
3. **Lọc ảnh vô nghĩa**: cùng sha256 ở ≥ 2 tin → bỏ ảnh ở tất cả các tin đó (logo chung của site).
4. **Lưu tạm**: `--images-out <dir>` ghi `<sha256>.<ext>` + `manifest.json` `{slug, images:[{file, sha256, ext, width, height, bytes, sourceHost, alt:{vi,en}}]}`. Đường dẫn trong bài = `/uploads/<sha256>.<ext>` — **trùng tuyệt đối** tên `storeImageFile` sẽ tạo (sha256 hex thường + `jpg|png|webp`).
5. **Render MDX** (deterministic, vi + en), ngay dưới `## N. <tiêu đề>`:
   `<NewsImage src="/uploads/<sha>.<ext>" alt="<tiêu đề tin theo locale>" width="<W>" height="<H>" />` rồi dòng ghi nguồn ảnh (dạng theo Q2 — mặc định `*Ảnh: <host nguồn>*` / `*Image: <host>*`, host lấy từ URL tin, không link).
   `alt` escape an toàn cho thuộc tính JSX (`&`, `"`, `<`, `>`, `{`, `}` → character reference; không xuống dòng). Không có ảnh → render y như hiện nay.
   Footnote cuối bài thêm câu (vi/en) "Ảnh minh hoạ thuộc về trang nguồn của từng tin." khi bài có ≥ 1 ảnh.
6. **Không bao giờ fail bài vì ảnh**: lỗi ảnh = log `[ai-news] ảnh tin #N bỏ: <lý do ngắn>` → tin đó chỉ text. Guard hiện có (URL allow-list, số tin, độ dài) giữ nguyên; xem lại `BODY_MAX` nếu dòng `<NewsImage>` làm vượt.
7. Cờ `--no-images` (và tự tắt khi không có `--images-out`) để test offline / tắt khẩn cấp.

**KHÔNG:** đổi prompt/LLM input, đưa URL ảnh/HTML cho LLM, hotlink ảnh ngoài, đụng bài tuần cũ, đổi `check`/dedupe.

## Tests (unittest stdlib, không ra Internet — inject resolver + opener/connection giả)
- `http://`, port lạ, userinfo, IP literal private → từ chối trước khi kết nối.
- DNS trả 127.0.0.1 / 10.x / 172.16.x / 192.168.x / 169.254.169.254 / 100.64.x / `::1` / `fd00::` / `::ffff:127.0.0.1` → từ chối; 1 IP public + 1 IP private → từ chối.
- Redirect tới host private / tới http / quá 3 hop → từ chối; redirect hợp lệ → theo, kiểm lại guard.
- Kết nối dùng đúng IP đã resolve (resolver lần 2 trả IP khác không được dùng).
- HTML > 512 KB chỉ đọc phần đầu; thứ tự ưu tiên meta; og:image tương đối; không meta → không ảnh.
- Ảnh > 2 MB (Content-Length sai) → bỏ; magic bytes sai / SVG / GIF / HTML giả `.jpg` → bỏ; 16×16 → bỏ; JPEG/PNG/WebP hợp lệ → đúng sha256, ext, W×H.
- 2 tin cùng ảnh → cả hai không ảnh. Timeout / hết ngân sách → tin còn lại không ảnh, bài vẫn ghi.
- Render: alt chứa `"<>{}&*_` → MDX hợp lệ; bài không ảnh giống hệt output cũ (fixture hiện có không đổi).
- 26 test cũ vẫn PASS.

## Acceptance
- [ ] Tin có og:image hợp lệ → MDX vi + en có `<NewsImage src="/uploads/<sha>.<ext>" …/>` + dòng nguồn ảnh; file ảnh + manifest ở `--images-out`.
- [ ] Mọi guard SSRF/size/format có test; không có đường fetch nào bỏ qua guard.
- [ ] Lỗi ảnh không làm fail bài; `--no-images` = hành vi cũ.

## Verification plan
- `python -m unittest discover -s tools/ai-news/tests` (docker `python:3.12-slim` như README).
- `render` offline với fixture + opener giả → đọc MDX sinh ra.
- (Tuỳ chọn, máy dev có mạng) 1 lượt fetch thật vài URL tin tuần w42 → kiểm tay ảnh.

## Retry / Escalation
Attempt 1 fail → `.agent/error-analyzer.md`, fix tối thiểu · Attempt 2 → so pattern đang chạy, kiểm lại assumption · Attempt 3 fail → `architecture_review_needed`, dừng. Interrupted ≠ failed attempt. Mỗi attempt fail append `.context/error-memory.md`.

## Verification summary
_(builder, 2026-10-15 — chờ reviewer STRICT)_
- **File:** mới `tools/ai-news/og_image.py` (guard URL/IP, `Fetcher` pin IP + redirect tay + deadline, parse meta, nhận diện ảnh, `collect_images` ngân sách 90 s + bỏ ảnh trùng); sửa `tools/ai-news/generate.py` (`generate --items-out`, `render --images-out/--no-images`, `<NewsImage …/>` + dòng nguồn + chú thích cuối bài, `write_images` + `manifest.json`); test mới `tools/ai-news/tests/test_og_image.py` (44 test, ảnh tổng hợp trong code — không thêm fixture nhị phân).
- `docker run python:3.13-slim python -m unittest discover -s tools/ai-news/tests` → **70 test OK** (26 cũ + 44 mới). `python:3.12-slim` → **70 OK**; riêng `test_ai_news.py` → 26 OK.
- Golden: `render` (không ảnh) bằng `generate.py` ở HEAD vs bản mới trên fixture → vi/en **byte-identical**.
- MDX: bài có ảnh (alt chứa `"<>{}&*_` + `</NewsImage>`) compile bằng `@mdx-js/mdx` của repo → 2 lời gọi `_jsx(NewsImage, {src, alt, width, height})`, alt giải mã đúng chuỗi gốc, 0 thẻ `img` thô.
- `npm run typecheck` / `npm run lint`: skip — task không đụng TS/JS.
- Không fetch mạng thật (resolver/connection/clock giả); không chạy workflow.
- Ghi chú triển khai: dùng `http.client.HTTPSConnection` (connect tới IP đã kiểm, SNI + verify cert theo hostname) thay `urllib` + `ProxyHandler({})` — `http.client` vốn không đọc proxy env, không gửi cookie/Authorization. Deadline 10 s tính cho cả chuỗi redirect của 1 lần lấy (trang hoặc ảnh), chặt hơn "mỗi hop". `sourceHost` bỏ tiền tố `www.`. Nếu bài có ảnh vượt guard độ dài → tự render lại không ảnh (không fail bài). `generate --items-out` in `status=items`.
- Residual risk: URL og:image chứa khoảng trắng/ký tự điều khiển → `http.client` từ chối → tin không ảnh (chấp nhận); ảnh JPEG progressive/CMYK chỉ đọc header, không decode — nhất quán `image-file.ts`; chưa kiểm fetch thật (tuỳ chọn, máy dev có mạng).

**Sửa sau review round 1 (FAIL — `.context/review-reports/feature-ai-news-item-images-phase-1-task-01-round-1-review.md`):**
- MAJOR-1: mỗi hop chạy dưới watchdog `threading.Timer` (hết deadline → `shutdown(SHUT_RDWR)` socket, phủ connect + TLS + header + body; mọi kết quả sau khi watchdog nổ, kể cả EOF giả → `quá deadline`). `PinnedHTTPSConnection` gán `self.sock` trước `do_handshake()` (`do_handshake_on_connect=False`) để cắt được pha TLS. Body đọc bằng `read1(n)` (≤ 1 recv/lần) + kiểm deadline mỗi vòng. `FakeResponse.read` giờ ném lỗi (bắt buộc `read1`). Thêm 4 test socket thật 127.0.0.1 (`RealSocketDeadlineTest`, deadline 1 s): nhỏ giọt header / body Content-Length / body chunked → dừng < 2.5 s; server nhanh vẫn đọc đúng. Mutation: tắt watchdog → test header-drip treo 20 s và FAIL (test có giá trị).
- MINOR-1: `resolve_public_ips` trả mọi IP đã kiểm (bỏ trùng); `_connect_any` thử lần lượt, không resolve lại; test IPv6 không tới được → IPv4, tất cả không tới được → `không kết nối được`.
- MINOR-2: tách nhận diện ảnh sang `tools/ai-news/image_sniff.py` (79 dòng); `og_image.py` 299 dòng (re-export `Image`/`ImageSkip`/`inspect_image`).
- MINOR-3: thêm note vào `phase-1-task-02.md` (chỉ lưu ảnh có trong manifest, không quét thư mục).
- `docker run python:3.13-slim python -m unittest discover -s tools/ai-news/tests` → **76 OK** (26 cũ + 50 mới, 3.5 s); `python:3.12-slim` → **76 OK**.
