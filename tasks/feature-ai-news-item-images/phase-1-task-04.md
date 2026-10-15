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
_(chưa làm — chờ user duyệt plan)_
