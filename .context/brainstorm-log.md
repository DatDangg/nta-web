# brainstorm-log.md — Q&A log (brainstorm trong /start)

> Ghi mỗi Q&A ngay khi nhận answer. Session: `/start` 2026-10-08.

## Phase 0 — Scan

- `node scripts/detect-profile.mjs`: `has_app: false`, `package_manager: null`, `source_roots: []`, `db_tool: none`, `migration_required: false`, warnings: chưa có package.json/lockfile/scripts.
- Docs classify: **user xác nhận đúng `docs/INDEX.md`** → ghi `.context/doc-index.json`.
- Docs đã có: BRIEF, BRD, DESIGN, API_SPEC, ERD, PERMISSION, project-config → các Phase 1 câu hỏi chuẩn (stack/db/auth/realtime/payment/scalability) **không hỏi lại**.

## Phase 0.5 — Config (một vòng 7 nhóm)

| Q | A |
|---|---|
| Docs classification? | ✅ Đúng theo docs/INDEX.md |
| 7 nhóm config? | **Chọn nhóm cần chỉnh** → chỉnh nhóm **1 (Git)** + **5 (Models)**; các nhóm còn lại chốt theo đề xuất |
| Models (vòng 1)? | "Đổi reviewer sang họ khác" → vòng 2: reviewer = `openai/gpt-6-luna` → vòng 3 user tự nhập override toàn bộ (xem dưới) |
| C1 breakpoint? | **Thang Tailwind DESIGN** (base<640/sm640/md768/lg1024/xl1280/2xl1536) → `ui.responsive_breakpoints: [640,768,1024,1280,1536]` |
| C2 + OQ#4 form liên hệ? | **Chưa chốt — để `[cần xác nhận]`** (build form + interface forward, nội dung thật chốt sau; `CONTACT_FORM_TARGET` giữ sẵn trong secrets.required) |
| OQ#1/#2 brand + hotline? | **Chưa có — dùng placeholder** (palette neutral light Apple, hotline/email placeholder dễ thay qua env/content) |
| OQ#3/#5 scope nội dung? | **Đủ 9 trang, content tĩnh** — blog + case study = file MDX (không CMS), ≥2 case study, nội dung mẫu hợp lý |
| UI library? | **Tailwind only** (không shadcn) |

### Nhóm 1 — Git & branch (user chọn chỉnh)

| Field | Giá trị |
|---|---|
| `target_branch` | `main` |
| `forbidden_branch` | ~~`main`~~ → **`none`** (cập nhật 09/10/2026: remote `origin` đã có, user duyệt push main) |
| `auto_push_after_pass` | `false` |

#### Cập nhật 09/10/2026 — `/brainstorm git` (sau initial build)

- Remote thực tế: `git@github.com:DatDangg/nta-web.git` (origin; SSH key hiện tại = tài khoản `DatDangg`), local `main` ahead 45 commit → **đã push 09/10/2026**.
- User chọn **push thẳng `main`** → `forbidden_branch: main → none`; mở allow hẹp `git push origin main` trong `opencode.jsonc` (vẫn chặn force/delete).

### Nhóm 5 — Models per role (user tự nhập — override đề xuất)

| Vai | Model |
|---|---|
| `builder` | `openai/gpt-6-luna` |
| `builder_strong` | `openai/gpt-6-luna` (trùng builder — chỉ dùng khi user yêu cầu rõ) |
| `reviewer` | `opencode-go/deepseek-v4.1-flash` (**khác họ builder** ✅) |
| `spec_validator` | `opencode-go/deepseek-v4.1-flash` (soft-rule "họ thứ 3" → user override cùng họ reviewer) |
| `change_request` | `opencode-go/deepseek-v4.1-flash` |

Đã copy vào frontmatter `.opencode/agent/{builder,builder-strong,reviewer,spec-validator,change-request}.md` → **cần restart opencode**.

### Các nhóm không chỉnh (chốt theo đề xuất)

- **2 Stack:** `npm`, `source_roots: [src]` (scaffold layer 0).
- **3 Verify:** `install: npm install`, `lint: npm run lint`, `typecheck: npm run typecheck`, `test: null`, `build: npm run build`, `docs_inventory: node scripts/generate-inventory.mjs` — ⚠️ scaffold PHẢI tạo đúng scripts trong package.json.
- **4 DB:** `none` / `false` (theo detect + ERD).
- **6 Deploy:** `deploy_platform: other` (= gcp-cloud-run, menu thiếu option) + `ci_cd: github-actions`.
- **7 Monitoring/UI:** `monitor_enabled: false`; `secrets.required: [CONTACT_FORM_TARGET]`.

### Sync verify permissions

- Dry-run: 4 rule auto-allow (`npm run typecheck`, `npm run lint`, `npm install`, `npm run build`), 0 skip → `--write` OK.

## Phase 1 — Clear yêu cầu

Không còn câu nào thiếu: stack (Next.js/TS/Tailwind), DB None, Auth None, realtime/upload/payment None,
timeline = đủ 9 trang v1, scalability off — đều đã có trong BRIEF/BRD/spec.

## Phase 2 — Clarification

Đã resolve: **C1** (breakpoint → Tailwind), **C2** (form → `[cần xác nhận]`, không lưu DB theo ERD),
**C3** (BRIEF:50 stale — ghi nhận, không sửa intent doc ngoài change request).
Còn `[cần xác nhận]` (không chặn build): brand/hotline content, form đích, rate-limit threshold.

## Phase 3 — Design doc

→ `docs/specs/2026-10-08-nta-website-design.md` (chờ user approve — ⏸ checkpoint của /start).
