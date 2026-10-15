Agent: spec-validator

# Spec validation — feature-ai-news-item-images (CR-035) · phase 1 · phase review

- Ngày: 2026-10-15
- Chế độ: Phase review (sau T01..T04 PASS review)
- Phạm vi: `git diff 9d256a2..HEAD` (13d1b35 T01, 0d12984 T02, 66079e0 T03, 8ca92fc T04)
- Nguồn: `SPECIFICATIONS.md` R-09c (4.3.0, dòng 313-321, 330-337) · `spec/updates/2026-10-15-ai-news-item-images.md` ·
  `spec/changes/2026-10-15-ai-news-item-images.md` (Q1–Q4) · `tasks/feature-ai-news-item-images/phase-1-task-0{1..4}.md` ·
  `spec/test-scope/current.json` (v52)
- Verify: `npm test` → 137 tests, 135 pass, 0 fail, 2 skipped (cần TEST_DATABASE_URL). typecheck/lint/build/pytest: dựa trên
  verification summary của task + reviewer report (không chạy lại).

## Verdict: ✅ COMPLETE (PASS) — 0 MISSING, 0 conflict HIGH, 2 ⚠️ WARN, vài INFO

Code khớp spec R-09c + spec/updates + quyết định Q1–Q4. Không có requirement thiếu. Cần sửa test-scope ở close-out (G2)
và nên ghi nhận residual risk G1.

## Ma trận coverage

| Requirement | Nguồn | Implementation | Status |
|---|---|---|---|
| Fetch og:image/twitter:image chỉ của URL tin đã qua guard | R-09c:313 | `generate.py` `publish()` → `og_image.collect_images([item["url"]…])` sau `guarded_items` | ✅ |
| Tách bước: generate (có key, không fetch) / render (không key) | updates:13-14 | `generate.py` main: `--items-out` chỉ generate, `--images-out/--no-images` chỉ render (parser.error); `ai-news.yml:54-85` | ✅ |
| https-only, port 443, không userinfo, https→http bị chặn | updates:15 | `og_image.py:66-89` `check_url` chạy mọi hop | ✅ |
| Chặn IP không-global + NAT64/6to4/Teredo + IPv4-mapped, mọi IP DNS, mỗi hop | updates:15-17 | `og_image.py:40-111` | ✅ |
| Pin IP | R-09c:314 | `PinnedHTTPSConnection` `og_image.py:116-127`, `_connect_any` không resolve lại | ✅ |
| ≤ 3 redirect, socket 5 s, deadline 10 s/request, ngân sách 90 s | updates:17-18 | `og_image.py:29-32,149-161,173,283` | ✅ |
| Bỏ proxy env, không cookie/Authorization | updates:18 | `http.client` trực tiếp, header chỉ UA + Accept (`og_image.py:192`) | ✅ |
| HTML ≤ 512 KB, chỉ đọc meta, không LLM/đĩa/log | R-09c:315 | `MAX_HTML_BYTES` truncate; `_MetaParser`; log chỉ lý do ngắn | ✅ |
| Ảnh ≤ 2 MB, JPEG/PNG/WebP magic bytes, 200..8192 px, GIF bỏ (Q3) | R-09c:315-316 | `og_image.py:34,277` + `image_sniff.py:64-79` | ✅ |
| Ảnh trùng sha256 ≥ 2 tin tự bỏ, không deny-list (Q4) | R-09c:316 | `og_image.py:295-298` | ✅ |
| `<NewsImage src=/uploads/<sha>.<ext> alt width height/>` dưới tiêu đề, alt theo locale | R-09c:317, updates:22 | `generate.py` `_image_lines`, `render_post` | ✅ |
| NewsImage validate src/size/alt → next/image; ArticleImage/img không đổi | updates:23-24 | `src/components/mdx/news-image.tsx`, `index.tsx` (+NewsImage) | ✅ |
| Ghi nguồn dưới ảnh + câu chú thích cuối bài (Q2) | R-09c:317-319 | `IMAGE_CREDIT`, `IMAGE_FOOTNOTE` (`generate.py`) | ✅ (xem INFO-1) |
| Không hotlink | R-09c:319 | src chỉ `/uploads/…`; NewsImage chặn src ngoài | ✅ |
| Lỗi ảnh không fail bài | R-09c:319 | `collect_images` nuốt mọi lỗi/tin; `publish()` fallback bỏ toàn bộ ảnh nếu bản có ảnh trượt guard | ✅ |
| Cover giữ SVG | R-09c:319 | `COVER` không đổi | ✅ |
| `AI_NEWS_IMAGES=off` → `--no-images` | updates:26 | `ai-news.yml:73-80` | ✅ |
| Artifact `ai-news-images-<slug>` 7 ngày digest → publish-db, mount ro | R-09c:331, updates:29 | `ai-news.yml:95-107,181-200,224-227` | ✅ |
| `publish-post --images-dir`: dry-run validate magic bytes + sha256==tên; I-7 coi hợp lệ | R-09c:330-331 | `publish-post.ts:146-167,232-241` (+ manifest, chống symlink) | ✅ |
| Sau backup lưu ảnh qua saveImage (actor workflow:ai-news) trước createEntry; exists → không đụng ảnh | R-09c:336-337 | `publish-post.ts:246-268`; needUpload chỉ từ locale missing; workflow `--actor workflow:ai-news` | ✅ (xem G1) |
| Runbook gỡ 1 ảnh (Q1) | R-09c:320-321 | `docs/runbook/ai-news.md` §8 | ✅ (xem G1) |
| Không đổi schema DB, R-16d, cover, bài cũ | updates:32 | không có migration; `inspectImage`/`saveImage` không sửa; bài cũ không chạm | ✅ |
| Docs | Doc Impact | `docs/DESIGN.md:288-291`, `docs/runbook/db.md` §9, `docs/runbook/ai-news.md` §1,§5,§6,§7,§8, `tools/ai-news/README.md` | ✅ |

## Gaps

### ⚠️ G1 [PARTIAL] (MEDIUM) — ảnh đã gỡ theo yêu cầu bản quyền có thể tự quay lại
- `src/lib/uploads/save-image.ts:61-71`: trùng hash với asset **đã xoá mềm** → `rollbackEntry` → `restored`.
- `tools/db/publish-post.ts:246-247` gọi `saveImage` cho mọi ảnh bài mới cần → nếu tuần sau og:image cùng bytes (cùng bài / cùng ảnh
  của trang nguồn) xuất hiện lại, asset bị gỡ ở runbook §8 bước 3 (`docs/runbook/ai-news.md:134-136`) sẽ được **khôi phục** và file
  ghi lại vào UPLOAD_DIR, không ai duyệt.
- Spec chỉ nói "trùng hash → dùng lại" (R-09c:337) và "runbook có cách gỡ 1 ảnh" (R-09c:320-321) — không nói gì về ảnh đã gỡ. Runbook §8
  không cảnh báo. `docs/runbook/db.md` §9 có nhắc `restored` nhưng không gắn với takedown.
- Đề xuất (không tự sửa): ít nhất ghi residual risk + cảnh báo trong runbook §8; hoặc CR sau cho `publish-post` từ chối/bỏ ảnh có asset đã xoá mềm.

### ⚠️ G2 [PARTIAL] (LOW-MEDIUM) — `spec/test-scope/current.json` v52 còn mô tả planning, lệch code thật
Chi tiết ở mục "Sửa test-scope" bên dưới.

### INFO
- INFO-1: dòng nguồn ảnh render nghiêng `*Ảnh: host*` cùng cỡ chữ (task-03 Verification: không thêm style); spec/test-scope ghi "dòng nhỏ".
  Không vi phạm acceptance (ghi nguồn có), chỉ lệch chữ.
- INFO-2: `NewsImage` nhận cả width/height kiểu number (`news-image.tsx:18-19`), spec/test-scope ghi "chuỗi số". Chặt hơn không cần.
- INFO-3: Code còn đọc `og:image:secure_url` (`og_image.py:37`) — spec chỉ nêu og:image/twitter:image. Vô hại.
- INFO-4: `fetch_item_image` bỏ trang không phải `text/html` (`og_image.py:272-273`) — chưa có trong spec/test-scope.
- INFO-5: publish-db thêm bước "Smoke ảnh tin" (`ai-news.yml:240-244`) — R-09c bước 4 (SPECIFICATIONS.md:338) chỉ nêu smoke trang.
- INFO-6: SPECIFICATIONS.md R-09c chưa nhắc `NewsImage` và `AI_NEWS_IMAGES=off` (chỉ có ở `spec/updates/…`). Không mâu thuẫn.
- Residual W1 (từ change doc): DB dev/staging seed từ file sẽ 404 ảnh `/uploads` — vẫn còn, đã được ghi.

## Sửa test-scope (`spec/test-scope/current.json`) — cần ở close-out (spec-publisher)
1. `changed.files` (dòng 12-19): bỏ hết "(dự kiến …)" và note dòng 80 "danh sách file là dự kiến"; thêm file thật còn thiếu:
   `tools/ai-news/image_sniff.py`, `tools/ai-news/tests/test_og_image.py`, `src/components/mdx/news-image.tsx`,
   `src/components/mdx/index.tsx`, `src/components/mdx/news-image.test.ts`, `tools/db/publish-post.test.ts`,
   `tools/db/content-cli.test.ts`, `docs/DESIGN.md`, `docs/runbook/db.md`, `tools/ai-news/README.md`.
2. Dòng 17: bỏ "style dòng nguồn nếu cần" (không có style). Dòng 34 + 67: "dòng nhỏ" → "dòng nghiêng `*Ảnh: <host>*`".
3. Dòng 41: "trùng hash → reused" → thêm "asset đã xoá mềm → restored" (+ case test G1 nếu giữ hành vi).
4. Dòng 42/71: width/height "chuỗi số **hoặc number** nguyên 1..8192".
5. Thêm direct: dry-run không có artifact mà bài trỏ `/uploads` chưa có asset → đỏ + `::error::` hướng dẫn Re-run, 0 ghi.
6. Thêm direct: `--images-dir` từ chối manifest slug lệch / ảnh không có trong manifest / symlink / ext ≠ nội dung; ảnh thừa trong manifest → cảnh báo.
7. Thêm direct: bản có ảnh trượt guard bài → bỏ toàn bộ ảnh, đăng bản text; trang nguồn không phải `text/html` → tin chỉ text.
8. Thêm dependents: smoke 1 ảnh `/uploads/<sha>` HTTP 200 sau publish-db (bài không ảnh → bỏ qua).
9. Thêm regression: `generate.py` từ chối `--items-out` ngoài generate và `--images-out/--no-images` ngoài render.
