# Review — feature-ai-news-naming-images · phase-1-task-03 · round 1

Agent: reviewer

- **Review level:** STRICT
- **Reason:** runbook ghi dữ liệu DB prod (`update` thay toàn bộ `data`, `--confirm-prod`), xử lý secret (POSTGRES_PASSWORD / REVALIDATE_SECRET), rollback.
- **Blast radius:** `post/{vi,en}/ai-weekly-2026-w42` (file seed + DB prod khi user chạy runbook), thẻ bài /blog, /en/blog, trang chủ, bài liên quan.
- **Scope diff (chưa commit):** `src/content/blog/{vi,en}/ai-weekly-2026-w42.mdx`, `docs/runbook/ai-news.md` (§9 mới), `tasks/feature-ai-news-naming-images/phase-1-task-03.md`.
- Không có lệnh nào chạy lên DB thật trong review/build (chỉ `git diff`, `npm test` local, không có `DATABASE_URL`).

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `git diff` | seed: đúng 3 dòng/locale (title, excerpt, cover); slug/date/category/body không đổi |
| `npm test` | 195 tests · 192 pass · 2 skip (thiếu `TEST_DATABASE_URL`) · **1 fail có sẵn** `tools/db/content-rules.test.ts` (thiếu `public/uploads` local, 9 đường dẫn `/uploads` — cover mới trùng ảnh tin 1 đã có trong body nên không thêm phần tử) → **không fail mới** |
| typecheck / lint / build | không chạy lại (diff chỉ MDX + doc); builder ghi typecheck/lint PASS, build Blocked do môi trường (native binding) — như task-02 |

## Đã kiểm — đạt
1. **Giá trị seed khớp generator** (`tools/ai-news/generate.py:190-209`): `date: "2026-10-15"` → vi `15/10/2026` (`{day:02d}/{month:02d}/{year}`), en `15 Oct 2026` (`MONTH_ABBR_EN[9]`); item_count = 12 (12 heading `## N.` mỗi locale). Title/excerpt vi + en trùng từng ký tự với f-string (kể cả em dash `—`, `ensure_ascii=False`).
2. **Cover = ảnh tin đầu tiên có ảnh**: `<NewsImage src=…9b72253a….jpg>` ở dòng 14 cả vi + en (tin 1) = `images[min(images)]` (`generate.py:245`). Cùng giá trị trong bảng runbook + task.
3. **CLI syntax** (`tools/db/content-cli.ts`): `update <collection/locale/slug> --file - --expected-version N --actor --note --confirm-prod` hợp lệ (`COMMAND_SCOPED_FLAGS`); payload `{data}` không có `body`/`sortOrder` → giữ nguyên (`readPayload`, `updateEntry`); `rollback --to N --expected-version N+1 --note --confirm-prod` không kèm `--actor` (đúng — rollback không nhận `--actor`); `revalidate --collection post` đúng (không cần DB, dùng `REVALIDATE_URL` của compose); `show` in `JSON.stringify(entry, null, 2)` → regex `^  "version": N,` chỉ bắt key top-level (data lồng 4 space).
4. **Merge giữ đủ field**: `{ ...entry.data, title, excerpt, cover }` giữ mọi key cũ, in cũ→mới + danh sách key giữ nguyên; dừng nếu `deletedAt`. `node -e … a b c` → `process.argv.slice(1)` đúng. Chạy `--network none`, không secret.
5. **Image / path**: `nta-web-tools:latest` = `image:` của service `nta-tools` (`docker-compose.yml:126`, target `content-tools` có `node`, `src`, `tools/db`, `public`); repo VPS `/opt/actions-runner-nta-web/_work/nta-web/nta-web` khớp `docs/runbook/deploy-vps.md:17`, `db.md:6`; `docker exec nta-db-backup /scripts/backup.sh "ops-…"` khớp `content-ops.yml:85`, `ai-news.yml:215`. `docker compose run nta-tools` không cần `--profile` (service được target trực tiếp — như workflow).
6. **Secret**: `read -rs` + `umask 077` + `mktemp /root/…` (ngoài repo) + `unset` + `shred -u` — y hệt `db.md` §1b; không echo, không đặt secret trên dòng lệnh.
7. **I-7 / rollback**: cover `/uploads/…` là asset sống trong DB (body bài đã tham chiếu, đăng qua publish-post); rollback về v cũ (`/images/blog/ai-weekly-cover.svg`) qua được I-7 vì SVG còn trong `public/` và image tools `COPY public`.
8. **Seed/DB parity**: sau update, data DB = frontmatter seed (merge giữ key DB, 3 field mới trùng seed) → `parity` hết lệch w42; runbook có bước parity sau khi seed lên main.
9. Fixture `tools/db/fixtures/blog/**` không đổi (đúng scope).

## Findings

### M1 (Medium, blocking) — Runbook không chạy được khi dán nguyên khối, dễ chạy dở dang
§9 ghi "Chạy … từ đầu đến cuối trong **cùng 1 shell**" với 1 khối code lớn, mời dán nguyên khối, nhưng:
- `read -rs PW` / `read -rs RS` không có prompt (`-p`): dán cả khối → `read` lấy **dòng code kế tiếp** làm password (ghi rác vào `$ENVF`, nuốt mất dòng `cli() {…}`).
- `cli show …`, `cli history …`, `cli revalidate …` dùng `docker compose run` (mặc định `-i`, stdin = terminal) → docker CLI **đọc nốt phần đã dán còn trong buffer tty** chuyển vào container → các dòng sau bị nuốt, không chạy.
Hậu quả an toàn (không ghi sai — `update` có validate version/JSON) nhưng thao tác prod chạy dở, khó biết bước nào đã chạy.
**Sửa gợi ý:** tách §9 thành các khối nhỏ ghi rõ "dán/chạy từng khối, đọc output rồi mới sang khối sau"; secret: `read -rsp 'POSTGRES_PASSWORD: ' PW; echo` (tương tự RS) trong khối riêng; thêm `</dev/null` cho các lệnh `cli` không đọc file (show/history/revalidate/rollback), hoặc dùng `cli() { docker compose … run --rm --no-deps -T nta-tools … "$@"; }` + gọi `cli show … </dev/null`.

### M2 (Medium, blocking) — Không có cổng "backup OK" trước bước ghi
Bước 1 backup thất bại (container tên khác / đĩa đầy / `backup.sh` trả FAILED khi trùng tên) không chặn bước 4 `update --confirm-prod`. Acceptance "Có backup trước khi ghi" chỉ đạt về mặt chữ.
**Sửa gợi ý:** `docker exec nta-db-backup /scripts/backup.sh "ops-cr038-…" || { echo "BACKUP FAIL — DỪNG, không chạy bước ghi"; }` và ghi rõ chỉ sang bước 4 khi thấy backup OK + `VI_N`/`EN_N` không rỗng + 2 file `*.record.json` không rỗng (vd `[ -s "$WORK/vi.record.json" ] && [ -s "$WORK/en.record.json" ]`).

### L1 (Low, non-blocking) — Dọn secret phụ thuộc thao tác tay
Không có `trap` — thoát giữa chừng thì `$ENVF` (mode 600, /root) còn lại. Nhất quán với `db.md` §1b; có thể thêm nhắc "dù dừng ở bước nào cũng chạy dòng Dọn".

### L2 (Low, non-blocking) — Image tools có thể cũ
`docker compose run` dùng image `nta-web-tools:latest` sẵn có (build lần ai-news gần nhất). Đủ cho `update/rollback` hiện tại; có thể ghi tuỳ chọn `docker compose --env-file "$ENVF" --profile tools build nta-tools` nếu muốn khớp commit mới nhất.

## Verdict
**FAIL** — nội dung (giá trị seed, cú pháp CLI, merge giữ field, rollback, secret, image/path, parity) đúng; chỉ cần sửa doc runbook §9 theo M1 + M2 (không đổi seed). Không có fail test mới. Không commit/push.
