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
_(builder điền)_
