# Runbook — Bản tin AI tuần (CR-019, spec R-09c)

Workflow `.github/workflows/ai-news.yml` — mỗi thứ 7 lúc 08:00 giờ VN (`cron: '0 1 * * 6'` UTC; CR-036 đổi từ thứ 2) tự thu thập
tin AI 7 ngày, nhờ OpenCode Go viết 2 bài `src/content/blog/{vi,en}/ai-weekly-YYYY-wNN.mdx` (category `ai-tech`),
kèm **ảnh tin** (og:image của trang tin, lưu về `/uploads`, CR-035), build PASS → commit file seed thẳng `main` → **chèn bài vào DB prod** (job `publish-db`, CR-034) → revalidate → smoke.
Code: `tools/ai-news/` (xem `tools/ai-news/README.md`) + lệnh `publish-post` của `tools/db/content-cli.ts`.

Prod đọc nội dung từ DB (`CONTENT_SOURCE=db`, CR-031) → bài chỉ hiện khi có bản ghi trong `content_entries`.
File seed vẫn được commit (lịch sử bài trong git, dedupe tuần `generate.py check`, đường lùi `CONTENT_SOURCE=file`).
Workflow **không** dispatch `deploy.yml` nữa (DB mode không cần build lại image để hiện bài).

Hệ quả đổi lịch sang thứ 7 (CR-036): bài mang số ISO week của chính tuần chạy (thứ 2 → CN, giờ VN), `date` frontmatter = ngày chạy (thứ 7), tối đa 1 bài/tuần, bài cũ không đổi.

Tên + ảnh thẻ (CR-038, R-09c 4.6.0): title/excerpt theo **ngày** `date` (giờ VN) — vi `Bản tin AI tuần ngày DD/MM/YYYY`,
en `AI Weekly Digest — D Mon YYYY` (vd `3 Oct 2026`); slug vẫn `ai-weekly-YYYY-wNN` (URL + dedupe tuần).
`cover` (ảnh thẻ ở /blog, trang chủ, bài liên quan) = ảnh `/uploads/…` của **tin đầu tiên có ảnh** (cùng giá trị vi + en; ảnh này nằm trong
`manifest.json` nên `publish-post` lưu cùng bài). Không tin nào có ảnh (kể cả `AI_NEWS_IMAGES=off`) → `/images/blog/ai-weekly-cover.webp`.
Đổi ảnh fallback: thay file `public/images/blog/ai-weekly-cover.webp` **giữ nguyên tên** (commit thường + deploy). `ai-weekly-cover.svg` giữ lại
cho bài cũ / version v1 trong DB — không xoá.

Thứ 7 17/10/2026 (w42) → `check` = `skip` vì w42 đã có trên main (`publish-db` vẫn chạy tự lành, insert-only); bài tự động kế tiếp là thứ 7 24/10/2026 → `ai-weekly-2026-w43`; không còn lượt thứ 2 19/10. GitHub cron có thể trễ vài–vài chục phút lúc tải cao.

Hai job, cùng self-hosted runner `nta-web`:

| Job | Chạy ở | Việc | Secret |
|---|---|---|---|
| `digest` | container `node:22-trixie` (Python 3.13 + Node 22 + git, không cài gì lên host). Bước cuối `chown` trả quyền workspace (container chạy root) | check tuần → thu thập → **Generate** (LLM + guard → `items.json`) → **Render** (MDX + fetch ảnh, KHÔNG key) → build → artifact ảnh → commit/push file → xuất slug bài cần đăng | `OPENCODE_API_KEY` (**chỉ** bước Generate) |
| `publish-db` | host (cần docker), concurrency `deploy-nta-web` (chung deploy/Content ops — không chạy song song backup/migrate), chỉ ref `main` | tải artifact ảnh → dry-run → backup (chỉ khi có locale `missing`) → lưu ảnh + chèn → revalidate `post` → smoke `/blog/<slug>` + `/en/blog/<slug>` + 1 ảnh `/uploads` | `POSTGRES_PASSWORD`, `REVALIDATE_SECRET` (chỉ job này) |

`publish-db` chạy cả khi `digest` báo `skip` (bài tuần đã có file từ lượt trước) → chạy lại cùng tuần **tự lành** nếu lượt trước chèn DB/revalidate lỗi.
Chèn là **insert-only** qua write-path chuẩn `createEntry`: bản ghi `post/<locale>/<slug>` đã có (kể cả đã sửa hoặc xoá mềm) → `exists`, không ghi đè, không khôi phục.
Bản ghi mới: version 1, `updated_by = workflow:ai-news`, `content_versions` op `create` note `ai-news <slug> run <GITHUB_RUN_ID>`.

## 1. Thêm secret (1 lần, bắt buộc)

GitHub repo → Settings → Secrets and variables → Actions:

| Loại | Tên | Giá trị |
|---|---|---|
| Secret | `OPENCODE_API_KEY` | API key OpenCode Go. Không commit, không dán vào issue/log. |
| Variable (tuỳ chọn) | `AI_NEWS_MODEL` | Model OpenCode Go, mặc định `glm-5.3` (vd đổi `kimi-k3`). |
| Variable (tuỳ chọn) | `AI_NEWS_IMAGES` | `off` = tắt ảnh tin (bài như trước CR-035). Bỏ trống = bật. Xem §7. |
| Secret (đã có từ CR-031) | `POSTGRES_PASSWORD`, `REVALIDATE_SECRET` | Dùng chung với Deploy / Content ops — job `publish-db` cần. |

Thiếu `OPENCODE_API_KEY` → bước "Generate items (LLM + guard)" đỏ, không đăng gì.

## 2. Chạy tay

Actions → **AI News Weekly** → *Run workflow* (branch `main`). Bài của tuần đã có file → job `digest` xanh
ở bước "Check this week's post" (`status=skip`), không sinh lại, không commit; job `publish-db` vẫn chạy:
DB đã có cả 2 locale → dry-run báo `exists`, **không backup, không ghi**, chỉ revalidate + smoke; thiếu locale nào → chèn locale đó.

Kiểm kết quả trên VPS: `docker compose run --rm --no-deps nta-tools tools/db/content-cli.ts history post/vi/<slug>`
(thấy `v1 create workflow:ai-news … — ai-news <slug> run <id>`).

**Đăng lại / thay bài tuần đã đăng — KHÔNG làm bằng file.** Prod đọc DB; file seed `src/content/blog/*` chỉ là lịch sử.
Xoá hoặc sinh lại file rồi chạy workflow **không đổi bài trên web**: DB đã có `post/{vi,en}/<slug>` → `publish-post` báo `exists`,
không ghi (kể cả bản đã xoá mềm), workflow vẫn xanh. Công cụ hiện có trên DB (chạy trên VPS qua `nta-tools`, runbook `db.md` §9, backup trước):
- Xem: `… content-cli.ts history post/vi/<slug>` / `show post/vi/<slug>`.
- Quay về 1 version cũ (kể cả khôi phục bản đã xoá mềm): `… content-cli.ts rollback post/vi/<slug> --to <N> --expected-version <M> --confirm-prod`, rồi `revalidate --collection post`.
- **Sửa nội dung / gỡ bài:** `… content-cli.ts update|delete` (CR-030, runbook `db.md` §9; có `--expected-version`, version) — ví dụ đầy đủ ở §8 (gỡ ảnh).
- Không có cách "xoá rồi chèn lại" bằng `publish-post`: khoá `(post, locale, slug)` giữ cả bản xoá mềm (I-5).

## 3. Đổi model / endpoint

- Model: sửa Variable `AI_NEWS_MODEL` (không cần sửa code).
- Endpoint mặc định `https://opencode.ai/inference/go/v1` (`DEFAULT_BASE_URL` trong `tools/ai-news/generate.py`).
  Request gửi `User-Agent: nta-web-ai-news/1.0` + `x-opencode-session: nta-web-ai-news`.

## 4. Tắt / bật cron

- Tạm tắt: Actions → AI News Weekly → `…` → **Disable workflow** (bật lại: Enable workflow).
- Đổi lịch: sửa `cron` trong `.github/workflows/ai-news.yml` (giờ UTC = giờ VN − 7).

## 5. Workflow đỏ — xử lý

GitHub gửi email khi workflow fail. Job `digest` đỏ trước bước push → **không có commit, không ghi DB**.
Job `publish-db` đỏ (hoặc **cancelled**) → bài đã có trên `main`, chưa/chưa đủ vào DB. Sửa nguyên nhân rồi:
- **Cách chuẩn — mở run đó → *Re-run failed jobs*** (hoặc *Re-run jobs* nếu bị cancelled): chạy lại riêng `publish-db` với output của `digest` cũ → đúng slug bài đó, **bất kể đã sang tuần mới**. Idempotent (locale đã có → `exists`).
  Bài có ảnh tin: Re-run dùng lại artifact `ai-news-images-<slug>` của run đó (giữ **7 ngày**) → **chỉ** cách này đưa được ảnh vào `/uploads`.
  Run mới (`skip`) không có artifact → bài đã `exists` thì vẫn xanh (không cần ảnh); bài chưa vào DB mà trỏ ảnh `/uploads` → dry-run đỏ
  kèm `::error::` "KHÔNG có artifact ảnh … Re-run failed jobs" — không ghi gì.
- *Run workflow* mới chỉ tự lành **trong cùng tuần ISO** (giờ VN): `check` tính slug theo tuần hiện tại → sang tuần sau thì bài tuần cũ không bao giờ được chèn qua run mới — dùng Re-run ở trên.
- **Cancelled do concurrency:** `publish-db` dùng chung nhóm `deploy-nta-web` với Deploy / Content ops; GitHub chỉ giữ **1 job pending mỗi nhóm** → một deploy/Content ops xếp hàng sau có thể thay chỗ (`publish-db` hiện *cancelled*), và ngược lại. Không phải lỗi bài — Re-run khi nhóm rảnh (và kiểm job bị thay chỗ kia có cần chạy lại không).

| Bước đỏ | Nguyên nhân thường gặp | Xử lý |
|---|---|---|
| Collect + sanitize (exit 3/4) | Mọi nguồn đều lỗi/bị chặn (Reddit, HN, GitHub rate-limit), mạng VPS | Xem log bước; chạy tay lại sau. 1 nguồn lỗi KHÔNG làm đỏ. |
| Generate items (LLM + guard) | Thiếu/sai key, model không tồn tại, LLM trả JSON hỏng, **guard chặn** (sau khi loại các tin có URL lạ / text sai, còn dưới 5 tin hợp lệ; tối đa lấy 12) | Đọc dòng `[ai-news] FAIL: ...`. Guard chặn là đúng thiết kế (chống bịa) → chạy tay lại; lặp lại nhiều tuần → đổi model. |
| Render posts + ảnh tin | Lỗi ghi file / timeout 10 phút (mạng trang tin treo) | Lỗi **1 ảnh** không làm đỏ (bỏ ảnh đó). Đỏ ở đây → chưa commit gì; chạy tay lại, lặp lại → đặt `AI_NEWS_IMAGES=off` (§7). |
| Build | Bài sinh ra làm hỏng build (hiếm, MDX đã escape) | Không có gì được commit. Báo dev kèm log. |
| Commit + push | `main` vừa có commit khác chen giữa (push bị từ chối) | Chạy tay lại workflow. |
| publish-db · Validate compose / nta-db healthy | Thiếu secret `POSTGRES_PASSWORD`/`REVALIDATE_SECRET`; DB không chạy | Kiểm secret / `docker ps` trên VPS (runbook `db.md`) rồi chạy lại. Chưa ghi gì. |
| Lưu ảnh tin (artifact) | Lỗi upload artifact | Chạy **trước** push → chưa có gì trên `main`. Chạy tay lại workflow. |
| publish-db · Kiểm bài (dry-run) — `I-7 ảnh upload không có trong DB … --images-dir` + `::error::` "KHÔNG có artifact ảnh" | Run này không có artifact ảnh (bài `skip` từ run khác, artifact hết hạn 7 ngày) mà bài trỏ `/uploads/…` chưa có asset | Chưa ghi gì. **Re-run failed jobs của CHÍNH run đã sinh bài** (xem trên). Quá 7 ngày → §8 bước 6 (bỏ ảnh khỏi file seed) rồi chạy lại. |
| publish-db · Kiểm bài (dry-run) | File thiếu 1 locale, frontmatter sai, cover không có trong `public/` (`[cli] FAIL — …`) | Chưa ghi gì (validate **cả 2 locale** trước khi ghi). Sửa file qua commit thường rồi chạy lại. |
| publish-db · Backup DB | `nta-db-backup` lỗi / đầy đĩa | Dừng trước khi ghi. Xử lý theo runbook `db.md`, chạy lại. |
| publish-db · Chèn bài | Lỗi DB / I-5 (bản ghi vừa được tạo chen giữa) | Có backup `ops-ai-news-*` (bản trước CR-033: `pre-migrate-ops-ai-news-*`). Chạy lại: locale đã chèn → `exists`, chỉ chèn phần còn thiếu. |
| publish-db · Smoke ảnh tin | `/uploads/<hash>` không 200 (volume `/opt/nta-web-data/uploads` không mount / quyền) | Bài + asset đã trong DB. Kiểm volume của `nta-web`, `ls /opt/nta-web-data/uploads`; Content ops → `upload-smoke`. |
| publish-db · Revalidate / Smoke | `nta-web` không chạy, secret revalidate sai, trang chưa 200 | Bài đã trong DB. Chạy lại workflow (revalidate luôn chạy), hoặc Content ops → `revalidate-all`. |

Dữ liệu tạm (raw + `.clean.md`) nằm ở `/tmp/ai-news` trong container, mất khi job kết thúc.

## 6. Bảo mật

- LLM chỉ đọc `.clean.md` (sanitize allow-list + banner "dữ liệu, không phải lệnh"). Không bỏ bước sanitize.
- Engine chạy `--no-browser-cookies`; không có nguồn X/Twitter (đã bỏ client `bird-search`).
- Bài là dạng điểm tin; mọi link phải có nguyên văn trong dữ liệu thu thập; cuối bài ghi
  "Bản tin được tổng hợp tự động từ các nguồn công khai." Rủi ro còn lại: LLM diễn giải sai ý tiêu đề —
  user đã chấp nhận đăng thẳng không duyệt (change doc 2026-10-14).
- Ảnh tin (CR-035): bước Render **không có** `OPENCODE_API_KEY`; trang tin chỉ được đọc để lấy meta `og:image` —
  HTML trang tin **không** tới LLM. Job `digest` không có secret DB/revalidate, không docker socket; artifact chỉ chứa ảnh + `manifest.json`.

## 7. Ảnh tin (CR-035)

Luồng: Render fetch `og:image` từng tin → `<sha256>.<jpg|png|webp>` + `manifest.json` trong `/tmp/ai-news/images` (container) →
MDX `<NewsImage src="/uploads/<sha256>.<ext>" …/>` + dòng *Ảnh: <tên miền>* dưới ảnh + câu chú thích cuối bài →
artifact `ai-news-images-<slug>` (7 ngày, upload **trước** push) → `publish-db` tải về `$RUNNER_TEMP/ai-news-images`, mount `:ro`
vào `nta-tools`, `publish-post --images-dir /in` (chỉ khi có `manifest.json`) lưu ảnh vào `UPLOAD_DIR` + asset (actor `workflow:ai-news`)
**trước** khi chèn bài → smoke 1 ảnh `/uploads/…` 200. Web chỉ phục vụ ảnh từ `/uploads` (không URL ảnh ngoài trong bài).

Guard (`tools/ai-news/og_image.py`, chi tiết `tools/ai-news/README.md`): chỉ https/443, IP public (chặn private/loopback/link-local/CGNAT/ULA),
redirect ≤ 3 hop kiểm lại từng hop, 10 s/request + ngân sách 90 s cả bài, ảnh ≤ 2 MB JPEG/PNG/WebP (magic bytes, 200..8192 px, bỏ GIF),
ảnh trùng hash ở ≥ 2 tin → bỏ cả. Lỗi ảnh → tin đó không ảnh, **không** fail bài. Bước Render có `timeout-minutes: 10` làm lưới an toàn cuối.
`publish-post` kiểm lại ảnh (manifest, không symlink, magic bytes ≤ 5 MB, sha256 == tên file).

**Tắt khẩn cấp:** GitHub → Settings → Secrets and variables → Actions → *Variables* → `AI_NEWS_IMAGES` = `off`
→ lượt sau Render chạy `--no-images` (bài text như trước CR-035, không artifact). Bật lại: xoá variable hoặc đặt giá trị khác `off`.
Bài đã đăng không đổi — gỡ ảnh đã lên web theo §8.

## 8. Gỡ 1 ảnh khi có yêu cầu (bản quyền / khiếu nại)

Chạy trên VPS qua `nta-tools` (`docker compose run --rm --no-deps -T nta-tools tools/db/content-cli.ts …`, viết tắt `cli` dưới đây;
đặt secret bằng `read -rs` như runbook `db.md` §8–9). Lệnh ghi cần `--confirm-prod`; backup trước:
`docker exec nta-db-backup /scripts/backup.sh "ops-takedown-$(date -u +%Y%m%dT%H%M%SZ)"`.

1. **Tìm ảnh:** URL ảnh trên web có dạng `/uploads/<sha256>.<ext>` → asset là `asset/vi/<sha256>`.
   `cli list --collection asset` / `cli show asset/vi/<sha256>` (xem `originalName` = tên miền nguồn, version hiện tại).
   Bài chứa ảnh: `cli show post/vi/<slug>` và `post/en/<slug>` (tìm `<NewsImage src="/uploads/<sha256>.<ext>"`).
2. **Sửa bài vi + en** — bỏ 2 dòng `<NewsImage … />` và `*Ảnh: <host>*` / `*Image: <host>*` **cùng dòng trống đi kèm mỗi dòng**
   (MDX sinh khối 4 dòng: tag, dòng trống, credit, dòng trống — `tools/ai-news/generate.py` `_image_lines`); giữ phần còn lại:
   lấy `data` + `body` từ `show` → ghi `record.json` = `{"data": {...giữ nguyên...}, "body": "<body đã bỏ khối ảnh>"}` →
   `cli update post/vi/<slug> --file - --expected-version <N> --actor ops:<tên> --note "gỡ ảnh <sha256> theo yêu cầu" --confirm-prod < record.json`.
   Lặp cho `post/en/<slug>`. (Không ảnh nào còn lại → có thể bỏ luôn câu chú thích ảnh cuối bài.)
   Nếu `data.cover` cũng là `/uploads/<sha256>.<ext>` đó (ảnh tin đầu tiên có ảnh, CR-038) → trong `record.json` đổi `cover` sang
   `/uploads/…` của tin có ảnh kế tiếp còn lại, hoặc `/images/blog/ai-weekly-cover.webp`.
3. **Xoá mềm asset** (sau khi không bài nào còn trỏ tới): `cli delete asset/vi/<sha256> --expected-version <N> --actor ops:<tên> --note "…" --confirm-prod`.
   Xoá mềm **không** xoá file → URL hash vẫn 200. Cần gỡ hẳn: `rm /opt/nta-web-data/uploads/<sha256>.<ext>` trên host
   (lưu ý backup `uploads-*.tar.gz` cũ vẫn còn file; restore sau đó sẽ đưa file về).
   ⚠️ **Ảnh đã gỡ có thể tự quay lại:** nếu tuần sau og:image **cùng nội dung (cùng sha256)** xuất hiện lại, `publish-post --images-dir`
   gọi `saveImage` → asset xoá mềm được **khôi phục** (`status=restored`) + ghi lại file, không ai duyệt. Sau khi gỡ, theo dõi log
   job `publish-db` các tuần sau (`publish-post image /uploads/<sha256>… status=restored`) → gặp thì gỡ lại theo §8 (CR-035 G1, chờ CR chặn tự động).
4. **Xoá cache next/image** (bắt buộc — `rm` file gốc chưa đủ): ảnh tin hiển thị qua `next/image`
   (`/_next/image?url=%2Fuploads%2F<sha256>.<ext>&w=…&q=…`); bản đã tối ưu được giữ **31 ngày** (`minimumCacheTTL`, `next.config.ts`)
   trong `/app/.next/cache/images` của container `nta-web` (không phải volume — chỉ mất khi container tạo lại). Trên VPS:
   `docker exec nta-web rm -rf /app/.next/cache/images`
   **KHÔNG** tự `docker compose up --force-recreate nta-web` để xoá cache: thiếu env prod (`CONTENT_SOURCE=db`, `CONTACT_FORM_TARGET`…)
   thì web âm thầm đọc file seed (ảnh vừa gỡ hiện lại). Cần tạo lại container → chạy lại workflow Deploy.
5. **Revalidate + kiểm:** `cli revalidate --collection post` → kiểm `/blog/<slug>`, `/en/blog/<slug>` không còn ảnh. Kiểm URL ảnh
   không còn phục vụ (port = `HOST_PORT`, mặc định 3005; `w`/`q` lấy từ `srcset` cũ, vd `w=1080&q=75`):
   `curl -s -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:3005/_next/image?url=%2Fuploads%2F<sha256>.<ext>&w=1080&q=75"` → **404/400** (không 200);
   `curl -s -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:3005/uploads/<sha256>.<ext>"` → **404**.
   **Giới hạn:** `/uploads/*` trả `Cache-Control: public, max-age=31536000, immutable` (`src/lib/uploads/serve-upload.ts`) →
   trình duyệt / proxy / CDN đã tải ảnh vẫn giữ bản cache tới 1 năm — **ngoài tầm kiểm soát** của server; nêu rõ khi phản hồi yêu cầu gỡ.
6. **Sửa file seed trong git** `src/content/blog/{vi,en}/<slug>.mdx` (bỏ cùng khối ảnh như bước 2) qua commit thường — để đường lùi
   `CONTENT_SOURCE=file` / import-seed không đưa ảnh trở lại.

## 9. Sửa tiêu đề / ảnh thẻ bài đã đăng — Sửa bài w42 (CR-038)

Bài `ai-weekly-2026-w42` (đăng 15/10/2026, trước CR-038) mang tên cũ "tuần 42/2026" + cover SVG chung. File seed đã sửa qua commit
(title/excerpt theo ngày, cover = ảnh tin 1); **web prod đọc DB** nên phải cập nhật 2 bản ghi `post/{vi,en}/ai-weekly-2026-w42` bằng tay
(workflow `publish-post` là insert-only, không ghi đè). Giá trị đích (R-09c 4.6.0, `date` = `2026-10-15`, 12 tin, cover chung vi + en):

| Locale | title | excerpt |
|---|---|---|
| vi | `Bản tin AI tuần ngày 15/10/2026` | `12 điểm tin AI đáng chú ý trong bản tin ngày 15/10/2026, kèm link nguồn gốc.` |
| en | `AI Weekly Digest — 15 Oct 2026` | `12 notable AI news items in the digest of 15 Oct 2026, with links to the original sources.` |

cover = `/uploads/9b72253a979b1d87c03bca8a2abf5bac9cef4557356eca763f36a544dba8fc51.jpg` (asset đã có trong DB từ lúc đăng bài — I-7 PASS).

`update` thay **TOÀN BỘ** `data` → JSON phải giữ đủ mọi field cũ (slug, date, category, …); chỉ gửi `data`, **không** gửi `body`
→ body giữ nguyên. Để tránh gõ tay JSON, đoạn dưới lấy `data` hiện tại từ `show` và trộn 3 field mới bằng `node` trong image
`nta-web-tools` (đã có trên VPS, chạy `--network none`, không cần secret).

**Cách chạy:** `bash` **trên VPS**, tất cả khối trong **cùng 1 shell** (biến dùng chung). **Dán/chạy TỪNG KHỐI MỘT**, đọc output rồi mới sang
khối sau — **không dán cả loạt** (lệnh `read`/`docker` sẽ nuốt các dòng dán sau nó). Mọi lệnh `cli` không đọc file đều có `</dev/null`
để docker không lấy mất phần đã dán. Thoát shell giữa chừng → `trap` ở khối 0 tự xoá env tạm + thư mục làm việc; dù vậy **dừng ở bước
nào cũng chạy dòng Dọn** ở cuối mục này.

**Khối 0 — thư mục làm việc + tự dọn:**

```sh
cd /opt/actions-runner-nta-web/_work/nta-web/nta-web
umask 077
WORK="$(mktemp -d /root/nta-cr038.XXXXXX)"; ENVF="$WORK/compose.env"
trap 'shred -u "$ENVF" 2>/dev/null; rm -rf "$WORK"' EXIT HUP TERM
```

**Khối 1 — secret cho compose** (như db.md §1b; **1 dòng duy nhất**, dán rồi Enter, gõ/dán từng secret khi thấy prompt — không hiện,
không vào history):

```sh
read -rsp 'POSTGRES_PASSWORD: ' PW; echo; read -rsp 'REVALIDATE_SECRET: ' RS; echo; printf 'POSTGRES_PASSWORD=%s\nREVALIDATE_SECRET=%s\n' "$PW" "$RS" > "$ENVF"; unset PW RS
```

**Khối 2 — biến + hàm:**

```sh
cli() { docker compose --env-file "$ENVF" run --rm --no-deps -T nta-tools tools/db/content-cli.ts "$@"; }
is_num() { case "$1" in ''|*[!0-9]*) return 1 ;; esac; }
SLUG=ai-weekly-2026-w42
COVER=/uploads/9b72253a979b1d87c03bca8a2abf5bac9cef4557356eca763f36a544dba8fc51.jpg
ACTOR="ops:${SUDO_USER:-$(whoami)}"
NOTE="CR-038 tên theo ngày + cover ảnh tin 1"
docker image inspect -f 'image tools: {{.Created}}' nta-web-tools:latest; git log -1 --format='repo: %cI %h' </dev/null
```

Tuỳ chọn — image tools cũ hơn commit `main` ở trên (image build lần cuối bởi workflow ai-news / content-ops) → build lại y như workflow
(`.github/workflows/content-ops.yml` bước "Build nta-tools"):

```sh
docker compose --env-file "$ENVF" --profile tools build nta-tools </dev/null
```

**Khối 3 — backup trước khi ghi** (`backup.sh` exit ≠ 0 khi lỗi / trùng tên):

```sh
BACKUP_OK=0
docker exec nta-db-backup /scripts/backup.sh "ops-cr038-$(date -u +%Y%m%dT%H%M%SZ)" </dev/null && BACKUP_OK=1
echo "BACKUP_OK=$BACKUP_OK"          # 0 → DỪNG, xử lý lỗi backup trước; KHÔNG sang khối 6.
```

**Khối 4 — lấy bản hiện tại (data + version) của 2 locale:**

```sh
rm -f "$WORK/vi.record.json" "$WORK/en.record.json"   # chạy lại khối 4 → buộc chạy lại khối 5, không ghi record cũ
cli show "post/vi/$SLUG" </dev/null > "$WORK/vi.show.json"
cli show "post/en/$SLUG" </dev/null > "$WORK/en.show.json"
VI_N=$(sed -n 's/^  "version": \([0-9][0-9]*\),*$/\1/p' "$WORK/vi.show.json")
EN_N=$(sed -n 's/^  "version": \([0-9][0-9]*\),*$/\1/p' "$WORK/en.show.json")
echo "vi v$VI_N · en v$EN_N"          # GHI RA GIẤY 2 số này (đường rollback). Rỗng → show lỗi, DỪNG.
```

**Khối 5 — `record.json` = `{"data": data cũ + title/excerpt/cover mới}`**, in cũ → mới để soát mắt (bản ghi xoá mềm → lỗi, file rỗng):

```sh
merge() {  # $1 locale, $2 title, $3 excerpt
  docker run --rm -i --network none --entrypoint node nta-web-tools:latest -e '
    const [title, excerpt, cover] = process.argv.slice(1);
    let raw = "";
    process.stdin.on("data", (c) => (raw += c)).on("end", () => {
      const entry = JSON.parse(raw);
      if (entry.deletedAt) throw new Error("bản ghi đang xoá mềm — DỪNG");
      const next = { ...entry.data, title, excerpt, cover };
      for (const k of ["title", "excerpt", "cover"]) console.error(`${k}: ${entry.data[k]}\n   -> ${next[k]}`);
      console.error(`giữ nguyên: ${Object.keys(entry.data).filter((k) => !["title", "excerpt", "cover"].includes(k)).join(", ")}`);
      process.stdout.write(JSON.stringify({ data: next }));
    });' "$2" "$3" "$COVER" < "$WORK/$1.show.json" > "$WORK/$1.record.json"
}
merge vi "Bản tin AI tuần ngày 15/10/2026" "12 điểm tin AI đáng chú ý trong bản tin ngày 15/10/2026, kèm link nguồn gốc."
merge en "AI Weekly Digest — 15 Oct 2026" "12 notable AI news items in the digest of 15 Oct 2026, with links to the original sources."
```

**Khối 6 — ghi, có cổng chặn** (optimistic lock theo version vừa đọc). Chỉ ghi khi backup OK + `VI_N`/`EN_N` là số + 2 `record.json`
không rỗng; không đạt → in lý do, **không** ghi gì. Conflict (`ContentConflictError`) → chạy lại từ khối 4, không ép ghi:

```sh
if [ "$BACKUP_OK" = 1 ] && is_num "$VI_N" && is_num "$EN_N" \
   && [ -s "$WORK/vi.record.json" ] && [ -s "$WORK/en.record.json" ]; then
  cli update "post/vi/$SLUG" --file - --expected-version "$VI_N" --actor "$ACTOR" --note "$NOTE" --confirm-prod < "$WORK/vi.record.json" \
  && cli update "post/en/$SLUG" --file - --expected-version "$EN_N" --actor "$ACTOR" --note "$NOTE" --confirm-prod < "$WORK/en.record.json"
else
  echo "CỔNG CHẶN: backup=$BACKUP_OK vi='$VI_N' en='$EN_N' hoặc record.json rỗng — KHÔNG ghi. Sửa nguyên nhân rồi chạy lại từ khối 3."
fi
```

**Khối 7 — revalidate + kiểm DB:**

```sh
cli revalidate --collection post </dev/null
cli history "post/vi/$SLUG" </dev/null; cli history "post/en/$SLUG" </dev/null   # dòng mới: v$((VI_N+1)) / v$((EN_N+1)) update $ACTOR — CR-038 …
```

Kiểm web (trên VPS qua port `HOST_PORT`, mặc định 3005; hoặc mở trình duyệt `https://ntavietnam.tech`):

```sh
for p in /blog /en/blog "/blog/$SLUG" "/en/blog/$SLUG"; do
  printf '%s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:3005$p"   # 200 cả 4
done
curl -s "http://127.0.0.1:3005/blog/$SLUG"    | grep -c 'Bản tin AI tuần ngày 15/10/2026'   # ≥ 1
curl -s "http://127.0.0.1:3005/en/blog/$SLUG" | grep -c 'AI Weekly Digest — 15 Oct 2026'    # ≥ 1
curl -s http://127.0.0.1:3005/blog    | grep -c 9b72253a979b1d87c03bca8a2abf5bac9cef4557356eca763f36a544dba8fc51   # ≥ 1 (ảnh thẻ mới)
curl -s http://127.0.0.1:3005/en/blog | grep -c 9b72253a979b1d87c03bca8a2abf5bac9cef4557356eca763f36a544dba8fc51   # ≥ 1
```

**Sai → rollback** (về đúng version đọc ở khối 4 — cover SVG v1 vẫn còn trong `public/`, nên rollback qua được I-7), rồi revalidate.
Locale nào chưa được ghi (vd en dừng vì vi conflict) thì bỏ dòng của locale đó. Shell đã đóng → chạy lại khối 0–2 và gán tay
`VI_N=…; EN_N=…` theo số đã ghi ra giấy:

```sh
cli rollback "post/vi/$SLUG" --to "$VI_N" --expected-version "$((VI_N+1))" --note "rollback CR-038" --confirm-prod </dev/null
cli rollback "post/en/$SLUG" --to "$EN_N" --expected-version "$((EN_N+1))" --note "rollback CR-038" --confirm-prod </dev/null
cli revalidate --collection post </dev/null
```

**Dọn** (luôn chạy, dừng ở bước nào cũng vậy — kể cả sau rollback): `shred -u "$ENVF" 2>/dev/null; rm -rf "$WORK"; trap - EXIT HUP TERM`.
Sau khi commit file seed lên `main`: Actions → **Content ops** → `parity` — không còn lệch `post/{vi,en}/ai-weekly-2026-w42`.

Dùng lại cho bài khác: đổi `SLUG`, `COVER` và 2 dòng `merge` (title/excerpt sinh đúng format bằng `format_post_date` / `_frontmatter`
trong `tools/ai-news/generate.py`); sửa cả file seed `src/content/blog/{vi,en}/<slug>.mdx` qua commit thường.
