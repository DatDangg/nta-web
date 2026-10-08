# Review — feature/nta-website · layer-3-task-03 · round 1

Agent: reviewer

> Task: `tasks/nta-website/layer-3-task-03.md` — CTAForm compact + tích hợp 7 solution detail (Screens 4 & 6).
> HARD carry-forward: 2 detail page **thay** `CTABanner` → `CTAForm`; kiểm diff scope chặt (sửa file Layer 2).

## Review level

**NORMAL**

### Reason

- Scope: 1 component client mới (`CTAForm`) + refactor 1 shared hook (`useContactForm`) + 2 detail route × 2 locale
  + i18n. `db_tool: none`, `test_command: null`; không auth/RBAC/tenant/schema/migration/payment/cron/webhook.
- Contract tiêu thụ là `POST /api/contact` (task-01) — đã review; payload compact khớp **chính xác**
  `src/lib/api/contact-schema.ts` (xem AC#2) → **không lệch contract**.
- **Không escalate STRICT**: diff scope kiểm bằng đối chiếu line-reference với Layer-2 review (r2) —
  chỉ đổi đúng 2 dòng (import + CTA zone) trên mỗi page detail; **không thấy regression layout/content**.
- Lý do **không** FAST: `useContactForm` là **shared hook** (ContactForm full task-02 + CTAForm) → chạm
  shared service dùng 2 client → cần kiểm regression (đúng tinh thần NORMAL, chưa tới ngưỡng STRICT vì
  không có risk đỏ auth/schema/tenant/API-contract drift).

## Blast radius

- Routes: `/solutions/{enterprise,ai}/[slug]` — 7 slug (crm, hrm, lms, dentgo, boxai, flycam, custom-ai) × 2 locale = 14 SSG detail.
- Components: `src/components/contact/CTAForm.tsx` (mới, client); tái dùng `ui/Button`, `ui/Input`, `ui/Textarea`.
- Shared hook: `src/lib/contact/useContactForm.ts` — **dùng bởi cả** `ContactForm` (task-02, full) và `CTAForm` (compact).
- i18n: `src/i18n/messages/{vi,en}.json` block `contact.*`.
- API tiêu thụ: `POST /api/contact` (task-01) — không sửa API.
- Các trang còn dùng `CTABanner` (home, blog, about, products, solutions overview, case-studies) — **không đụng**.

## Verify commands + result

Configured (`.context/project-config.md`): `npm run lint` · `npm run typecheck` · `npm run build`;
`test_command: null` → test skip.

| Command | Result |
|---|---|
| `npm run lint` | ⛔ **Blocked** — shell tool permission denied (`permission.rejected: shell`). Không retry (Tool Loop Guard). |
| `npm run typecheck` | ⛔ **Blocked** — shell denied. Verify tĩnh. |
| `npm run build` | ⛔ **Blocked** — shell denied. Không xác nhận runtime SSG 7 slug × 2 locale / prerender-manifest. |
| `git diff` (scope check) | ⛔ **Blocked** — shell denied. Thay bằng đối chiếu line-reference với Layer-2 review. |
| `test` | **skip, test_command: null** (v1 chưa có test framework — per config). |

Verify tĩnh đã thực hiện (thay thế):

- **HARD carry-forward (item 1):** `grep CTABanner` trong `src/` → **0 match** ở `solutions/enterprise/[slug]/page.tsx`
  và `solutions/ai/[slug]/page.tsx`. Cả 2 file import `CTAForm` (`enterprise:8`, `ai:7`) và render **đúng 1 lần**
  (`enterprise:69`, `ai:54`). Không còn `CTABanner`, không có 2 CTA cùng intent (RelatedSolutions/CaseStudyLink
  là link/block, không phải form CTA). → **1 CTA zone/slug** ✔
- **Compact fields (item 2):** `CTAForm.tsx:10` `FIELDS = ['name','email','message']` (KHÔNG `phone`);
  honeypot render ở `:52`; submit qua hook → `POST /api/contact` (`useContactForm.ts:70-74`).
  Payload thực tế = `{name,email,phone:'',message,honeypot}` — server schema `contact-schema.ts:35-41` bỏ qua
  `phone` rỗng, `:45-47` chấp nhận honeypot `''` → **không 400 do thiếu phone**. ✔
- **States:** Submitting (`:53` disabled + spinner), Success (`:32-38` role=status), 400 (`useContactForm.ts:85-97`),
  429 (`:80-84`), 5xx (`:98-99`) — đều set `status` + `summary`. ✔
- **Hook không regress ContactForm full (item 3):** `ContactForm.tsx:14` gọi `useContactForm({...})` **không truyền
  `fields`** → default `['name','email','phone','message']` (`useContactForm.ts:28`); `validate` vẫn kiểm `phone`
  khi `fields.includes('phone')` (`:23`). Phone input giữ ở `ContactForm.tsx:46`. ✔
- **Fix MINOR task-02 (item 4):** xem Findings — #2 FIXED, #5 FIXED, **#4 CHƯA fix đầy đủ**.
- **Diff scope (item 5):** đối chiếu Layer-2 review:
  - enterprise `[slug]`: Layer-2 r2 tham chiếu `:52-54` (related filter), `:59` (grid), `:60` (`xl:max-w-[720px]`),
    `:65` (`lg:py-12`), `:69` (CTA). File hiện tại khớp **từng dòng**; chỉ `:8` (import) và `:69` (CTA) đổi.
  - ai `[slug]`: Layer-2 r2 tham chiếu `:11,15-17` (static params), `:47` (`<div>` wrapper), `:48` (`xl:max-w-[720px]`).
    File hiện tại khớp; chỉ `:7` (import) và `:54` (CTA) đổi.
  → **Không thấy đổi layout/content/meta khác** (line-number preservation = bằng chứng mạnh vì import/CTA thay
    cùng số dòng). ✔ (xem Residual: chưa chạy được `git diff` thật.)
- **i18n (item 6):** mọi copy CTAForm lấy từ `contact.*`; các key dùng (`errors.*`, `rateLimit`, `sendError`,
  `summary`, `successTitle`, `success`, `sendAnother`, `labels.name/email/message`, `helpers.name/email/message`,
  `submit`, `submitting`, `consultationTitle`) **đều tồn tại ở cả `vi.json:155-162` và `en.json:155-162`**. Heading
  `consultationTitle` = "Nhận tư vấn" / "Get a consultation" — khớp design `design-spec.md:249`. ✔
- **SSG (item 7):** `generateStaticParams` 2 page không đổi (`enterprise:22-24`, `ai:15-17`); page là server
  component, `CTAForm` client được import hợp lệ. Static TS review: không thấy break type/import. **Chưa chạy build
  → chưa xác nhận prerender-manifest runtime** (xem Residual).

**Residual risk (bắt buộc primary/builder xác nhận trước close-out):** `npm run lint` / `npm run typecheck` /
`npm run build` chưa chạy được (shell denied) — cần xác nhận PASS và **prerender-manifest đủ 7 slug × 2 locale**;
`git diff` thật chưa chạy được (scope kiểm bằng line-reference).

## Responsive Checklist Gate

Diff đụng UI + project có `ui:` → gate **áp dụng**. Không có browser runtime → kiểm bằng CSS math.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — no horizontal scroll | OK | `CTAForm.tsx:41-42` section `w-full` + inner `mx-auto grid w-full max-w-container gap-8 px-4 sm:px-6 lg:px-8`; base 1 cột, không fixed px. |
| Layout — mobile-first (`min-width`) | OK | Chỉ dùng `md:`/`xl:` (Tailwind mobile-first), base = stack. |
| Layout — grid auto-fit/minmax | OK (ghi chú) | `md:grid-cols-2` là cột cố định **có chủ đích** (heading | form theo design compact); base vẫn 1 cột, không tràn. |
| Typography — rem/clamp | OK | `text-h2`/`text-text-*` token (rem/clamp); không px font trong diff. |
| Typography — heading fluid | OK | `text-h2` dùng `clamp()` (tokens). |
| Media — ảnh max-width/aspect | N/A | CTAForm không thêm ảnh/video. |
| Touch — target ≥44px | OK | Tái dùng `Button` `min-h-11` (44px), `Input` `min-h-11`, `Textarea` `min-h-32` (shared, task-02 đã PASS). |
| Touch — nav hamburger | N/A | Không đụng nav. |
| Touch — table scroll/card | N/A | Không có table. |
| Viewport — không `100vh` đơn thuần | OK | Diff không dùng `100vh`/`vh`. |
| Viewport — `prefers-reduced-motion` | OK | Rule global `globals.css` (Layer 1) giảm animation; spinner `animate-spin` bị vô hiệu hoá. |
| Viewport — không che lỗi bằng `overflow:hidden` | OK | Không dùng `overflow-hidden` trong diff. |

→ **Responsive gate: PASS** (không có mục FAIL).

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop` (`aislop scan --changes --json`) | **skip/Blocked** — shell permission denied, không chạy được; không retry. | — |
| `anti-slop` (`npx oxlint`) | **skip, oxlint not configured** — theo evidence các round trước (Layer 2/3) repo không có `.oxlintrc*`/`oxlint.config.*`; round này shell denied nên không tự re-glob. | — |
| `open-code-review` (`ocr`) | **skip/Blocked** — không chạy được shell; không chặn PASS. | — |
| AI-readable-codebase | **OK** | `CTAForm.tsx` 57 dòng, `useContactForm.ts` 114 dòng (<300); hàm ≤50 dòng (`submit` ~40, `validate` 9); tên self-descriptive; indirection ≤2; không comment WHAT; magic number validate là bound nghiệp vụ. <3 AI-chaos indicator. |
| ai-friendly-web | **N/A** | Layer-3 UI build, không phải task deploy; `robots.txt`/`sitemap.xml`/`llms.txt` là artifact Phase 6 DevOps. |
| blitzstrike pentest | **N/A** | NORMAL; không có môi trường pentest; diff không mở attack surface mới (chỉ tiêu thụ API đã review). |

## Findings

Không có CRITICAL/MAJOR. Không phát hiện vấn đề security (không input mới ra ngoài schema đã review; không auth/SQL/secrets).

### [MINOR] #4 task-02 CHƯA fix đầy đủ — vẫn bỏ message từ server + bỏ lỗi ngoài field subset

- **File:** `src/lib/contact/useContactForm.ts:85-97`
- **Evidence:** Nhánh 400 vẫn gán `fieldErrors[field] = messages[field]` (message **local**) thay vì message server
  trả về (`API_SPEC.md` / `route.ts:62` trả `errors:{email:"Email không hợp lệ"}`). Vòng lặp chỉ duyệt `fields`
  (compact = name/email/message) → `errors.form` (`route.ts:55`) và `errors.honeypot` bị bỏ, chỉ còn summary generic.
- **Impact:** Không vỡ contract (shape đúng, 400 state hoạt động, field errors hiển thị). Chỉ mất ngữ cảnh lỗi cụ
  thể từ server. Builder journal (`builder-nta-website-layer-3-task-03.md:34`) claim "#4 server error message" —
  **claim này không khớp code**. Non-blocking.
- **Fix đề xuất:** ưu tiên `typeof apiErrors[field] === 'string' ? apiErrors[field] : messages[field]`; nếu có
  `errors.form` → hiển thị thêm (hoặc map vào summary).

### [MINOR] `ctaForm.*` namespace không được tạo (lệch file list task)

- **File:** `src/i18n/messages/{vi,en}.json`
- **Evidence:** Task `Files to Create/Modify` ghi `ctaForm.*`, nhưng implementation tái dùng `contact.consultationTitle`
  (`CTAForm.tsx:43`); `grep ctaForm` → 0 match. `consultationTitle` đã tồn tại ở cả 2 locale.
- **Impact:** Không phải defect chức năng — dùng lại copy canonical đúng tinh thần task (`Description` §3: "không lặp
  label/copy ngoài canonical"). Chỉ là lệch tên namespace so với danh sách file. Non-blocking.
- **Fix đề xuất:** chấp nhận & ghi quyết định (reuse `contact.*`), hoặc ghi rõ trong task là dùng canonical thay vì
  tạo namespace mới.

### [OBS] Thứ tự base Screen 4 — "sidebar xuống dưới CTAForm"

- **File:** `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:59-69`
- **Evidence:** `design-spec.md:236` ghi base: "sidebar xuống dưới CTAForm"; implementation đặt CTAForm **sau** grid
  (sidebar RelatedSolutions **trên** CTAForm ở base).
- **Impact:** Lệch design ở mốc base nếu hiểu literal. **Không phải regression của task-03**: vị trí CTA ở cuối grid
  đã có từ Layer-2 (CTABanner cùng chỗ, Layer-2 r2 PASS `[slug]:69`). → **ngoài scope**, đề xuất task riêng nếu muốn
  bám design literal.

### [OBS] `updateField` dùng `values` closure (stale) khi validate

- **File:** `src/lib/contact/useContactForm.ts:37`
- **Evidence:** `validate({ ...values, [field]: value }, ...)` dùng snapshot `values` của render hiện tại (pre-existing
  từ task-02); `setValues` thì functional. Không gây lỗi quan sát được ở luồng chuẩn. Non-blocking, carried.

### [OBS] ContactForm MINOR #1 (429 không focus) vẫn còn ở ContactForm

- **File:** `src/components/contact/ContactForm.tsx:19-22,43`
- **Evidence:** `summaryRef` chỉ gắn vào error-summary div (`:39`, render khi `status==='error'`), `<p role="alert">`
  429 (`:43`) không có ref → focus 429 no-op. **CTAForm đã xử lý đúng** (ref dùng chung cho cả error + rate-limit,
  `CTAForm.tsx:45`). Đây là MINOR của task-02, **ngoài scope task-03**; `role="alert"` vẫn auto-announce.

## Verdict

✅ **PASS** (NORMAL)

- **Item 1 (HARD carry-forward):** PASS — 2 detail page đã thay `CTABanner` → `CTAForm`, đúng 1 CTA zone/slug, không
  còn `CTABanner` trong 2 file (grep 0 match).
- **Item 2 (compact fields):** PASS — name/email/message/honeypot, không SĐT; cùng `/api/contact`; states đủ.
- **Item 3 (hook không regress full form):** PASS — default fields giữ phone; ContactForm không đổi hành vi.
- **Item 4 (fix MINOR task-02):** #2 FIXED (`delete next[field]`, `useContactForm.ts:38-43`), #5 FIXED (param
  `fields`, `:28`); **#4 CHƯA fix đầy đủ** → ghi [MINOR] (non-blocking).
- **Item 5 (diff scope chặt):** PASS (static, line-reference khớp Layer-2) — chỉ đổi import + CTA zone.
- **Item 6 (a11y + responsive + i18n):** PASS — label/aria-invalid/error-summary focus; stack mobile → inline desktop;
  copy đủ 2 locale.
- **Item 7 (lint/typecheck/build + SSG):** ⛔ Blocked (shell denied) — chưa xác nhận độc lập; rely builder evidence
  (`builder-nta-website-layer-3-task-03.md:20`: lint/typecheck/build PASS; primary verify 14/14 HTML 1 CTA + 7 slug ×
  2 locale trong prerender-manifest).
- Không CRITICAL/MAJOR; responsive gate PASS; không phải bug task → không cần repro PASS.
- **Residual risk:** (a) verify commands + `git diff` + prerender-manifest chưa chạy được độc lập (shell denied) —
  primary phải xác nhận trước close-out; (b) responsive/SSG kiểm bằng CSS math + source, chưa render live;
  (c) reviewer vượt cap read-tool NORMAL (đối chiếu design-spec/Layer-2 reviews/i18n/schema) — không có probe lặp.
