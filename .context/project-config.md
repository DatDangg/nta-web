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
target_branch: main            # ✅ chốt 08/10/2026 — staging-direct trên main; có remote sẽ chốt lại (/brainstorm git)
forbidden_branch: main         # ✅ chốt 08/10/2026 — cấm push (chưa có remote); muốn push main → /brainstorm git đổi trước
branch_pattern: "main"         # default staging-direct
auto_push_after_pass: false    # ✅ chốt 08/10/2026 — chỉ commit local, push khi user yêu cầu rõ

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
test_command: null             # v1 chưa có test framework — sẽ chốt lại khi thêm test (/brainstorm <nhóm>)
install_command: npm install
lint_command: npm run lint     # generic alias (không split web/api)
typecheck_command: npm run typecheck
build_command: npm run build
migration_command: null        # only used when db_tool != none and migration_required: true

# ── Database ──
db_tool: none                  # none | prisma | drizzle | other ✅ chốt 08/10/2026
migration_required: false      # v1 website content-driven, không cần DB
staging_db: null               # db_tool: none → không áp dụng
prod_db: null                  # db_tool: none → không áp dụng; nếu thêm DB → phải khác staging_db
destructive_migration_policy: HIGH_RISK_MIGRATION

# ── Deploy / CI-CD (từ brainstorm; secret nằm ở .env.local) ──
deploy_platform: other         # ✅ thực tế = gcp-cloud-run (asia-southeast1, scale-to-zero) — menu brainstorm chưa có option
ci_cd: github-actions          # ✅ chốt 08/10/2026

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
  test: null                    # = test_command (v1 chưa có test framework)
  build: npm run build          # = build_command
  migration: null               # = migration_command (db_tool: none)
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
  required: [CONTACT_FORM_TARGET]  # ⚠️ OQ#4 chưa chốt hình thức forward — tên env var giữ sẵn; giá trị → .env.local khi chốt
```
