# feature-ai-news-item-images · phase-1-task-04 — Workflow `ai-news.yml`: chuyển ảnh digest → publish-db (artifact) + docs

- **CR:** CR-035 · deps: task-01, task-02 (task-03 độc lập, phải xong trước khi lên prod)
- **Classification / Risk:** ADDITIVE (CI/ops ghi prod) · **HIGH**
  - Expected review level: **STRICT** — workflow cron không người duyệt, ghi DB + volume upload prod, VPS dùng chung.
  - Blast radius: `.github/workflows/ai-news.yml`, `docs/runbook/ai-news.md`, `tools/ai-news/README.md`, `docs/DESIGN.md` § Vận hành. Không đổi `deploy.yml` / `content-ops.yml` / compose (volume `/app/uploads` của `nta-tools` đã có — `docker-compose.yml:135-137`).
  - Doc impact: 3 doc trên + `SPECIFICATIONS.md` R-09c (spec delta — Spec Publisher sau PASS).

## Quyết định user (2026-10-15)
Q1 chấp nhận rủi ro bản quyền + runbook gỡ ảnh · Q2 "Ảnh: <tên miền>" dưới ảnh + chú thích cuối bài · Q3 bỏ GIF · Q4 tự bỏ ảnh trùng. Plan đã duyệt.

## Scope
1. Job `digest`: tách 2 bước — Generate (`OPENCODE_API_KEY`) `--items-out "$AI_NEWS_WORK/items.json"` → Render (KHÔNG key) `render --items-json … --images-out "$AI_NEWS_WORK/images"` (trừ khi `vars.AI_NEWS_IMAGES == 'off'` → `--no-images`); sau Commit + push → `actions/upload-artifact@v4` tên `ai-news-images-<slug>` (chỉ `*.jpg|*.png|*.webp|manifest.json`, `retention-days: 7`, `if-no-files-found: ignore`). Job `digest` **vẫn không có** secret DB/revalidate; fetch ảnh chạy trong container `digest` (không docker socket).
2. Job `publish-db`: `actions/download-artifact@v4` vào `$RUNNER_TEMP/ai-news-images` (không có artifact → bỏ qua); `docker compose run --rm --no-deps -v "$RUNNER_TEMP/ai-news-images:/in:ro" nta-tools … publish-post "$SLUG" --images-dir /in` ở cả bước dry-run và bước ghi (không có thư mục → không truyền cờ). Backup vẫn chỉ khi dry-run `missing` (quy ước CR-033). Xoá thư mục tạm cuối job (`if: always()`).
3. Smoke thêm: manifest có ảnh → `curl -fsS -o /dev/null http://127.0.0.1:${HOST_PORT}/uploads/<1 file>` 200.
4. **Chạy lại / tự lành**: bài đã `exists` → không cần ảnh. Digest đã push MDX có ảnh nhưng `publish-db` đỏ trước khi chèn → **"Re-run failed jobs"** của CHÍNH run đó (artifact còn 7 ngày). Lượt `skip` ở run khác không có artifact → dry-run đỏ với thông báo rõ "thiếu ảnh /uploads/… — re-run publish-db của run đã sinh bài". Ghi rõ trong runbook.
5. Docs — thêm **mục gỡ 1 ảnh khi bị yêu cầu (Q1)**: tìm asset theo path (`db:cli list --collection asset`/`show`), sửa bài vi+en bỏ dòng `<NewsImage>` + dòng nguồn qua `db:cli update`, xoá mềm asset (`db:cli delete`), xoá file khỏi volume nếu cần, revalidate; sửa luôn file seed trong git. Ngoài ra: runbook (luồng ảnh, guard, tắt khẩn cấp `AI_NEWS_IMAGES=off`, xử lý đỏ, re-run), README (ranh giới tin cậy: fetch trang tin chỉ lấy meta og:image, HTML không tới LLM), DESIGN § Vận hành.

## Acceptance
- [ ] Lượt chạy có bài mới: `/blog/<slug>` + `/en/blog/<slug>` 200, ảnh phục vụ từ `/uploads/…` (không URL ảnh ngoài trong HTML bài), asset actor `workflow:ai-news`.
- [ ] Tin không ảnh hiển thị text như cũ; bài các tuần trước không đổi.
- [ ] Runbook có mục gỡ ảnh (Q1).
- [ ] Workflow tách bước: `generate --items-out` (có OPENCODE_API_KEY) → `render --images-out` (KHÔNG key) (W3a).
- [ ] Dòng dry-run ảnh không làm grep backup sai (W2: bài exists thì không in dòng ảnh; nếu có, đổi grep cho khớp đúng dòng bài).
- [ ] Secret DB chỉ ở `publish-db`; artifact chỉ chứa ảnh + manifest.

## Verification plan
- `actionlint` / đọc lại YAML (`if`, `needs`, outputs, tên artifact, mount ro, phạm vi secret).
- Local: output task-01 → task-02 trên DB dev bằng đúng lệnh docker compose của workflow.
- Prod: chỉ sau push + user cho phép. Tuần hiện tại w42 đã có bài → lượt dispatch chỉ `skip/exists`; kiểm thật có ảnh ở lượt cron 19/10 (w43) — hỏi user khi tới bước này.

## Retry / Escalation
Như task-01.

## Verification summary
Builder 2026-10-15 (chưa chạy workflow thật — prod verify chờ user, lượt cron w43):
- File: `.github/workflows/ai-news.yml`, `docs/runbook/ai-news.md` (§1 var, §2, §5 re-run/bảng lỗi, §6, §7 ảnh tin, §8 gỡ ảnh), `tools/ai-news/README.md`, `docs/DESIGN.md` § Vận hành.
- digest: Generate `--items-out` (chỉ bước này có `OPENCODE_API_KEY`) → Render `render --items-json --images-out` / `--no-images` khi `vars.AI_NEWS_IMAGES == 'off'`, `timeout-minutes: 10` (note T01) → Build → upload-artifact `ai-news-images-<slug>` (jpg/png/webp/manifest, 7 ngày, ignore, `overwrite: true`) → Commit + push. Không thêm secret DB/docker socket.
- publish-db: download-artifact (`continue-on-error`) → dry-run/chèn chỉ mount `:ro` + `--images-dir /in` khi có `manifest.json` (note T02 INFO-1); không artifact + dry-run lỗi → `::error::` hướng dẫn Re-run; grep `^publish-post post/[a-z]+/[^ ]+ status=missing$` (chỉ dòng bài, note T02); smoke 1 ảnh `/uploads` lấy từ MDX seed; dọn `$RUNNER_TEMP/ai-news-images` `if: always()`.
- actionlint (docker rhysd/actionlint, có shellcheck): chỉ lỗi `runner-label "nta-web"` — có sẵn ở bản HEAD (custom label self-hosted), không lỗi mới. `bash -n` 18 khối run PASS. Mô phỏng bước dry-run với docker giả: fail/không artifact → `::error::` exit 1; image missing + post exists → `missing=false`; có manifest → mount `:ro` + `--images-dir /in`, `missing=true`.
- `npm run lint` PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26`) · `npm run typecheck` PASS · python unittest ai-news 76 test OK (python:3.13-slim). Không có test nào tham chiếu `ai-news.yml`.
- Deviation: upload-artifact đặt **trước** Commit + push (scope ghi "sau") — upload lỗi thì chưa có bài trỏ `/uploads` trên main; push lỗi sau upload chỉ để lại artifact thừa. Smoke ảnh lấy path từ MDX thay vì manifest (chạy được cả khi không có artifact).
- Residual risk: chưa chạy thật (download-artifact ở "Re-run failed jobs" lấy artifact của attempt trước — theo docs GitHub, chưa kiểm thực tế); `continue-on-error` ở download che lỗi tải khác (dry-run vẫn chặn nếu bài cần ảnh); Local DB dev end-to-end (verification plan) chưa làm.

Sửa review r1 (Builder 2026-10-15, report `.context/review-reports/feature-ai-news-item-images-phase-1-task-04-round-1-review.md`):
- MAJOR-1: runbook §8 thêm bước 4 "Xoá cache next/image": `docker exec nta-web rm -rf /app/.next/cache/images` (hoặc `docker compose up -d --no-deps --force-recreate nta-web`). Đường dẫn: WORKDIR `/app` + standalone `.next` (`Dockerfile:2,47`), không có volume cache trong `docker-compose.yml` nta-web, TTL 31 ngày `next.config.ts:16`. Bước 5 kiểm `curl` `/_next/image?url=%2Fuploads%2F<sha256>.<ext>&w=1080&q=75` → 404/400 và `/uploads/<sha256>.<ext>` → 404; ghi giới hạn `immutable` 1 năm (`serve-upload.ts:45`) ngoài tầm kiểm soát. Bước sửa seed thành 6; tham chiếu §5 "§8 bước 5" → "bước 6".
- MINOR-1: runbook :34 + bảng lỗi đổi "Generate posts" → "Generate items (LLM + guard)" (`ai-news.yml:54`); dòng "Render posts + ảnh tin" chuyển lên ngay sau Generate.
- INFO-3: §8 bước 2 ghi rõ bỏ khối 4 dòng (tag, trống, credit, trống — `generate.py:222`).
- INFO-1: thêm `shell: bash` cho "Kiểm bài (dry-run)" và "Chèn bài vào DB" (dùng mảng bash). Lưu ý: `shell: bash` tường minh = `bash --noprofile --norc -eo pipefail` (thêm pipefail); `printf | grep -q` trong `if` với output nhỏ (< pipe buffer) không bị SIGPIPE → không đổi kết quả.
- actionlint (docker rhysd/actionlint 1.7.12, shellcheck): chỉ 2 lỗi `runner-label "nta-web"` có sẵn — không lỗi mới. Không chạy workflow; không commit.

## Note từ review T01/T02 (2026-10-15)
- T01 r2 MINOR: watchdog nổ khi `conn.sock` còn None → đặt `timeout-minutes` cho bước Render ảnh (lưới an toàn cuối).
- T02 INFO-1: có `--images-dir` thì `publish-post` luôn đọc manifest (kể cả bài đã `exists`) → chỉ truyền cờ khi thư mục artifact + `manifest.json` tồn tại.
- T02: dòng `publish-post image … status=missing` cũng khớp grep ` status=missing$` (`ai-news.yml:145`) — xét lại grep cho rõ (chỉ dòng bài).
