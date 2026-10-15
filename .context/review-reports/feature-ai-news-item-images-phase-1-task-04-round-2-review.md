Agent: reviewer

# Review — feature-ai-news-item-images · phase-1-task-04 · round 2 (CR-035)

- **Review level:** STRICT
- **Reason:** như round 1 — workflow cron không người duyệt ghi DB prod + `/uploads` prod; runbook gỡ ảnh theo yêu cầu pháp lý (Q1) có lệnh thao tác trực tiếp container prod.
- **Blast radius:** diff chưa commit toàn T04: `.github/workflows/ai-news.yml`, `docs/runbook/ai-news.md`, `docs/DESIGN.md`, `tools/ai-news/README.md`, `tasks/feature-ai-news-item-images/phase-1-task-04.md`. Round 2 đổi: runbook §1/§5/§8, `shell: bash` ở 2 step `publish-db`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (reviewer chạy lại) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26` |
| actionlint | Không chạy lại (ngoài quyền bash reviewer) — Builder: chỉ `runner-label "nta-web"` có sẵn từ HEAD |
| Workflow thật | KHÔNG chạy (đúng yêu cầu) |

## Đối chiếu finding round 1
| Finding r1 | Trạng thái | Bằng chứng |
|---|---|---|
| MAJOR-1 runbook §8 thiếu xoá cache next/image | **Đóng (một phần lệnh mới có vấn đề — xem MAJOR-2)** | §8 bước 4 `docker exec nta-web rm -rf /app/.next/cache/images` — đường dẫn khớp `Dockerfile:2` (WORKDIR `/app`), `:47` standalone chown nextjs, không có volume cache trong `docker-compose.yml` nta-web; `docker exec` mặc định user nextjs → xoá được. TTL 31 ngày khớp `next.config.ts:16`. Bước 5 curl `/_next/image?...` → 404/400 và `/uploads/...` → 404, port 3005 khớp `docker-compose.yml:30`. Giới hạn `immutable` 1 năm khớp `serve-upload.ts:45`. |
| MINOR-1 tên bước cũ | Đóng | `grep "Generate posts"` không còn kết quả; §1 + bảng §5 dùng "Generate items (LLM + guard)" khớp `ai-news.yml:54`; dòng Render đã nằm ngay sau Generate. |
| INFO-1 `shell: bash` | Đóng | Thêm cho "Kiểm bài (dry-run)" và "Chèn bài vào DB". |
| INFO-3 dòng trống | Đóng | §8 bước 2 ghi khối 4 dòng (tag, trống, credit, trống) khớp `generate.py:222`. |
| Tham chiếu chéo | OK | §5 bảng lỗi trỏ "§8 bước 6" — bước 6 (sửa seed) tồn tại sau khi đánh số lại. |

## Kiểm pipefail do `shell: bash` (bash --noprofile --norc -eo pipefail)
- Step dry-run: pipe duy nhất là `printf '%s\n' "$out" | grep -qE '^publish-post post/…status=missing$'` trong `if`. `$out` chỉ gồm stdout (cảnh báo đi `console.warn` → stderr, `content-cli.ts:220-224`), tối đa ~12 dòng image + 2 dòng post (< 2 KB) → printf builtin ghi 1 lần vào pipe buffer 64 KB trước khi grep đọc được dòng khớp → không thể SIGPIPE → pipefail không đổi kết quả. Dòng post in cuối cùng nên càng an toàn. OK.
- `if ! out="$(docker compose run …)"` — command substitution, không pipe; mảng rỗng `"${mount[@]}"` không có `-u` → OK.
- Step chèn bài: không có pipe; `-e` như trước. OK.
- Step "Smoke ảnh tin" (`grep | head || true`) không đặt `shell: bash` → giữ `bash -e {0}`, có `|| true` → không ảnh hưởng.

## Findings

### MAJOR-2 (mới, do bản sửa MAJOR-1) — Lệnh thay thế "force-recreate nta-web" trong runbook §8 bước 4 có thể đưa prod về `CONTENT_SOURCE=file` và mất `CONTACT_FORM_TARGET`
- **File:** `docs/runbook/ai-news.md:141` — `(hoặc tạo lại container: docker compose up -d --no-deps --force-recreate nta-web)`.
- `docker-compose.yml:40` `CONTENT_SOURCE: ${CONTENT_SOURCE:-file}` (CI lấy từ GitHub Variable; prod = `db` từ 14/10/2026), `:35` `CONTACT_FORM_TARGET: ${CONTACT_FORM_TARGET:-}`, `:36-37` POSTGRES_PASSWORD/REVALIDATE_SECRET bắt buộc. Runbook không hướng dẫn env file (`db.md` §1b) và `db.md` §1b cũng không có `CONTENT_SOURCE`.
- **Failure scenario:** người trực xử lý yêu cầu gỡ ảnh, chọn nhánh "tạo lại container" trên VPS với env file theo `db.md` §1b (hoặc export 2 secret để lệnh không lỗi) → `nta-web` được tạo lại với `CONTENT_SOURCE=file` → web prod đọc nội dung từ file seed: mọi sửa đổi chỉ có trong DB (bot nội dung CR-030, update gỡ ảnh vừa làm ở bước 2) biến mất khỏi web, và vì bước 6 (sửa seed) chưa làm nên **ảnh vừa gỡ hiện lại** trong bài; đồng thời form liên hệ mất đích nếu thiếu `CONTACT_FORM_TARGET`. Healthcheck vẫn xanh → không ai biết.
- **Đề xuất (Builder):** bỏ nhánh force-recreate (chỉ giữ `docker exec … rm -rf /app/.next/cache/images`), hoặc nếu giữ thì bắt buộc dùng env file `db.md` §1b **kèm `CONTENT_SOURCE=db`** (+ `CONTACT_FORM_TARGET`) và cảnh báo rõ; cách an toàn khác: chạy workflow Deploy (lấy đúng Variable/secret).

### INFO-4 — Bước 5 kiểm `/_next/image` với 1 cặp `w/q`
- Xoá cả thư mục cache nên mọi biến thể `w/q` đều mất; curl 1 biến thể là đủ chứng minh. Không chặn.

## Residual risk
- Như round 1: chưa chạy workflow thật (artifact khi "Re-run failed jobs", quyền đọc bind `:ro` uid 1001), local DB end-to-end chưa làm.
- Lệnh §8 chưa thử trên VPS thật (đường dẫn cache suy từ Dockerfile/compose).

## Verdict: **FAIL**
Lý do: MAJOR-2 — lệnh runbook mới thêm có đường đi gây hồi quy prod âm thầm (CONTENT_SOURCE về `file`, ảnh đã gỡ hiện lại). Toàn bộ finding round 1 đã đóng; workflow YAML + pipefail đạt. Round 3 chỉ cần sửa 1 dòng runbook §8 bước 4.
