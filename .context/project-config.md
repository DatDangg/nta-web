# project-config.md — Cấu hình dự án (canonical)

> **File này do brainstorm quản lý** (`.agent/brainstorm.md` / lệnh `/brainstorm`) — không điền tay,
> không có lệnh setup riêng. Mọi workflow/subagent **đọc giá trị ở đây**, KHÔNG hardcode trong generic docs.
> Nếu field còn placeholder (`<...>`) hoặc `null` → coi như chưa cấu hình, phải **hỏi user**, không bịa.
>
> 💡 Chạy `/brainstorm` để điền/cập nhật. `/brainstorm <nhóm>` chỉ sửa 1 nhóm (vd `git`, `models`).
>
> ✅ Chốt lần đầu 2026-10-08 (brainstorm trong `/start`) — xem `.context/brainstorm-log.md`.

## Config

```yaml
project: NTA Website
output_language: vi            # vi | en — ngôn ngữ cho docs/summary

# ── Git ──
target_branch: main            # ✅ cập nhật 09/10/2026 — staging-direct trên main; remote: git@github.com:DatDangg/nta-web.git
forbidden_branch: none         # ✅ cập nhật 09/10/2026 — remote đã có, user duyệt push main (trước cấm khi chưa có remote)
branch_pattern: "main"         # default staging-direct
auto_push_after_pass: true     # ✅ cập nhật 13/10/2026 — user bật auto push: push origin main sau khi review + build/typecheck/lint PASS

# ── Package / source ──
package_manager: npm           # ✅ chốt 08/10/2026
source_roots: [src]            # ✅ scaffold layer 0 (Next.js App Router) tạo src/
# ── Stack đã chốt ──
# Next.js (App Router) + TypeScript + Tailwind CSS — UI library: Tailwind only (không shadcn)

# ── Verify commands (null/placeholder = skip, no app configured) ──
# ⚠️ Các script dưới PHẢI được tạo trong package.json ở bước scaffold (layer 0):
#    install/lint/typecheck/build — builder scaffold chịu trách nhiệm tạo đúng script này.
web_typecheck_command: npm run typecheck
web_lint_command: npm run lint
api_typecheck_command: null    # không tách api — website Next.js đơn
api_lint_command: null
test_command: npm test          # ✅ CR-031 P1-T01 — `node --import tsx --test "src/**/*.test.ts"` (node:test built-in + tsx chạy TS/import không đuôi; không thêm framework nặng)
install_command: npm install
lint_command: npm run lint     # generic alias (không split web/api)
typecheck_command: npm run typecheck
build_command: npm run build
migration_command: npm run db:migrate   # ✅ 14/10/2026 CR-031 — drizzle-kit migrate (SQL versioned trong drizzle/); prod chạy qua deploy (backup pg_dump → migrate → app). CẤM drizzle-kit push
migration_generate_command: npm run db:generate   # ✅ CR-031 — drizzle-kit generate từ src/db/schema.ts → drizzle/NNNN_*.sql (commit kèm task)

# ── Chạy verify khi agent làm qua Cowork (repo trên Windows, lệnh chạy trong VM Linux) ── ✅ 13/10/2026
# node_modules của repo là bản Windows → `npm run build` KHÔNG chạy được trong VM (thiếu @next/swc Linux).
# Dùng wrapper — bản sao ở $HOME/nta-build, node_modules Linux riêng, KHÔNG đụng file/node_modules của user:
#   bash tools/linux-build.sh verify   # typecheck + lint + build, ~40s (lần đầu mỗi phiên +~25s npm ci)
#   bash tools/linux-build.sh serve 3100 <lệnh>   # smoke test trên bản build (server sống trong cùng 1 lệnh)
# - Font Inter: Google Fonts bị egress chặn → wrapper mock bằng file Inter thật từ npm (@fontsource-variable/inter).
#   KHÔNG stub next/font trong src, KHÔNG chép code lên cloud để build nữa.
# - Playwright/screenshot: VM không có Chromium → vẫn chạy ở cloud container (chỉ bước này).
# - Chạy lệnh trên Windows (opencode / terminal của user) thì vẫn dùng các lệnh npm ở trên như cũ.
cowork_verify_command: bash tools/linux-build.sh verify

# ── Bằng chứng build trong Docker ── ✅ 15/10/2026 (bug-build-site-url-empty)
# Khi cần chứng minh "build Docker PASS" (chạy được cả PowerShell lẫn bash, không cần env):
#   docker build --target builder -t nta-web-buildcheck:tmp .            # thêm --no-cache khi cần bằng chứng next build mới (không dùng cache)
#   docker rmi nta-web-buildcheck:tmp                                    # xoá image tạm sau khi verify
# Sau fix, build không truyền arg vẫn khớp CI (ARG mặc định = https://ntavietnam.tech = giá trị compose truyền).
# Phương án phụ: docker compose build nta-web (cần env giả POSTGRES_PASSWORD/REVALIDATE_SECRET) — ⚠️ compose cố định
# image nta-web:latest nên GHI ĐÈ tag local đó (-p không đổi tag) và có thể chỉ dùng cache; KHÔNG chạy trên VPS
# (lần docker compose up kế tiếp sẽ dùng image vừa build).
# Lý do: trước fix, `docker build` không truyền arg → NEXT_PUBLIC_SITE_URL="" → `new URL("")` ở metadataBase → prerender FAIL
# (bị tưởng là "flaky"). Đã thêm fallback (src/lib/seo.ts) + ARG mặc định (Dockerfile).
# Chi tiết: tasks/feature-content-database/investigate-flaky-build.md · tasks/bug-build-site-url-empty/phase-1-task-01.md
docker_build_evidence_command: docker build --target builder -t nta-web-buildcheck:tmp .

# ── Database ──
db_tool: drizzle               # ✅ cập nhật 14/10/2026 (CR-031) — PostgreSQL + drizzle-orm/drizzle-kit (trước: none)
migration_required: true       # ✅ CR-031 — migration gate BẬT
staging_db: none               # ✅ CR-031 — user quyết định 14/10/2026: KHÔNG có DB staging, bỏ yêu cầu staging_db ≠ prod_db (xem "Ngoại lệ" dưới)
prod_db: nta-db                # ✅ CR-031 — container PostgreSQL riêng `nta-db` (compose) trên VPS 187.52.119.50, database `nta_web`, volume riêng, KHÔNG publish port; kết nối qua DATABASE_URL (secret)
db_backup: pg_dump hằng ngày (giữ ≥14 bản) + bắt buộc trước mỗi migration — runbook docs/runbook/db.md (tạo ở CR-031)
destructive_migration_policy: HIGH_RISK_MIGRATION

# ── Deploy / CI-CD (từ brainstorm; secret nằm ở .env.local) ──
deploy_platform: docker-vps    # ✅ cập nhật 09/10/2026 — VPS riêng 187.52.119.50 (shared server) + Docker + nginx + certbot (thay gcp-cloud-run)
ci_cd: github-actions          # ✅ chốt 08/10/2026 — dùng self-hosted runner gắn repo DatDangg/nta-web (label nta-web)
# ── VPS (khi deploy_platform: docker-vps) ──
vps_host: 187.52.119.50        # ✅ VPS Ubuntu 24.04; shared: ismartschool/crm-dhp/tmfoods — CHỈ thêm container mới
vps_user: root
vps_port: 22                   # SSH key auth (key hiện tại trên máy dev)
vps_deploy_dir: /opt/actions-runner-nta-web/_work/nta-web/nta-web   # workspace self-hosted runner (CI deploy); manual fallback: clone bất kỳ
domain: ntavietnam.tech  # ✅ live 09/10/2026 — DNS A → 187.52.119.50, HTTPS Let's Encrypt (cert hạn 07/01/2027), http→https 301; CANONICAL (NEXT_PUBLIC_SITE_URL / seo.ts / sitemap / robots / llms.txt / deploy.yml KHÔNG đổi)
domain_secondary: ntasolution.vn  # ✅ 13/10/2026 — domain PHỤ (+ www) cùng nội dung, cùng app 127.0.0.1:3005; KHÔNG redirect giữa 2 domain; www → 301 apex (chỉ của chính nó); HTTPS Let's Encrypt apex+www; vhost deploy/nginx/ntasolution.vn.conf (xem docs/runbook/deploy-vps.md §3b)
internal_port: 3005            # host 127.0.0.1:3005 → container 8080; nginx proxy

# ── Monitoring ──
monitor_enabled: false         # true | false
otel_service_name: nta-web
otel_env: production
```

### DB / migration

- **`db_tool: none`** → project không dùng DB/ORM: **bỏ qua toàn bộ migration safety rules**.
- `db_tool != none` **và** `migration_required: true` → áp dụng migration gate:
  migration phải versioned + committed, không sửa migration đã apply.
- Không hardcode Prisma/Drizzle: dùng đúng `db_tool` đã khai.
- Trước commit phải inspect migration artifact theo `db_tool`/`migration_command`. Nếu có `DROP TABLE/COLUMN`,
  đổi type, `SET NOT NULL`, `UNIQUE/FK` trên data cũ, enum phá hoại, bulk transform/backfill
  → gắn `HIGH_RISK_MIGRATION`, không promote production, báo destructive op/table/column ảnh hưởng,
  tương thích data, backfill, rollback, kết quả verify staging.
- Cấm `db push`, `migrate reset`, seed/reset, clone data giữa staging/prod.
- `staging_db` phải khác `prod_db`; data độc lập; không sync data staging→prod.
- **Ngoại lệ do user quyết định (14/10/2026, CR-031):** project **chỉ có DB prod** (`staging_db: none`) — migration chạy
  thẳng lên prod. Bù rủi ro BẮT BUỘC: (1) `pg_dump` ngay trước mỗi lần migrate (deploy fail nếu backup fail);
  (2) giai đoạn đầu chỉ migration **additive**; (3) op destructive vẫn gắn `HIGH_RISK_MIGRATION` và **chỉ chạy khi user duyệt rõ**
  (CI chặn nếu thiếu marker duyệt trong file SQL); (4) import seed `src/content` chỉ 1 lần, chỉ chèn, sau backup + user xác nhận.
  Mục "verify staging" trong báo cáo HIGH_RISK thay bằng: restore bản backup vào DB tạm + chạy migration thử ở đó.

## Check commands (chạy trước khi báo xong)

> Mọi người (builder/reviewer) PHẢI dùng đúng lệnh đã cấu hình ở đây, filter theo package bị đụng nếu monorepo.
> Nếu command là `null`/placeholder hoặc repo chưa có app code (`source_roots: []`) → ghi `skip, no app configured`.
> KHÔNG tự suy ra `npm test`, `pnpm lint`, Prisma, package name, hay path `apps/` khi chưa cấu hình.

```yaml
check_commands:
  install: npm install          # alias of install_command
  web_typecheck: npm run typecheck   # = web_typecheck_command
  web_lint: npm run lint        # = web_lint_command
  api_typecheck: null           # không tách api
  api_lint: null
  test: npm test                # = test_command (✅ CR-031 P1-T01, node --test + tsx)
  build: npm run build          # = build_command
  migration: npm run db:migrate # = migration_command (CR-031, drizzle)
  docs_inventory: node scripts/generate-inventory.mjs
```

## Models per role

> Model KHÔNG đọc từ `.env.local`. Khai ở đây rồi **bỏ comment + copy sang frontmatter** của từng file
> `.opencode/agent/*.md`, rồi **restart opencode** (config không hot-reload).
> Quy tắc: **builder ≠ reviewer** (khác họ provider) để lộ blind spot khác nhau.
> ✅ Chốt 08/10/2026 (user tự nhập): builder = openai · reviewer/spec_validator/change_request = opencode-go.

```yaml
models:
  builder:        openai/gpt-6-luna
  builder_strong: openai/gpt-6-luna        # chỉ dùng khi user yêu cầu rõ (§7 gate) — tạm trùng builder
  reviewer:       opencode-go/deepseek-v4.1-flash   # KHÁC họ builder ✅ (soft-rule spec_validator = họ thứ 3: user override chọn cùng họ reviewer)
  spec_validator: opencode-go/deepseek-v4.1-flash
  change_request: opencode-go/deepseek-v4.1-flash
```

## UI rules (nếu project có UI)

```yaml
ui:
  responsive_breakpoints: [640, 768, 1024, 1280, 1536]  # ✅ C1 chốt 08/10/2026 — thang Tailwind DESIGN (base<640 là mobile mặc định)
  max_file_lines: 300
  max_function_lines: 50
```

## Secrets

```yaml
secrets:
  source: env                    # chỉ đọc từ env; KHÔNG hardcode/commit
  required: [CONTACT_FORM_TARGET, POSTGRES_PASSWORD, DATABASE_URL, REVALIDATE_SECRET]  # ✅ 3 secret DB/revalidate thêm ở CR-031 — giá trị đặt trên VPS/runner (user), KHÔNG commit  # ⚠️ OQ#4 chưa chốt hình thức forward — tên env var giữ sẵn; giá trị → .env.local khi chốt
```
