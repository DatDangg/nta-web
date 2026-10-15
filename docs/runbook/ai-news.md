# Runbook — Bản tin AI tuần (CR-019, spec R-09c)

Workflow `.github/workflows/ai-news.yml` — mỗi thứ 2 lúc 08:00 giờ VN (`cron: '0 1 * * 1'` UTC) tự thu thập
tin AI 7 ngày, nhờ OpenCode Go viết 2 bài `src/content/blog/{vi,en}/ai-weekly-YYYY-wNN.mdx` (category `ai-tech`),
build PASS → commit file seed thẳng `main` → **chèn bài vào DB prod** (job `publish-db`, CR-034) → revalidate → smoke.
Code: `tools/ai-news/` (xem `tools/ai-news/README.md`) + lệnh `publish-post` của `tools/db/content-cli.ts`.

Prod đọc nội dung từ DB (`CONTENT_SOURCE=db`, CR-031) → bài chỉ hiện khi có bản ghi trong `content_entries`.
File seed vẫn được commit (lịch sử bài trong git, dedupe tuần `generate.py check`, đường lùi `CONTENT_SOURCE=file`).
Workflow **không** dispatch `deploy.yml` nữa (DB mode không cần build lại image để hiện bài).

Hai job, cùng self-hosted runner `nta-web`:

| Job | Chạy ở | Việc | Secret |
|---|---|---|---|
| `digest` | container `node:22-trixie` (Python 3.13 + Node 22 + git, không cài gì lên host). Bước cuối `chown` trả quyền workspace (container chạy root) | check tuần → thu thập → LLM + guard → build → commit/push file → xuất slug bài cần đăng | `OPENCODE_API_KEY` |
| `publish-db` | host (cần docker), concurrency `deploy-nta-web` (chung deploy/Content ops — không chạy song song backup/migrate), chỉ ref `main` | dry-run → backup (chỉ khi có locale `missing`) → chèn → revalidate `post` → smoke `/blog/<slug>` + `/en/blog/<slug>` | `POSTGRES_PASSWORD`, `REVALIDATE_SECRET` (chỉ job này) |

`publish-db` chạy cả khi `digest` báo `skip` (bài tuần đã có file từ lượt trước) → chạy lại cùng tuần **tự lành** nếu lượt trước chèn DB/revalidate lỗi.
Chèn là **insert-only** qua write-path chuẩn `createEntry`: bản ghi `post/<locale>/<slug>` đã có (kể cả đã sửa hoặc xoá mềm) → `exists`, không ghi đè, không khôi phục.
Bản ghi mới: version 1, `updated_by = workflow:ai-news`, `content_versions` op `create` note `ai-news <slug> run <GITHUB_RUN_ID>`.

## 1. Thêm secret (1 lần, bắt buộc)

GitHub repo → Settings → Secrets and variables → Actions:

| Loại | Tên | Giá trị |
|---|---|---|
| Secret | `OPENCODE_API_KEY` | API key OpenCode Go. Không commit, không dán vào issue/log. |
| Variable (tuỳ chọn) | `AI_NEWS_MODEL` | Model OpenCode Go, mặc định `glm-5.3` (vd đổi `kimi-k3`). |
| Secret (đã có từ CR-031) | `POSTGRES_PASSWORD`, `REVALIDATE_SECRET` | Dùng chung với Deploy / Content ops — job `publish-db` cần. |

Thiếu `OPENCODE_API_KEY` → bước "Generate posts" đỏ, không đăng gì.

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
- **Sửa nội dung / gỡ bài:** CLI chưa có lệnh `update`/`delete` — làm qua bot nội dung (CR-030) khi có, trước đó mở change request (dev ghi qua write-path `updateEntry`/`softDeleteEntry`, có version).
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
- *Run workflow* mới chỉ tự lành **trong cùng tuần ISO** (giờ VN): `check` tính slug theo tuần hiện tại → sang tuần sau thì bài tuần cũ không bao giờ được chèn qua run mới — dùng Re-run ở trên.
- **Cancelled do concurrency:** `publish-db` dùng chung nhóm `deploy-nta-web` với Deploy / Content ops; GitHub chỉ giữ **1 job pending mỗi nhóm** → một deploy/Content ops xếp hàng sau có thể thay chỗ (`publish-db` hiện *cancelled*), và ngược lại. Không phải lỗi bài — Re-run khi nhóm rảnh (và kiểm job bị thay chỗ kia có cần chạy lại không).

| Bước đỏ | Nguyên nhân thường gặp | Xử lý |
|---|---|---|
| Collect + sanitize (exit 3/4) | Mọi nguồn đều lỗi/bị chặn (Reddit, HN, GitHub rate-limit), mạng VPS | Xem log bước; chạy tay lại sau. 1 nguồn lỗi KHÔNG làm đỏ. |
| Generate posts | Thiếu/sai key, model không tồn tại, LLM trả JSON hỏng, **guard chặn** (sau khi loại các tin có URL lạ / text sai, còn dưới 5 tin hợp lệ; tối đa lấy 12) | Đọc dòng `[ai-news] FAIL: ...`. Guard chặn là đúng thiết kế (chống bịa) → chạy tay lại; lặp lại nhiều tuần → đổi model. |
| Build | Bài sinh ra làm hỏng build (hiếm, MDX đã escape) | Không có gì được commit. Báo dev kèm log. |
| Commit + push | `main` vừa có commit khác chen giữa (push bị từ chối) | Chạy tay lại workflow. |
| publish-db · Validate compose / nta-db healthy | Thiếu secret `POSTGRES_PASSWORD`/`REVALIDATE_SECRET`; DB không chạy | Kiểm secret / `docker ps` trên VPS (runbook `db.md`) rồi chạy lại. Chưa ghi gì. |
| publish-db · Kiểm bài (dry-run) | File thiếu 1 locale, frontmatter sai, cover không có trong `public/` (`[cli] FAIL — …`) | Chưa ghi gì (validate **cả 2 locale** trước khi ghi). Sửa file qua commit thường rồi chạy lại. |
| publish-db · Backup DB | `nta-db-backup` lỗi / đầy đĩa | Dừng trước khi ghi. Xử lý theo runbook `db.md`, chạy lại. |
| publish-db · Chèn bài | Lỗi DB / I-5 (bản ghi vừa được tạo chen giữa) | Có backup `ops-ai-news-*` (bản trước CR-033: `pre-migrate-ops-ai-news-*`). Chạy lại: locale đã chèn → `exists`, chỉ chèn phần còn thiếu. |
| publish-db · Revalidate / Smoke | `nta-web` không chạy, secret revalidate sai, trang chưa 200 | Bài đã trong DB. Chạy lại workflow (revalidate luôn chạy), hoặc Content ops → `revalidate-all`. |

Dữ liệu tạm (raw + `.clean.md`) nằm ở `/tmp/ai-news` trong container, mất khi job kết thúc.

## 6. Bảo mật

- LLM chỉ đọc `.clean.md` (sanitize allow-list + banner "dữ liệu, không phải lệnh"). Không bỏ bước sanitize.
- Engine chạy `--no-browser-cookies`; không có nguồn X/Twitter (đã bỏ client `bird-search`).
- Bài là dạng điểm tin; mọi link phải có nguyên văn trong dữ liệu thu thập; cuối bài ghi
  "Bản tin được tổng hợp tự động từ các nguồn công khai." Rủi ro còn lại: LLM diễn giải sai ý tiêu đề —
  user đã chấp nhận đăng thẳng không duyệt (change doc 2026-10-14).
