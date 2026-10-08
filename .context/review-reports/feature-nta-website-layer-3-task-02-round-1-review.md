# Review — feature/nta-website · layer-3-task-02 · round 1

Agent: reviewer

## Review level
**NORMAL**

## Reason
- Scope SINGLE_SURFACE: 1 route (`/[locale]/contact`) + 1 client form + 4 leaf components + shared `Input/Textarea` + 1 hook.
- Đã kiểm contract API `/api/contact` (task-01): payload `{name,email,phone,message,honeypot}` khớp **chính xác** với `src/lib/api/contact-schema.ts` + `docs/API_SPEC.md`; xử lý 200/400/429/5xx đúng shape. **Không lệch contract → không escalate STRICT.**
- Không đụng auth/RBAC/tenant/schema/migration/payment. `Input/Textarea` là shared UI nhưng mới dùng 1 nơi (ContactForm), chưa có client khác phụ thuộc → risk thấp.
- A11y/navigation không có vấn đề nghiêm trọng (label visible, aria-describedby/invalid, error summary focus, success role=status, iframe title+lazy, touch ≥44px đều có).
- Lưu ý: shared `useContactForm` sẽ được task-03 tái dùng → theo dõi ở task-03 (không phải risk đỏ tại đây).

## Blast radius
- Route `/contact` (2 locale: `vi` không prefix + `en`) + metadata canonical/hreflang.
- Component: `src/components/contact/{ContactForm,ContactInfo,OfficeHours,MapEmbed}.tsx`, `src/components/ui/{Input,Textarea}.tsx`.
- Hook: `src/lib/contact/useContactForm.ts` (sẽ dùng lại ở CTAForm task-03).
- i18n: `src/i18n/messages/{vi,en}.json` block `contact.*`.
- API tiêu thụ: `POST /api/contact` (task-01) — không sửa API trong task này.

## Verify commands + result
| Command (từ `.context/project-config.md`) | Result |
|---|---|
| `npm run lint` | **Blocked** — shell permission denied (`permission.rejected: shell`). Không retry theo Tool Loop Guard. Verify tĩnh. |
| `npm run typecheck` | **Blocked** — shell denied. Verify tĩnh (xem bên dưới). |
| `npm run build` | **Blocked** — shell denied. Không xác nhận được SSG `/vi/contact` + `/en/contact` bằng runtime. |

Verify tĩnh đã thực hiện (thay thế):
- `test_command: null` → không có test framework; task ghi manual matrix. Reviewer không chạy app/manual repro.
- Typecheck tĩnh: `useContactForm.ts` narrowing `payload: unknown` → `'errors' in payload` → `payload.errors: unknown` → `typeof ... === 'object'` OK; `page.tsx` `notFound()` (never) narrow `locale` về `'vi'|'en'` trước khi index `metadataByLocale` → không thấy lỗi TS.
- SSG: `page.tsx` là server component async, `generateMetadata` + `setRequestLocale(locale)`; routing `localePrefix: 'as-needed'` → build sinh `/[locale]/contact` cho cả 2 locale. Không có `searchParams`/`window` khi render → không thấy rủi ro vỡ prerender (đối chiếu pattern đã PASS ở task-06/07).
- Metadata: `metadataBase` đã set ở `src/app/[locale]/layout.tsx`; `alternates.canonical` + `languages{vi,en,x-default}` có → OK, nhất quán các page khác.

**Residual risk:** chưa chạy được lint/typecheck/build thật do shell bị deny — cần primary/builder xác nhận lại 3 lệnh trước close-out.

## Responsive Checklist Gate
Diff đụng UI + project có `ui:` → gate **áp dụng**. Test bằng CSS math (không có browser runtime).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — no horizontal scroll | OK | `page.tsx:34` `grid grid-cols-1 gap-12 ... max-w-container px-4 sm:px-6 lg:px-8`; base 1 cột, không fixed px width; input/textarea stretch full cột (grid item). |
| Layout — mobile-first (`min-width`) | OK | Tailwind breakpoints mobile-first (`base → md: → lg:`), khớp `ui.responsive_breakpoints`. |
| Layout — grid auto-fit/minmax | OK (có ghi chú) | `md:grid-cols-2`, `lg:grid-cols-[3fr_2fr]` là cột cố định **có chủ đích** theo design Screen 12 (2 cột md; 60/40 lg); base vẫn 1 cột, không tràn. |
| Typography — rem/clamp | OK | tokens dùng `rem`/`clamp()` (`--text-h3`, `--text-body-lg`…); input `text-base` = 1rem. |
| Typography — heading fluid | OK | `text-h3`/`text-display` dùng `clamp()`. |
| Media — ảnh max-width/aspect | N/A | Diff không thêm ảnh; map là iframe bọc `aspect-video w-full`. |
| Media — iframe aspect-ratio | OK | `MapEmbed.tsx:5-6` wrapper `aspect-video w-full`, iframe `h-full w-full`. |
| Touch — target ≥44px | OK | `Button` `min-h-11 min-w-11` (44px); `Input` `min-h-11`; `Textarea` `min-h-32`. |
| Touch — nav hamburger | N/A | Không đụng nav trong task này. |
| Touch — table scroll/card | N/A | Không có table. |
| Viewport — không `100vh` đơn thuần | OK | Không dùng `100vh` trong diff. |
| Viewport — `prefers-reduced-motion` | OK | `globals.css:88-104` có rule global giảm animation/transition; spinner `animate-spin` được rule này vô hiệu hoá. |
| Viewport — không che lỗi bằng `overflow:hidden` | OK | `overflow-hidden` chỉ dùng ở wrapper map để bo góc iframe, không che layout lỗi. |

→ **Responsive gate: PASS** (không có mục FAIL).

## Skill gates
| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop` (`aislop scan --changes --json`) | **skip** — shell permission denied, không chạy được; không retry. | — |
| `anti-slop` (`npx oxlint`) | **skip, oxlint not configured** — glob `**/{.oxlintrc.json,oxlint.json,.oxlintrc}` = no files; `package.json` không có oxlint. | — |
| `open-code-review` (`ocr`) | **skip** — không chạy được shell để kiểm `ocr`. Không chặn PASS. | — |
| AI-readable-codebase | **OK** | Không có ≥3 AI-chaos indicator: tên self-descriptive; hàm ≤50 dòng (`submit` ~40, `validate` 9); file ≤300 dòng (max ~104); indirection ≤2; comment mô tả lý do (`rate-limit.ts:6`, `route.ts:37`) không phải WHAT; magic number validate là bound nghiệp vụ có pattern đặt tên. Không đổi luồng chính tài liệu hoá → không bắt buộc update README/ARCHITECTURE. |
| ai-friendly-web | **N/A (deferred)** | Repo chưa có `robots.txt`/`sitemap.xml`/`llms.txt` (glob = none) — đây là artifact phase deploy (Layer 4/6 DevOps), **không phát sinh/không regress từ diff này**. Đề xuất: bảo đảm DevOps bổ sung trước khi go-live. Không tính FAIL cho task UI này. |
| blitzstrike | **N/A** | Task UI (không phải STRICT auth/API public input); không có môi trường pentest. |

## Findings

### [MINOR] 429 không được focus (dead branch trong effect)
- **File:** `src/components/contact/ContactForm.tsx:19-22`
- **Evidence:** `if (state.status === 'error' || state.status === 'rate-limit') summaryRef.current?.focus();` nhưng `summaryRef` chỉ gắn vào error-summary div (render khi `status === 'error'`, dòng 39). Ở `status === 'rate-limit'`, `<p role="alert">` (dòng 43) **không có ref** → `summaryRef.current` là `null` → focus là no-op.
- **Impact:** focus không chuyển tới thông báo 429 (dù `role="alert"` vẫn auto-announce nên a11y không vỡ hoàn toàn). Design chỉ yêu cầu `role="alert"` cho 429 → không blocker.
- **Fix đề xuất:** gắn `ref={summaryRef}` cho `<p>` 429, hoặc tách `rateLimitRef`.

### [MINOR] `updateField` để lại key `undefined` trong `errors`
- **File:** `src/lib/contact/useContactForm.ts:34-40`
- **Evidence:** `setErrors((current) => ({ ...current, [field]: fieldError }))` — khi field hợp lệ, `fieldError === undefined` nhưng key vẫn tồn tại (`Object.keys(errors).length` vẫn đếm). `ContactForm.tsx:37` `hasFieldErrors = Object.keys(state.errors).length > 0`.
- **Impact:** trạng thái `error` (5xx) + người dùng sửa 1 field thành invalid → `hasFieldErrors` true → nút "Thử lại" biến mất; error-summary có thể render `<ul>` rỗng trong vài edge case. Không ảnh hưởng luồng 400/5xx chuẩn (vì `validateForm()` reset `errors` trước khi set status error).
- **Fix đề xuất:** dùng `delete`/tạo object mới bỏ key khi không có lỗi (vd `const next = { ...current }; if (fieldError) next[field] = fieldError; else delete next[field];`).

### [MINOR] Breakpoint `md` — map không full-width như design Screen 12
- **File:** `src/app/[locale]/contact/page.tsx:34-40`
- **Evidence:** design Screen 12 responsive table: `md ≥768` = "form | info 2 cột; **map full-width**". Implementation giữ `MapEmbed` trong `<aside>` (cột 2) ở cả md và lg → tại md map chỉ rộng ~50%, không full-width.
- **Impact:** lệch design ở duy nhất mốc md (base/lg đúng). Layout không tràn, vẫn dùng được.
- **Fix đề xuất:** nếu muốn bám design, cho MapEmbed span full-width ở md (`md:col-span-2` ở mức grid, hoặc tái cấu trúc aside) — hoặc ghi nhận quyết định lệch design.

### [MINOR] Xử lý 400 bỏ message từ server + bỏ qua lỗi ngoài 4 field
- **File:** `src/lib/contact/useContactForm.ts:75-86`
- **Evidence:** đọc `payload.errors` nhưng map sang `messages[field]` (message local), không dùng message server trả về (`API_SPEC.md:58` trả `errors:{email:"Email không hợp lệ"}`). Vòng lặp chỉ duyệt `['name','email','phone','message']` → lỗi `errors.form`/`errors.honeypot` bị bỏ, chỉ còn summary generic.
- **Impact:** đúng contract shape (không vỡ), nhưng mất ngữ cảnh lỗi cụ thể từ server. Không blocker.
- **Fix đề xuất:** ưu tiên message server khi có, fallback message local; bổ sung hiển thị lỗi `form` nếu xuất hiện.

### [MINOR] Hook tái dùng chưa tham số hoá "field subset" cho CTAForm compact
- **File:** `src/lib/contact/useContactForm.ts:5-27`
- **Evidence:** `ContactValues`/`validate`/`ContactMessages` cố định 4 field gồm `phone`. CTAForm compact (task-03) cần `name/email/message` (bỏ SĐT) → vẫn **dùng lại được** (không copy-paste), nhưng phải truyền thêm message `phone` không dùng và vẫn gửi `phone: ''` (server chấp nhận rỗng).
- **Impact:** tái dùng OK, chưa "generic" hoàn hảo. Ảnh hưởng thật sẽ lộ ở task-03.
- **Fix đề xuất:** (task-03) cho phép cấu hình danh sách field hoặc tách `validateContactFields(fields)`; hoặc chấp nhận gửi `phone:''` và ghi quyết định.

### [OBS] JSON-LD ContactPage chưa có
- **File:** `src/app/[locale]/contact/page.tsx` (không có JSON-LD)
- **Evidence:** task-02 note cho phép "defer Layer 4 nếu cần data thật"; design Screen 12 ghi JSON-LD BreadcrumbList + ContactPage. Chưa có data thật (OQ#2 placeholder) → hợp lý để defer, nhưng cần theo dõi ở Layer 4.

## Verdict
**✅ PASS** (NORMAL)

- Không có CRITICAL/MAJOR.
- 6 states + payload contract task-01 + honeypot + a11y R-24 + responsive R-23 + i18n 2 locale + metadata canonical/hreflang: **đạt** (responsive gate PASS).
- Không phải bug task → không cần repro PASS.
- 5 MINOR + 1 OBS là non-blocking, có thể xử lý ở round sau hoặc task-03.
- **Residual risk (bắt buộc xác nhận trước close-out):** `npm run lint` / `npm run typecheck` / `npm run build` chưa chạy được (shell denied) — primary/builder cần chạy và xác nhận PASS, đặc biệt SSG `/vi/contact` + `/en/contact`.
