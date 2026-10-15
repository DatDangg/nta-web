---
id: ai-news-item-images
type: feature
status: in_progress
created: 2026-10-15
cr: CR-035
classification: ADDITIVE
risk: HIGH
---

# Bản tin AI tuần: thêm ảnh cho từng tin (không chỉ text)

## Yêu cầu
Bản tin AI tuần (CR-019, spec R-09c) hiện chỉ có text + ảnh bìa SVG cố định (`/images/blog/ai-weekly-cover.svg`).
User muốn **mỗi tin có ảnh minh hoạ** lấy từ trang nguồn của tin đó (vi + en).

Hướng đã chốt với user (15/10): lấy ảnh đại diện (`og:image` / `twitter:image`) của URL nguồn từng tin,
tải về lưu thành ảnh của site (`/uploads/<hash>.<ext>`, qua `content-cli upload`), chèn dưới tiêu đề tin.
Ảnh bìa bài giữ nguyên SVG cố định.

## Bối cảnh / tái hiện (bug)
- Không áp dụng (feature).

## Acceptance (bắt buộc)
- [ ] Mỗi tin có `og:image` hợp lệ ở trang nguồn → bài vi + en hiện ảnh dưới tiêu đề tin, alt = tiêu đề tin theo ngôn ngữ.
- [ ] Ảnh được tải về và phục vụ từ domain site (`/uploads/...`), KHÔNG hotlink ảnh ngoài.
- [ ] Tin không lấy được ảnh (không có og:image, timeout, sai định dạng, quá dung lượng) → vẫn đăng, chỉ hiện text; không làm fail cả bài.
- [ ] Bài các tuần cũ không bị đổi.
- [ ] Ghi nguồn ảnh (ảnh thuộc trang nguồn) gần ảnh hoặc ở chú thích cuối bài.

## Ghi chú
- Pipeline: `tools/ai-news/generate.py` (render MDX), `.github/workflows/ai-news.yml` (job digest + publish-db), `tools/db/publish-post.ts`, `tools/db/content-cli.ts` (`upload`).
- Bảo mật (runner VPS): chỉ fetch đúng URL tin đã qua guard; chỉ https; chặn IP nội bộ/localhost (SSRF); giới hạn redirect, timeout, dung lượng (vd ≤ 2 MB); kiểm tra magic bytes là ảnh (jpg/png/webp/gif) — không tin `Content-Type`; không bao giờ đưa HTML trang nguồn cho LLM.
- Bản quyền: og:image là ảnh xem trước do trang nguồn công bố để chia sẻ link; vẫn cần ghi nguồn. Cần xác nhận chấp nhận rủi ro này (BR-004).
- Có thể cần đổi `next/image` (localPatterns `/uploads/**` đã có) và trang chi tiết blog render ảnh trong MDX.

---

## Phân tích (change-request, 2026-10-15)

### Classification / Risk
- **ADDITIVE** (thêm bước ảnh vào pipeline R-09c; không bỏ/đổi hành vi hiện có — tin không ảnh render y như cũ, bài cũ không đổi).
- **Risk: HIGH** · review **STRICT**:
  - **SSRF / security**: runner self-hosted trên VPS dùng chung fetch URL do Internet cung cấp (URL tin lấy từ Reddit/HN/GitHub… và URL `og:image` do trang đích tự khai) → có thể bị trỏ vào `127.0.0.1:3005` (nta-web), `nta-db`, docker bridge `172.17.0.1`, metadata `169.254.169.254`, dịch vụ khác trên VPS; DNS rebinding; redirect tới IP nội bộ; file khổng lồ / slow-loris; file "ảnh" là HTML/SVG có script.
  - Dữ liệu không tin cậy (bytes ảnh) đi vào volume `/uploads` + bảng `content_entries` (asset) prod không người duyệt.
  - Shared write-path (`saveImage`, `createEntry`, I-7) + shared component `ArticleImage`.
  - Bản quyền ảnh (xem Q1).

### Hiện trạng code (đã đọc)
- `tools/ai-news/generate.py`: guard URL allow-list → `render_post` (MDX deterministic, chỉ text + `Nguồn: [..](url)`), cover cố định `COVER`; không fetch gì ngoài LLM.
- `.github/workflows/ai-news.yml`: job `digest` (container `node:22-trixie`, không docker, không secret DB) → commit seed; job `publish-db` (host, secret DB) → `publish-post --dry-run` → backup → `publish-post --confirm-prod` → revalidate → smoke.
- `tools/db/publish-post.ts`: validate 2 locale (`findNewEntryProblems`, gồm **I-7**: ảnh `/uploads/*` phải là asset còn sống trong DB — `src/db/content-repo.ts:127-146`) rồi `createEntry`.
- `content-cli upload` → `saveImage` (`src/lib/uploads/save-image.ts`) → `storeImageFile`/`inspectImage` (`src/lib/uploads/image-file.ts`): **chỉ JPEG/PNG/WebP** (magic bytes), ≤ 5 MB, ≤ 8192 px, tên `/uploads/<sha256>.<ext>`, asset slug = sha256.
- Render: `[locale]/blog/[slug]/page.tsx` → `RenderMdx` (next-mdx-remote v6) + `mdxComponents.img = ArticleImage` — chỉ dùng `next/image` khi width/height là `number` (MDX truyền chuỗi → fallback `<img>`). `next.config` `images.localPatterns` đã có `/uploads/**`; route `src/app/uploads/[...path]` phục vụ từ `UPLOAD_DIR`.
- BR-004 trong repo (`.context/design-spec.md`) là luật **tên/thông tin khách hàng chỉ khi được phép** — không nói về bản quyền ảnh bên thứ ba → rủi ro bản quyền og:image là điểm mới, cần user chấp nhận rõ (Q1).

### Phương án (đề xuất)
- **Ai fetch og:image:** `generate.py` trong job `digest` (đã là nơi xử lý dữ liệu ngoài, **không có secret DB/revalidate, không docker socket**). Không fetch trong `publish-db` (job có secret DB, chạy trên mạng compose cạnh `nta-db`).
- **Đường dẫn ảnh tất định:** `generate.py` tự tính `sha256` + đuôi theo magic bytes → ghi thẳng `/uploads/<sha256>.<ext>` vào MDX = đúng tên `storeImageFile` sẽ tạo.
- **Chuyển ảnh sang publish-db:** `actions/upload-artifact` (`ai-news-images-<slug>`, 7 ngày) → `download-artifact` ở `publish-db` → mount ro vào `nta-tools`.
- **Ghi ảnh:** KHÔNG gọi `content-cli upload` N lần (dry-run sẽ đỏ vì I-7 trước khi asset tồn tại, hoặc phải ghi DB trước backup). Thêm cờ `publish-post --images-dir <dir>` **tái dùng `saveImage`** (cùng hàm của `upload`): dry-run validate ảnh (magic bytes, hash == tên file) + I-7 coi ảnh sắp upload là hợp lệ → backup → upload ảnh → `createEntry` 2 locale. Idempotent (trùng hash → reused).
- **Render:** dưới `## N. <tiêu đề>`: `<img src="/uploads/<sha>.<ext>" alt="<tiêu đề tin>" width="W" height="H" />` + dòng ghi nguồn ảnh; `ArticleImage` nhận width/height dạng chuỗi số → `next/image` (tối ưu, không CLS).

### Guard bảo mật (bắt buộc, có test từng cái — task-01)
1. Chỉ fetch URL tin **đã qua guard** (allow-list `.clean.md`) + URL `og:image`/`twitter:image` của chính trang đó. Không gì khác.
2. Chỉ `https`, port 443, không userinfo; `https→http` khi redirect = từ chối.
3. Chặn IP không-global (loopback, RFC1918, link-local/metadata 169.254/16, CGNAT 100.64/10, multicast, reserved, ULA, IPv4-mapped IPv6) — kiểm **mọi** địa chỉ DNS trả về, **pin IP đã kiểm** khi kết nối (chống DNS rebinding), kiểm lại **mỗi hop redirect**.
4. Redirect tối đa 3; timeout 5 s/request; ngân sách tổng ≤ 90 s; bỏ qua proxy env; không cookie/Authorization.
5. HTML đọc ≤ 512 KB, chỉ parse thẻ `<meta>`; **HTML không bao giờ tới LLM, không ghi đĩa, không log**.
6. Ảnh ≤ **2 MB** (đếm byte thật); **magic bytes** JPEG/PNG/WebP + đọc kích thước (1..8192 px, tối thiểu 200 px) — không tin `Content-Type`/đuôi; lớp thứ 2 ở `publish-post` (`inspectImage` + hash == tên file).
7. Cùng ảnh ở ≥ 2 tin → bỏ (logo chung).
- **Fallback:** mọi lỗi ảnh → tin đó chỉ text, log lý do ngắn; không bao giờ fail bài vì ảnh. Tắt khẩn cấp: biến `AI_NEWS_IMAGES=off` → `--no-images`.
- **Ghi nguồn ảnh:** mặc định dòng nhỏ ngay dưới ảnh `*Ảnh: <host trang nguồn>*` / `*Image: <host>*` + câu footnote "Ảnh minh hoạ thuộc về trang nguồn của từng tin." (chờ Q2).
- **Bài cũ không đổi:** chỉ bài tuần mới mang ảnh; `publish-post` gặp bản ghi `exists` → không upload, không ghi.

### Spec delta (đề xuất — áp vào `SPECIFICATIONS.md` R-09c sau khi user duyệt; MINOR 4.2.1 → **4.3.0**)
Thêm gạch đầu dòng vào R-09c (sau *Viết bài*):
> - *Ảnh từng tin (4.3.0 — CR-035):* sau guard URL, `generate.py` (job `digest`, không secret DB) lấy `og:image`/`twitter:image` của **chính URL tin**
>   với guard SSRF (https-only, chặn IP không-global kể cả sau DNS/redirect, pin IP, ≤ 3 redirect, timeout, HTML ≤ 512 KB chỉ đọc meta,
>   HTML không tới LLM) → tải ảnh ≤ 2 MB, chỉ JPEG/PNG/WebP theo magic bytes, ≥ 200 px; ảnh trùng giữa các tin bị bỏ.
>   Bài vi + en chèn ảnh dưới tiêu đề tin (`/uploads/<sha256>.<ext>`, alt = tiêu đề tin theo locale) + ghi nguồn ảnh; **không hotlink**.
>   Tin không lấy được ảnh → chỉ text; lỗi ảnh không làm fail bài. Ảnh bìa giữ SVG cố định.
- Bước *Đăng vào DB* (1)/(3): `publish-post --images-dir` validate ảnh (magic bytes, sha256 == tên file) trong dry-run; sau backup lưu ảnh qua `saveImage`
  (asset có version, actor `workflow:ai-news`) **trước** khi chèn bài; bài `exists` → không đụng ảnh. Ảnh chuyển digest → publish-db qua artifact 7 ngày.
- Không đổi: schema DB, R-16d (upload), cover, guard text/URL hiện có, bài các tuần trước.
- Spec Publisher chạy **sau khi user duyệt plan** (bump 4.3.0 + `spec/updates/2026-10-15-ai-news-item-images.md` + CHANGELOG + test-scope v52).

### Plan (phase 1, tuần tự)
| Task | File | Việc | Risk / review |
|---|---|---|---|
| T01 | `tasks/feature-ai-news-item-images/phase-1-task-01.md` | `generate.py` + `og_image.py`: fetch og:image an toàn, kiểm ảnh, render `<img>` + nguồn, manifest | HIGH / STRICT |
| T02 | `tasks/feature-ai-news-item-images/phase-1-task-02.md` | `publish-post --images-dir`: validate + `saveImage` trước `createEntry` | HIGH / STRICT |
| T03 | `tasks/feature-ai-news-item-images/phase-1-task-03.md` | `ArticleImage` nhận width/height chuỗi → next/image; style dòng nguồn | MEDIUM / STRICT (shared) |
| T04 | `tasks/feature-ai-news-item-images/phase-1-task-04.md` | `ai-news.yml` artifact digest → publish-db + runbook/README/DESIGN | HIGH / STRICT |
Hết phase → spec-validator → Spec Publisher → close-out. Lượt kiểm thật trên prod: cron 19/10 (w43).

### Câu hỏi chờ user (mỗi câu có mặc định)
- **Q1 (bắt buộc) Bản quyền:** og:image của báo lớn (Guardian, SCMP, Ars…) thường là ảnh có bản quyền (Getty/Reuters/AP). Lưu lại trên site = tái bản ảnh, rủi ro gỡ/khiếu nại. Anh **chấp nhận rủi ro này** không? *Mặc định đề xuất:* chấp nhận + ghi nguồn + runbook cách gỡ 1 ảnh khi bị yêu cầu (xoá mềm asset + sửa bài qua `db:cli update`).
- **Q2 Cách ghi nguồn:** *mặc định:* dòng nhỏ ngay dưới mỗi ảnh "Ảnh: <tên miền nguồn>" **và** 1 câu ở chú thích cuối bài. Thay thế: chỉ chú thích cuối bài.
- **Q3 GIF:** pipeline upload hiện chỉ nhận JPEG/PNG/WebP (`inspectImage`). *Mặc định:* **bỏ GIF** (tin đó chỉ text), không mở rộng R-16d. Thay thế: thêm GIF vào upload (đổi R-16d, ảnh động nặng, ngoài scope).
- **Q4 Nguồn ảnh logo chung:** tin GitHub (ảnh card tự sinh `opengraph.githubassets.com`) và arXiv (logo) — *mặc định:* giữ GitHub card, bỏ ảnh trùng giữa các tin (logo) tự động; không thêm deny-list cứng.

### Quyết định user (2026-10-15 — duyệt plan)
- **Duyệt plan** 4 task phase 1, chạy liên tục không dừng giữa task.
- **Q1:** CHẤP NHẬN rủi ro bản quyền og:image; runbook phải có mục gỡ 1 ảnh khi bị yêu cầu (T04).
- **Q2:** ghi "Ảnh: <tên miền>" / "Image: <domain>" ngay dưới mỗi ảnh **và** câu chú thích cuối bài.
- **Q3:** BỎ GIF (chỉ JPEG/PNG/WebP; GIF → tin chỉ text). Không đổi R-16d.
- **Q4:** tự bỏ ảnh trùng giữa các tin (sha256 trùng ≥ 2 tin); không deny-list cứng.

### Spec-validation round 1 → sửa plan
FAIL C1 (MDX 3 không map `<img>` JSX sang components.img → dùng component `<NewsImage>` thay `<img>`, T01+T03) + thiếu runbook gỡ ảnh (T04) + W3 (tách bước fetch khỏi OPENCODE_API_KEY, chặn NAT64/6to4/Teredo, deadline/request, test py3.13). Đã cập nhật task files. Residual W1: DB dev/staging seed từ file sẽ 404 ảnh /uploads (ảnh chỉ trên volume prod).
