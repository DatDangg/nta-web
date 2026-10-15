# Runbook — Bản tin AI tuần (CR-019, spec R-09c)

Workflow `.github/workflows/ai-news.yml` — mỗi thứ 7 lúc 08:00 giờ VN (`cron: '0 1 * * 6'` UTC; CR-036 đổi từ thứ 2) tự thu thập
tin AI 7 ngày, nhờ OpenCode Go viết 2 bài `src/content/blog/{vi,en}/ai-weekly-YYYY-wNN.mdx` (category `ai-tech`),
kèm **ảnh tin** (og:image của trang tin, lưu về `/uploads`, CR-035), build PASS → commit file seed thẳng `main` → **chèn bài vào DB prod** (job `publish-db`, CR-034) → revalidate → smoke.
Code: `tools/ai-news/` (xem `tools/ai-news/README.md`) + lệnh `publish-post` của `tools/db/content-cli.ts`.

Prod đọc nội dung từ DB (`CONTENT_SOURCE=db`, CR-031) → bài chỉ hiện khi có bản ghi trong `content_entries`.
File seed vẫn được commit (lịch sử bài trong git, dedupe tuần `generate.py check`, đường lùi `CONTENT_SOURCE=file`).
Workflow **không** dispatch `deploy.yml` nữa (DB mode không cần build lại image để hiện bài).

Hệ quả đổi lịch sang thứ 7 (CR-036): bài mang số ISO week của chính tuần chạy (thứ 2 → CN, giờ VN), `date` frontmatter = ngày chạy (thứ 7), tối đa 1 bài/tuần, bài cũ không đổi.
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
