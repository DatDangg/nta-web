# feature-ai-news-item-images · phase-1-task-02 — `publish-post --images-dir`: lưu ảnh tin vào /uploads + asset trước khi chèn bài

- **CR:** CR-035 · change doc `spec/changes/2026-10-15-ai-news-item-images.md` · deps: task-01 (manifest + đường dẫn `/uploads/<sha>.<ext>`)
- **Classification / Risk:** ADDITIVE · **HIGH**
  - Expected review level: **STRICT** — ghi DB prod + volume upload tự động, shared write-path (`saveImage`, `createEntry`, I-7), đầu vào từ job xử lý nội dung ngoài.
  - Blast radius: `tools/db/publish-post.ts`, `tools/db/content-cli.ts` (cờ mới cho `publish-post`), `tools/db/publish-post.test.ts`, `tools/db/content-cli.test.ts`. Không đổi schema, không đổi `saveImage`/`inspectImage` (tái dùng), không đổi lệnh `upload`.
  - Doc impact: header `content-cli.ts`, `docs/runbook/db.md` §9 (cờ mới). Runbook ai-news ở task-04.
  - Migration gate: không áp dụng.

## Vì sao không gọi `content-cli upload` N lần
`publish-post --dry-run` validate I-7 (ảnh `/uploads/*` phải là asset còn sống — `src/db/content-repo.ts:127-146`) **trước** mọi ghi.
Upload riêng sau dry-run → dry-run luôn đỏ vì asset chưa có; upload trước dry-run → ghi DB trước backup.
→ Gộp vào `publish-post`, **tái dùng `saveImage`** (`src/lib/uploads/save-image.ts` — chính hàm phía sau lệnh `upload`: magic bytes, ≤ 5 MB, ghi atomic theo hash, asset có version, trùng hash → reused/restored).

## Quyết định user (2026-10-15)
Q1 chấp nhận rủi ro bản quyền + runbook gỡ ảnh · Q2 "Ảnh: <tên miền>" dưới ảnh + chú thích cuối bài · Q3 bỏ GIF · Q4 tự bỏ ảnh trùng. Plan đã duyệt.

## Scope
1. `publish-post <slug> --images-dir <dir>` (tuỳ chọn; không có → hành vi CR-034 y nguyên):
   - Đọc `<dir>/manifest.json` (slug phải khớp); chỉ nhận file tên khớp `UPLOAD_FILE_NAME_PATTERN`, không symlink, không `..`.
   - _Note từ T01 review round 1 (MINOR-3):_ chỉ lưu ảnh **có trong `manifest.json`** (và bài tham chiếu) — KHÔNG glob/quét thư mục; `--images-out` có thể còn file `<sha>.<ext>` từ lần chạy trước.
   - Với mỗi `/uploads/<sha>.<ext>` mà body bài **missing** tham chiếu: asset còn sống trong DB → OK; chưa có → phải có file trong `<dir>`, `inspectImage` PASS, sha256 thật của bytes == tên file, ext khớp → "sẽ upload". File thừa → bỏ qua (cảnh báo).
   - **Dry-run**: validate như trên, I-7 coi ảnh "sẽ upload" là hợp lệ; không ghi gì; in thêm `publish-post image /uploads/<x> status=missing|exists`.
   - **Ghi** (sau backup ở workflow): upload ảnh cần (actor = `--actor`, alt vi/en từ manifest, `originalName` = host nguồn) → rồi `createEntry` vi, en như CR-034. Upload xong mà chèn bài lỗi → asset mồ côi vô hại (chạy lại → reused).
   - Bài đã `exists` → không upload, không đổi gì (bài cũ không đổi).
2. Bài tham chiếu ảnh mà không có `--images-dir` / thiếu file → lỗi validate rõ (exit ≠ 0, không ghi locale nào) — không âm thầm bỏ ảnh.
3. `--images-dir` chỉ hợp lệ với `publish-post` (bảng cờ theo lệnh hiện có; cờ lạ → usage error, không chạm DB).

## Tests (`tools/db/*.test.ts`; DB test khi có `TEST_DATABASE_URL`)
- Dry-run có ảnh mới → báo missing, 0 ghi file/DB; dry-run thiếu file ảnh → ContentValidationError, 0 ghi.
- Ghi: asset version 1 actor `workflow:ai-news` + file trên `uploadDir` tạm; bài vi/en version 1; chạy lại → `exists`/reused, 0 ghi.
- File sai hash / ext sai / SVG / > 5 MB / symlink / `../` / manifest slug khác → từ chối trước khi ghi.
- Asset trùng hash đã xoá mềm → restored (hành vi `saveImage`), bài chèn được.
- Không `--images-dir` + bài không ảnh → y hệt CR-034 (test cũ PASS).

## Acceptance
- [ ] Có ảnh: dry-run sạch, ghi đủ ảnh + asset + 2 bài; idempotent khi chạy lại.
- [ ] Không có đường ghi ảnh nào bỏ qua `inspectImage` / hash check.

## Verification plan
- `npm test`, `npm run typecheck`, `npm run lint` (theo `.context/project-config.md`); DB test trên docker compose dev.
- `docker compose --profile tools build nta-tools` + `run --rm --no-deps -v <dir>:/in:ro nta-tools tools/db/content-cli.ts publish-post <slug> --images-dir /in --dry-run` trên DB dev.

## Retry / Escalation
Như task-01 (3 attempt → `architecture_review_needed`; interrupted ≠ failed; append `.context/error-memory.md`).

## Verification summary
Builder 2026-10-15 (attempt 1):
- Code: `tools/db/publish-post.ts` (`imagesDir`/`uploadDir`; `readManifest` + `prepareImage` + `planImages`; trả `{ posts, images, warnings }`),
  `tools/db/content-cli.ts` (cờ `--images-dir` chỉ cho `publish-post`, in dòng `publish-post image … status=…`, header). Không đổi schema,
  `saveImage`, `inspectImage`, `content-repo`, lệnh `upload`.
- I-7 dry-run: lỗi `I-7 ảnh upload không có trong DB: <path>` của `findNewEntryProblems` được gỡ CHỈ cho ảnh đã qua `prepareImage`
  (manifest + lstat không symlink + ≤ 5 MB + `inspectImage` + đuôi khớp + sha256 == tên). Ghi: `saveImage` từng ảnh → `createEntry` vi, en
  (createEntry tự kiểm lại I-7 trong transaction).
- Test: `tools/db/publish-post.test.ts` (+ describe `--images-dir (Postgres)`, 7 ca; test cũ chỉ đổi `results` → `{ posts: results }`),
  `tools/db/content-cli.test.ts` (+2 ca cờ).
- `TEST_DATABASE_URL=<postgres:16-alpine tạm, 127.0.0.1:55433> node --import tsx --test tools/db/publish-post.test.ts tools/db/content-cli.test.ts`
  → 34 tests, 33 pass, 0 fail, 1 skip (symlink: Windows EPERM không tạo được symlink).
- `npm test` (kèm TEST_DATABASE_URL trên) → 148 tests, 146 pass, 0 fail, 2 skip. `npm run typecheck` PASS. `npm run lint` PASS (0 error,
  1 warning có sẵn `src/components/mdx/index.tsx` — ngoài scope).
- Chưa chạy: `docker compose --profile tools build nta-tools` + dry-run trong container trên DB dev (không có DB dev nta) → để reviewer/T04.
- Residual risk: nhánh từ chối symlink chưa chạy được trên Windows (chạy được trên Linux/CI có TEST_DATABASE_URL); dòng image
  `status=missing` cũng khớp grep `' status=missing$'` của `ai-news.yml` — vô hại vì ảnh chỉ được kiểm cho locale missing (T04 xem lại grep).
