# Agent: reviewer — feature-content-database · phase-4-task-01 (phần A) · round 1

- **CR:** CR-031 · R-16, R-16b, R-16c, R-27 (4.2.0) · Task: `tasks/feature-content-database/phase-4-task-01.md` (phần A — chuẩn bị, chưa chạm prod)
- **Review level:** STRICT
- **Reason:** CI/CD deploy prod (`deploy.yml`), workflow mới chạy trên self-hosted runner VPS dùng chung với secret DB/revalidate (`content-ops.yml`), Dockerfile target mới + `.dockerignore` (build context image web), compose đổi phụ thuộc khởi động `nta-web` (R-27), lệnh ghi DB prod (import seed, upload), runbook cutover.
- **Blast radius:** image `nta-web` (builder `COPY . .` giờ có `tools/db`), container `nta-web` (env `CONTENT_SOURCE`, `depends_on nta-db`), service mới `nta-tools` (profile tools), DB `nta-db` prod (qua workflow ops), thư mục `/opt/nta-web-data/uploads` + `db-backups` (vòng giữ `pre-migrate-*`), concurrency group `deploy-nta-web`. Bỏ qua theo yêu cầu: `docs/content-bot/`, `spec/changes/2026-10-14-telegram-content-bot.md`, `.context/progress.json`, `.context/runs/*`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn (`src/components/mdx/index.tsx:25`, ngoài diff) |
| `npm test` | 95 tests: 93 pass, 0 fail, 2 skip (cần `TEST_DATABASE_URL`). Diff không đổi TS → hồi quy OK; test DB dựa evidence Builder (112/111/0/1) |
| `docker compose config --quiet` (env giả) | **Không chạy** — ngoài quyền bash của reviewer (`permission.bash "*": deny`, docker không được allow). Dựa evidence Builder (OK với giá trị giả) + đọc tay: nội suy `${CONTENT_SOURCE:-file}`, `${...:?}` hợp lệ, `profiles`, `depends_on.condition`, `user`, `mem_limit` đúng schema |
| Parse YAML / actionlint | **Không chạy** (ngoài quyền; actionlint không cài theo Builder). Đọc tay 3 file: thụt lề, `on.workflow_dispatch.inputs` (choice/string), `if: env.X == '...'` (context `env` dùng được ở `steps[*].if`), `concurrency`, `permissions` hợp lệ |
| `docker build --target content-tools` / web image | Không chạy (ngoài quyền) — xem Residual risk R1 |

## Skill gates
| Gate | Kết quả |
|---|---|
| aislop | N/A — diff không có TS/JS (YAML, Dockerfile, compose, docs) |
| oxlint (anti-slop) | N/A — không đổi TS/JS; repo chưa cấu hình oxlint |
| ocr | skip, ocr not installed |
| AI-readable | OK — mỗi bước workflow 1 việc, tên bước rõ, comment nêu WHY (vì sao `--no-deps`, vì sao user có passwd, vì sao validate cờ) |
| ai-friendly-web / Responsive | N/A — không đổi UI/robots/sitemap |
| blitzstrike | skip, không có môi trường pentest được phép |

## (1) An toàn khi push ngay (prod vẫn `file`)
| Kiểm | Kết quả | Bằng chứng |
|---|---|---|
| Variable chưa đặt → `file` | OK | `deploy.yml:28` `vars.CONTENT_SOURCE \|\| 'file'`; compose `:41` `${CONTENT_SOURCE:-file}`; bước validate `:41-46` chỉ nhận `file\|db`, chạy **trước** mọi bước DB/build → giá trị lạ dừng sớm, web cũ giữ nguyên |
| `depends_on nta-db: service_healthy` | OK | deploy đã `up -d --wait nta-db` (`:51`) trước `up -d --remove-orphans` (`:71`) → không thêm đường lỗi mới; config `nta-db` không đổi → không bị recreate. Reboot: daemon restart theo `restart: unless-stopped`, không xét `depends_on` (đúng comment `docker-compose.yml:44`) — ở chế độ `db` có thể 500 ngắn khi DB chưa lên (đúng thiết kế R-16, spec-validator đã nêu) |
| `up -d --remove-orphans` có tạo `nta-tools`? | OK | service có `profiles: ["tools"]` → không start khi không bật profile; không bị coi là orphan (vẫn khai trong file); container `run --rm` tự xoá |
| Lần push đầu | OK (dự kiến) | env `nta-web` thêm `CONTENT_SOURCE=file` + image mới → recreate như mọi deploy |
| Dockerfile: image runner/migrator | OK | stage `content-tools` nằm trước `runner`, stage cuối vẫn `runner` (compose `nta-web` không đặt target) → BuildKit bỏ qua stage không cần. `migrator` không đổi. Runner chỉ copy `.next/standalone`, `static`, `public` → `tools/db` không vào image web |
| Builder stage + `tools/db` trong context | OK (rủi ro thấp) | `tsconfig.json` include `**/*.ts` → `next build` trong Docker giờ typecheck cả `tools/db/**` (kể cả test + test-stubs). Đã grep: `tools/db` chỉ import `../../src/*` + nội bộ, không import `tools/<khác>` (bị loại khỏi context) → không vỡ type. Cache layer builder invalid khi `tools/db` đổi (Builder đã ghi) |
| `.dockerignore` lọt file nhạy cảm | OK | `!tools/db` chỉ mở lại 1 thư mục; file tracked: `*.ts`, test, test-stubs — không có secret/data. `.env*` chỉ khớp gốc nhưng `tools/db` không có `.env` (checkout CI sạch) |

## (2) `content-ops.yml`
| Kiểm | Kết quả | Bằng chứng |
|---|---|---|
| Injection qua input | OK | `inputs.command/confirm` chỉ đi qua `env` (`:42-43`), mọi `run:` dùng `"$OPS_COMMAND"`/`"$OPS_CONFIRM"` có quote; không có `${{ inputs.* }}` trong script |
| Whitelist lệnh | OK | `type: choice` + `case` lặp lại ở bước 1 (`:56-61`), `*) exit 1` |
| Confirm gõ chữ cho lệnh ghi | OK | `import-seed` ↔ `IMPORT-SEED-PROD`, `upload-smoke` ↔ `UPLOAD-PROD`; `revalidate-all` không ghi DB (chỉ xoá cache) — chấp nhận không confirm |
| Backup trước ghi | OK | `:81-83` cho backup/import-seed/upload-smoke, chạy trước build/import; lỗi → job dừng (bash `-e`). Nhãn `pre-migrate-ops-<cmd>-<UTC>-<run>` qua được whitelist `backup.sh:19-23` (`pre-migrate-*`, ký tự `[A-Za-z0-9._-]`), không ghi đè (`:64`) |
| Concurrency với deploy | OK (xem F3) | cùng group `deploy-nta-web`, `cancel-in-progress: false` |
| Permissions | OK | `contents: read` |
| Không echo secret / config -q | OK | secret chỉ ở `env`; `docker compose config --quiet`; `echo "$out"` chỉ in stdout CLI upload (không chứa `DATABASE_URL`) |
| Runner label | OK | `[self-hosted, nta-web]` như deploy → cùng workspace → cùng compose project → `run` vào đúng mạng có `nta-db` |
| Lỗi → fail rõ | OK | health `nta-db` (`:66-70`); migration `applied` vs `expected` (`:89-95`) — DB chưa có schema `drizzle` → psql lỗi trong `$(...)` → `-e` dừng; owner upload (`:72-78`) in lệnh sửa |
| `import-seed` chỉ chèn + `--confirm-prod` | OK | `import-seed.ts:40` từ chối khi URL prod thiếu cờ; `seed-db.ts` ON CONFLICT DO NOTHING (Builder chứng minh chạy lại = chèn 0, bỏ qua 136); parity chạy ngay sau |
| upload-smoke kiểm owner trước ghi | OK | bước owner (`:72`) đứng trước backup + upload; ảnh mount `:ro` từ checkout; `content-cli.ts:154` cần `--confirm-prod` |
| Ảnh smoke có dọn? | Không dọn — xem F4 (MINOR) | asset `og-default.png` ghi vĩnh viễn vào DB + volume; parity không bị ảnh hưởng (`compareRecords` chỉ so collection seed, `parity-check.ts:29`) |

## (3) Image `content-tools` / service `nta-tools`
- uid 1001 có passwd (`Dockerfile:33`) + compose `user: "1001:1001"` → khớp owner uploads; `os.userInfo()` không ENOENT (Builder đã gặp + sửa).
- Không chứa secret: chỉ `tsconfig.json`, `src`, `tools/db` + node_modules của `deps`. Secret vào qua env lúc `run`.
- Mạng compose: `DATABASE_URL` → `nta-db:5432`, `REVALIDATE_URL=http://nta-web:8080/api/revalidate` (nội bộ, không qua nginx/public). `mem_limit 512m`, `restart: "no"`.

## (4) Runbook cutover vs change doc + điều kiện phase 3
| Điều kiện (`phase-3-spec-validation.md:127-142`) | Trạng thái |
|---|---|
| #1 dây cờ + depends_on, lùi không sửa code | ✅ GitHub Variable + deploy |
| #2 cách chạy import/parity/CLI trên VPS | ✅ (b) target `nta-tools` + workflow |
| #3 quyền ghi upload uid 1001, thư mục tồn tại | ✅ kiểm tự động trước ghi |
| #4 thứ tự backup → migration → user xác nhận → import → parity → bật cờ → revalidate --all → smoke → lùi | ✅ runbook §2 bước 1–9 đúng thứ tự; kiểm migration bằng count (chưa kiểm `\d content_versions` cột `sort_order` — count=2 đã đủ suy ra 0001 apply) |
| #5 smoke bắt buộc | ⚠ thiếu 2 mục — F1, F2 |
| Kế hoạch lùi + hệ quả mất sửa DB | ✅ §4 nêu rõ, DB giữ nguyên |
| Khung giờ backup 19:50–20:30 UTC | ✅ §0 |
| Backup hằng ngày + restore thử | ✅ §2 bước 10 (thiếu nhắc `migrate-on-restore.sh` — F5) |
| Acceptance change doc (`:42-47`) | #1 y hệt: parity + smoke sitemap; #2 sửa DB → web đổi: **chỉ có bằng chứng local** (F1); #3 migration: kiểm count; #4 backup + khôi phục: bước 10; #5 lịch sử/rollback: chưa có bước prod (F1) |

Bằng chứng parity local (task file `:37-47`) hợp lý: cùng 1 build standalone, 2 server chỉ khác biến runtime (đúng cách prod đổi cờ); 79 URL, status + Location + DOM ngoài script trùng byte, JSON-LD 52 trang deep-equal; khác chỉ ở RSC flight (thứ tự key jsonb) — đã giải thích. Prerender-manifest chứng minh cờ thuần runtime. Screenshot 375 bị cắt đã được ghi là hạn chế, bù bằng DOM trùng byte.

## Findings
**CRITICAL:** không có.
**MAJOR:** không có.

**[MINOR] F1 — Smoke "sửa 1 bản ghi → revalidate → web đổi → rollback" không làm được trên prod** — `docs/runbook/cutover-content-db.md:44-46`.
Sau import mọi bản ghi ở v1, `db:cli` không có lệnh sửa → acceptance #2/#5 của change doc chỉ có bằng chứng local. Runbook đã nói thẳng, nhưng spec-validator ghi là "smoke bắt buộc".
Đề xuất: trước B9, hoặc (a) user chấp nhận rõ bằng chứng local + dời e2e prod sang CR-030 (ghi vào task/decisions), hoặc (b) thêm 1 lệnh ops ghi nhỏ có version (vd tạo + xoá mềm 1 post smoke như MINOR-3 local) có confirm + backup. Không chặn push phần A.

**[MINOR] F2 — Thiếu smoke "DB dừng ngắn → trang đã cache vẫn 200"** (điều kiện #5 `phase-3-spec-validation.md:142`) — `docs/runbook/cutover-content-db.md:40-47`.
Đề xuất: thêm mục (khung giờ thấp điểm, `docker stop nta-db` ≤ 30 s rồi `start`, curl 3 URL đã warm), hoặc ghi rõ user bỏ qua vì rủi ro prod.

**[MINOR] F3 — Concurrency chung group: run đang CHỜ bị huỷ khi có run mới xếp hàng** — `.github/workflows/content-ops.yml:30-32`.
GitHub chỉ giữ 1 run pending mỗi group: bấm content-ops khi deploy đang chạy + đã có deploy khác chờ → deploy chờ bị cancel (commit đó không lên tới lần push sau), và ngược lại.
Đề xuất: thêm 1 dòng runbook §0 "chỉ bấm Content ops khi không có Deploy đang chạy/chờ; thấy run Cancelled → Run workflow lại".

**[MINOR] F4 — upload-smoke để lại asset vĩnh viễn trong DB prod + volume** — `content-ops.yml:109-119`, runbook §2 bước 5/8.
Vô hại (dùng lại `og-default.png`, lần sau `reused`), nhưng nên ghi vào runbook là cố ý, không dọn (để bot/người vận hành không ngạc nhiên khi thấy asset "Ảnh kiểm tra upload").

**[MINOR] F5 — Lệch nhỏ runbook ↔ task file** — `tasks/feature-content-database/phase-4-task-01.md:57-58,66` vs `docs/runbook/cutover-content-db.md:29-30,38`.
Task ghi B1 parity → B2 backup; runbook ghi 1 backup → 2 parity (cả 2 đều an toàn vì parity chỉ đọc). B10 task có `migrate-on-restore.sh`, runbook bước 10 không. Đề xuất: đồng bộ theo runbook + thêm `migrate-on-restore.sh` vào bước 10 (residual phase 2).

**[MINOR] F6 — content-ops chạy được từ mọi ref** — `.github/workflows/content-ops.yml:15-16,47-49`.
`workflow_dispatch` cho chọn branch → build `nta-tools` từ code chưa review với secret prod. Người có quyền dispatch cũng push được main nên rủi ro thấp; `deploy.yml` có cùng đặc điểm (có sẵn, ngoài scope).
Đề xuất: `if: github.ref == 'refs/heads/main'` ở job `ops`.

**[MINOR] F7 — Health check deploy không kiểm nguồn nội dung** — `.github/workflows/deploy.yml:73-84`.
`/api/health` không đọc nội dung → bật `db` lỗi vẫn báo xanh (comment `:40` tự nêu). Runbook bù bằng bước 7–9 (revalidate + smoke). Đề xuất (tuỳ chọn): khi `CONTENT_SOURCE=db`, curl thêm `/` và `/en` phải 200.

## Residual risk
- R1: Reviewer không chạy được docker (build image web với context mới, `compose config`, `--target content-tools`) — dựa evidence Builder + phân tích import (`tools/db` không phụ thuộc thư mục `tools/` khác). Lần push đầu sẽ là phép thử thật của image web; lỗi build → deploy dừng ở "Build image", web cũ giữ nguyên (sau migrate — migration không đổi nên vô hại).
- R2: `content-ops.yml` chưa chạy thật trên runner (Builder đã ghi) — lần đầu nên là `parity` (chỉ đọc).
- R3: Backup ops dùng chung vòng giữ 14 bản `pre-migrate-*` với deploy (Builder đã ghi) — cutover tạo ~4 bản, còn dư.
- R4: Cùng compose project giữa 2 workflow dựa vào runner dùng chung workspace của repo (mặc định self-hosted) — đổi runner/thư mục làm việc sẽ khiến `run` không thấy mạng `nta-db`; bước `nta-db phải healthy` không phát hiện được trường hợp này (chỉ inspect theo container_name), lỗi sẽ lộ ở bước tools (fail rõ, không ghi sai).

## Verdict
✅ **PASS** (phần A) — 0 CRITICAL, 0 MAJOR, 7 MINOR. An toàn để commit + push (prod vẫn `file`). F1/F2 phải được xử lý hoặc user chấp nhận rõ **trước B9 / trước khi đánh dấu acceptance CR-031**; F3, F5 nên sửa runbook trước khi user bắt đầu B1.
