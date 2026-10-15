# feature-ai-news-naming-images · phase-1-task-03 — Sửa bài đã đăng `ai-weekly-2026-w42` (file seed + DB prod)

- **CR:** CR-038 · change doc `spec/changes/2026-10-15-ai-news-naming-images.md` (Yêu cầu §2, §3 — "bài w42 đã đổi") · spec R-09c (4.6.0)
- **Classification / Risk:** MODIFY · **MEDIUM**
  - Expected review level: **STRICT** — ghi dữ liệu DB prod (bulk nhỏ 2 bản ghi, `update` thay TOÀN BỘ `data`), sai → mất field / hỏng bài đang public.
  - Blast radius: `post/vi/ai-weekly-2026-w42`, `post/en/ai-weekly-2026-w42` (DB + file seed), thẻ bài ở /blog, trang chủ, bài liên quan.
  - Doc impact: `docs/runbook/ai-news.md` thêm mục "Sửa tiêu đề/ảnh thẻ bài đã đăng" (quy trình dưới đây, dùng lại được).
  - Migration gate: không áp dụng (không đổi schema; ghi nội dung qua write-path chuẩn có version).
- **Deps:** task-02 (format tên/cover đã chốt + webp có trong `public/`).

## Giá trị đích (theo R-09c 4.6.0, `date` = `2026-10-15`, 12 tin)
| Locale | title | excerpt | cover |
|---|---|---|---|
| vi | `Bản tin AI tuần ngày 15/10/2026` | `12 điểm tin AI đáng chú ý trong bản tin ngày 15/10/2026, kèm link nguồn gốc.` | `/uploads/9b72253a979b1d87c03bca8a2abf5bac9cef4557356eca763f36a544dba8fc51.jpg` |
| en | `AI Weekly Digest — 15 Oct 2026` | `12 notable AI news items in the digest of 15 Oct 2026, with links to the original sources.` | (như vi) |

Cover = ảnh tin 1 (`src/content/blog/vi/ai-weekly-2026-w42.mdx:14`, cùng ảnh ở bản en). Builder sinh chuỗi bằng chính hàm của `generate.py` (task-02) để khớp tuyệt đối.
Body, slug, date, category **không đổi**.

## Scope
1. File seed: `src/content/blog/vi/ai-weekly-2026-w42.mdx:3,6,7` và `src/content/blog/en/ai-weekly-2026-w42.mdx:3,6,7` — đổi `title`, `excerpt`, `cover`
   theo bảng. Không đụng body. **Không** sửa fixture `tools/db/fixtures/blog/**` (fixture test riêng).
2. Quy trình DB (viết vào `docs/runbook/ai-news.md`, chạy trên VPS qua `nta-tools`, giống runbook §8):
   a. Backup: `docker exec nta-db-backup /scripts/backup.sh "ops-cr038-$(date -u +%Y%m%dT%H%M%SZ)"`.
   b. `cli show post/vi/ai-weekly-2026-w42` → lấy `version` hiện tại (N) + `data` + `body`.
   c. `record.json` = `{"data": {...data cũ, chỉ đổi title/excerpt/cover...}}` (bỏ `body` → giữ nguyên body; `update` thay TOÀN BỘ `data`
      nên phải giữ đủ field cũ: slug, date, category, …).
   d. `cli update post/vi/ai-weekly-2026-w42 --file - --expected-version N --actor ops:<tên> --note "CR-038 tên theo ngày + cover ảnh tin 1" --confirm-prod < record.json`.
   e. Lặp b–d cho `post/en/ai-weekly-2026-w42`.
   f. `cli revalidate --collection post` → kiểm `/blog`, `/en/blog`, `/blog/ai-weekly-2026-w42`, `/en/blog/ai-weekly-2026-w42` (200, tiêu đề mới, thẻ ảnh mới).
   g. Rollback nếu sai: `cli rollback post/<locale>/ai-weekly-2026-w42 --to N --expected-version N+1 --confirm-prod` (v1 cover SVG — vì vậy SVG giữ lại).
   (`cli` = `docker compose run --rm --no-deps -T nta-tools tools/db/content-cli.ts`; lệnh ghi cần `--confirm-prod`; không in secret.)
3. Tuỳ cách chạy user chốt ở checkpoint (câu hỏi mở Q1):
   - **(A) User tự chạy trên VPS** theo runbook ở bước 2 — builder chỉ làm bước 1 + 2 (tài liệu) + chuẩn bị sẵn 2 file `record.json` mẫu trong mô tả
     (không commit dữ liệu DB thật). Task đóng khi user báo đã chạy + smoke OK.
   - **(B) Thêm lệnh vào workflow `content-ops.yml`** (vd `sync-post` có confirm, chỉ cập nhật title/excerpt/cover từ file seed) — mở rộng scope,
     đụng workflow ghi DB prod → tách task riêng, review STRICT. Không làm nếu user không chọn.

## Verification plan
- `npm test` (parity/loader đọc file seed vẫn PASS), `npm run typecheck`, `npm run lint`, `npm run build`.
- Kiểm frontmatter seed khớp output `generate.py` (render lại từ hàm task-02 với `date=2026-10-15`, 12 tin → so title/excerpt).
- Sau khi chạy DB: `cli show` 2 locale (version N+1, actor ops, data đủ field), `cli history` có dòng update; HTTP 200 4 URL; parity DB ↔ file
  (`content-ops` lệnh `parity`) không còn lệch w42.

## Acceptance
- [ ] File seed w42 vi + en: title/excerpt theo ngày, cover ảnh tin 1; body không đổi.
- [ ] DB prod w42 vi + en: version mới cùng giá trị, các field khác giữ nguyên; /blog hiện tiêu đề + ảnh thẻ mới sau revalidate.
- [ ] Có backup trước khi ghi + đường rollback ghi trong runbook.

## Retry / Escalation
- Attempt FAIL thật → sửa trên đĩa, tăng `attempt`; cancel ≠ fail. 3 attempt FAIL → `architecture_review_needed`, dừng báo user.
- Lệnh DB lỗi `ContentConflictError` (expected-version lệch) → `show` lại lấy version mới, không ép ghi.

## Verification summary
- **Phương án Q1 = A** (user chốt): KHÔNG đụng `content-ops.yml`; user tự chạy lệnh DB trên VPS theo runbook. Builder không chạy gì lên DB thật.
- **File seed** `src/content/blog/{vi,en}/ai-weekly-2026-w42.mdx` dòng 3/6/7: title/excerpt/cover đúng bảng "Giá trị đích"; slug/date/category/body không đổi
  (`git diff` chỉ 3 dòng/locale). Chuỗi đối chiếu tay với `format_post_date` + `_frontmatter` (`tools/ai-news/generate.py:190-209`):
  vi `15/10/2026`, en `15 Oct 2026` (`MONTH_ABBR_EN[9]`), item_count = 12 (12 heading `## ` mỗi locale); máy local không có Python nên không gọi
  được hàm trực tiếp — format đơn giản, khớp từng ký tự với bảng của task. Cover = `src` của `<NewsImage>` đầu tiên (`:14` cả vi + en) = logic
  `images[min(images)]` (`generate.py:245`).
- **Fixture** `tools/db/fixtures/blog/{vi,en}/ai-weekly-2026-w42.mdx` **giữ nguyên**: là bản v1 (date `2026-10-14`, cover SVG, tên tuần cũ) dùng làm
  dữ liệu test của `tools/db/publish-post.test.ts:32` — không đại diện bản hiện hành; scope task cấm sửa.
- **Runbook** `docs/runbook/ai-news.md` §9 "Sửa tiêu đề / ảnh thẻ bài đã đăng — Sửa bài w42 (CR-038)": env tạm (`read -rs`, như db.md §1b) → backup
  `ops-cr038-<UTC>` → `show` vi/en ra file + lấy version top-level → `record.json` sinh bằng `node` trong image `nta-web-tools` (`--network none`,
  `--entrypoint node`; image không có jq) = `{"data": {...data cũ, title, excerpt, cover}}` (không gửi `body` → giữ nguyên; dừng nếu bản ghi xoá mềm;
  in cũ → mới + danh sách field giữ nguyên) → `update --file - --expected-version N --actor --note --confirm-prod` → `revalidate --collection post`
  → `history` → curl 4 URL (200, tiêu đề mới, hash ảnh thẻ trên /blog, /en/blog) → rollback `--to N --expected-version N+1 --confirm-prod` (rollback
  không nhận `--actor`, `COMMAND_SCOPED_FLAGS` `content-cli.ts`) → dọn env/workdir → Content ops `parity` sau khi seed lên main.
  Hai `record.json` được sinh tự động từ data thật lúc chạy (thay cho file mẫu tay — tránh mất field). Script merge + `sed` lấy version đã chạy thử
  local trên JSON giả lập `JSON.stringify(entry, null, 2)` (có key `version` lồng trong data → không bị bắt nhầm): PASS.
- `npm test`: 195 tests, 192 pass, 2 skip (cần `TEST_DATABASE_URL`), **1 fail có sẵn** `tools/db/content-rules.test.ts` (thiếu `public/uploads` local —
  9 đường dẫn `/uploads` y như trước; cover mới trùng ảnh tin 1 đã có trong body → không thêm phần tử mới). Không fail mới.
- `npm run typecheck`: PASS. `npm run lint`: PASS (0 error, 1 warning `no-img-element` có sẵn, không thuộc task).
- `npm run build`: **Blocked (môi trường)** — `Failed to load native binding` khi load `next.config.ts`, cùng lỗi đã ghi ở task-02; không liên quan diff.
- **Round 2 (sửa theo review round 1 STRICT FAIL — chỉ `docs/runbook/ai-news.md` §9, seed giữ nguyên):**
  - M1: §9 tách thành khối 0–7 đánh số + ghi rõ "dán/chạy TỪNG KHỐI MỘT, không dán cả loạt"; secret gom 1 dòng
    `read -rsp 'POSTGRES_PASSWORD: ' PW; echo; read -rsp 'REVALIDATE_SECRET: ' RS; echo; printf … > "$ENVF"; unset PW RS`
    (dán 1 dòng → `read` đọc từ terminal, không nuốt code); mọi `cli` không đọc file (`show`, `revalidate`, `history`, `rollback`) + `git log`,
    `docker exec`, `build` đều có `</dev/null`; `update` vẫn đọc `record.json` qua `<`.
  - M2: khối 3 `backup.sh … && BACKUP_OK=1` (`deploy/db/backup.sh` `set -eu`, exit ≠ 0 khi lỗi/trùng tên); khối 6 cổng chặn
    `[ "$BACKUP_OK" = 1 ] && is_num "$VI_N" && is_num "$EN_N" && [ -s vi.record.json ] && [ -s en.record.json ]` → mới `update` vi `&&` en; không đạt
    → in lý do, không ghi. Rollback: bỏ dòng locale chưa ghi; shell đã đóng → chạy lại khối 0–2 + gán tay `VI_N/EN_N` đã ghi giấy.
  - L1: `ENVF` nằm trong `$WORK`; `trap 'shred -u "$ENVF"; rm -rf "$WORK"' EXIT HUP TERM` (không bẫy INT để Ctrl-C không xoá giữa chừng) +
    nhắc "dừng ở bước nào cũng chạy dòng Dọn" (Dọn gỡ trap).
  - L2: khối 2 in `docker image inspect -f {{.Created}} nta-web-tools:latest` + `git log -1`; tuỳ chọn
    `docker compose --env-file "$ENVF" --profile tools build nta-tools` (y như bước "Build nta-tools" của `content-ops.yml:89` / `ai-news.yml:177`;
    cần `--env-file` vì compose nội suy `${POSTGRES_PASSWORD:?}`).
  - Kiểm: trích toàn bộ khối `sh` §9 → `bash -n` PASS; mô phỏng cổng chặn 5 ca (OK / backup=0 / VI_N rỗng / VI_N "3a" / record rỗng) → chỉ ca OK ghi.
    Không chạy gì lên DB. Không chạy lại npm test/typecheck/lint (diff round 2 chỉ là doc).
- **Còn mở:** bước DB prod (acceptance 2–3) chờ user chạy runbook §9 trên VPS + smoke. Task chỉ đóng khi user báo đã chạy OK.
