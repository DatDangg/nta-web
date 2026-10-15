# Spec update — 2026-10-15 · change `ai-news-item-images`

- **Spec version**: 4.2.1 → **4.3.0** (MINOR — thêm năng lực ảnh từng tin vào R-09c)
- **Scope version**: v51 → **v52** (`feature-update`)
- **Trigger**: `feature-update` (change-request CR-035, ADDITIVE, risk HIGH — review STRICT)
- **Change file**: `spec/changes/2026-10-15-ai-news-item-images.md`
- **Tasks**: `tasks/feature-ai-news-item-images/phase-1-task-01..04.md` (user duyệt plan 2026-10-15)
- **Thời điểm phát hành**: bước planning (sau khi user duyệt plan) — hiệu lực khi phase 1 PASS; lượt kiểm thật trên prod: cron 19/10 (w43)

## Thay đổi

**SỬA R-09c** — "Bản tin AI tuần" (CR-019 / CR-034). Thêm:
- *Ảnh từng tin:* job `digest` (`generate.py` + `og_image.py`, không secret DB) tách 2 bước: `generate --items-out <file>`
  (LLM + guard, có `OPENCODE_API_KEY`, không fetch ảnh) → `render --items-json <file> --images-out <dir>` (**KHÔNG** key) lấy `og:image`/`twitter:image` của chính URL tin
  đã qua guard, với guard SSRF: https-only (port 443, không userinfo, https→http khi redirect = từ chối), chặn IP không-global
  (loopback, RFC1918, link-local/metadata, CGNAT, multicast, reserved, ULA, NAT64/6to4/Teredo dù `is_global`, IPv4-mapped xét
  IPv4 bên trong) cho mọi địa chỉ DNS + mỗi hop redirect, pin IP đã kiểm, ≤ 3 redirect, timeout socket 5 s + **deadline tổng 10 s/request**,
  ngân sách tổng ≤ 90 s, bỏ proxy env, không cookie/Authorization;
  HTML ≤ 512 KB, chỉ đọc `<meta>`, không tới LLM / không ghi đĩa / không log.
- Ảnh ≤ 2 MB, **chỉ JPEG/PNG/WebP** theo magic bytes (GIF bị bỏ → tin chỉ text; R-16d không đổi), kích thước 200..8192 px;
  ảnh trùng giữa các tin (sha256 trùng ở ≥ 2 tin) tự bỏ, không deny-list cứng.
- Bài vi + en: ảnh dưới tiêu đề tin bằng component MDX `<NewsImage src="/uploads/<sha256>.<ext>" alt width height/>` (MDX 3 không map
  `<img>` viết thẳng sang `components.img`; `ArticleImage`/`mdxComponents.img` không đổi). `NewsImage` chỉ nhận src `/uploads/<sha256 64 hex>.(jpg|png|webp)`,
  width/height chuỗi số 1..8192, alt bắt buộc; sai → không ra ảnh; đúng → `next/image`. alt = tiêu đề tin theo locale, **không hotlink**; ghi nguồn ngay dưới
  mỗi ảnh "Ảnh: <tên miền>" / "Image: <domain>" **và** câu chú thích cuối bài. Tin không lấy được ảnh → chỉ text, không fail bài.
  Ảnh bìa giữ SVG cố định. Tắt khẩn cấp: `AI_NEWS_IMAGES=off` → `--no-images`.
- *Đăng vào DB:* `publish-post --images-dir <dir>` — dry-run validate ảnh (magic bytes, sha256 == tên file; I-7 coi ảnh sắp lưu là
  hợp lệ) → backup → lưu ảnh qua `saveImage` (asset có version, actor `workflow:ai-news`, trùng hash → dùng lại) **trước**
  `createEntry`; bài `exists` → không đụng ảnh. Ảnh chuyển `digest` → `publish-db` qua artifact `ai-news-images-<slug>` (7 ngày).
- Quyết định user (2026-10-15): chấp nhận rủi ro bản quyền og:image; runbook `docs/runbook/ai-news.md` có mục gỡ 1 ảnh khi bị yêu cầu
  (xoá mềm asset + sửa bài qua `db:cli update`).
- Không đổi: schema DB, R-16d (upload), cover, guard text/URL hiện có, bài các tuần trước.

## Ảnh hưởng test
- Trực tiếp: `tools/ai-news` (fetch og:image an toàn, render `<NewsImage>` + nguồn, tách generate/render), `publish-post --images-dir`,
  component `NewsImage` (src `/uploads/<sha256>` hợp lệ → `next/image`; src ngoài/sai dạng/thiếu alt → không ra ảnh), workflow `ai-news.yml`
  (generate có key / render không key, artifact digest → publish-db), chi tiết bài blog vi/en tuần mới.
- Regression: bài AI tuần cũ không đổi, blog hiện có, Content ops `upload`, `publish-post` không ảnh, ảnh trong MDX khác (`ArticleImage` không đổi).
- Chi tiết: `spec/test-scope/current.json` (scope v52).

## Close-out phase 1 — 2026-10-15 (scope v53)
- Phase 1 PASS: commits `13d1b35` (T01), `0d12984` (T02), `66079e0` (T03), `8ca92fc` (T04); spec-validator phase 1 PASS
  (`.context/review-reports/feature-ai-news-item-images-phase-1-spec-validation.md`).
- **spec_version giữ 4.3.0** (không đổi requirement). `spec/test-scope/current.json` → **v53**: danh sách file thật (thêm `image_sniff.py`,
  test Python/TS, `news-image.tsx`, docs/runbook), hành vi as-built (dòng nguồn nghiêng, width/height chuỗi số hoặc number,
  manifest/symlink/ext ở `--images-dir`, ảnh thừa chỉ cảnh báo, `::error::` Re-run khi thiếu artifact, trang không phải `text/html` → chỉ text,
  bản có ảnh trượt guard → bản chỉ text, smoke 1 ảnh `/uploads`, regression cờ sai subcommand).
- `SPECIFICATIONS.md` R-09c: ghi rõ component `NewsImage` + tắt khẩn cấp `AI_NEWS_IMAGES=off` (đã nằm trong delta này, không phải intent mới).
- Residual risk **G1**: asset ảnh đã xoá mềm khi gỡ theo runbook §8 sẽ được `saveImage` khôi phục (`restored`) nếu cùng bytes xuất hiện lại tuần sau — chưa có CR chặn.
