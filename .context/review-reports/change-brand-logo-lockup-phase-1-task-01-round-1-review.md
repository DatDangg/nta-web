# Review — change-brand-logo-lockup · phase-1-task-01 · round-1

Agent: reviewer
Model: opencode-go/deepseek-v4.1-flash

- **Change file:** `spec/changes/2026-10-12-brand-logo-lockup.md`
- **Task:** `tasks/change-brand-logo-lockup/phase-1-task-01.md`
- **Ngày:** 2026-10-12
- **Review level:** **STRICT**
- **Verdict:** ✅ **PASS** (kèm residual risk + 1 điểm cần user xác nhận về độ đọc tagline)

---

## 1. Review level + Reason

| Mục | Giá trị |
|---|---|
| Level | **STRICT** |
| Reason | `BrandLogo` là **shared component** render ở Header + Footer **mọi route, cả VI + EN** → trúng risk đỏ "shared service/hook/component" (`.agent/FEATURE_WORKFLOW.md` §6 / `AGENTS.md` §Reviewer rules). Change file + task file cũng tự khai `Expected review level: STRICT`. Ngoài ra diff đụng **asset trong `public/`** (binary) + UI. |
| Không phải STRICT vì | Không có auth/RBAC/tenant/DB/schema/migration/API contract/payment/cron/secret. |

## 2. Blast radius

- **Trực tiếp:** `src/components/layout/BrandLogo.tsx` (1 component) + asset `public/images/brand/logo-lockup.png`.
- **Gián tiếp (mọi trang):** Header (`Header.tsx:51`, prop `priority`) + Footer (`Footer.tsx:21`) → **toàn bộ route VI + EN** (đã xác nhận đúng **2 caller**, grep `BrandLogo` trong `src/` = 2 usage + 1 định nghĩa + import).
- **Không lan:** API/DB/auth/i18n/JSON-LD/SEO (đã kiểm không đụng), `logo-square.png` (JSON-LD) và `logo-mark.png` (giờ 0 reference).

## 3. Verify commands + result

| Command | Result | Ghi chú |
|---|---|---|
| `npm run lint` | **không tự chạy được** | ⛔ shell bị **permission denied** cho toàn bộ lệnh shell trong session này → reviewer không re-run độc lập được. Dựa trên evidence primary: 0 errors, 1 warning pre-existing `src/components/mdx/index.tsx` (ngoài scope). Chấp nhận + ghi residual. |
| `npm run typecheck` | **không tự chạy được** | ⛔ shell denied (như trên). Primary: PASS. |
| `npm run build` | **không tự chạy được** | ⛔ shell denied. Primary build trong bản copy cách ly (`.next-build`, do `next dev` chiếm `.next`): PASS, log `✓ Compiled successfully`. |
| asset dims/format | **không đo được** | ⛔ shell denied (không chạy được `System.Drawing`). Xác minh **nội dung + nền trong suốt bằng Read(ảnh)** — xem §4. |
| grep reference | ✅ chạy được (Grep) | `logo-mark.png` trong `src/` = **0**; `logo-lockup.png` chỉ ở `BrandLogo.tsx`; `logo-square.png` còn nguyên ở `jsonld.ts:6`. |

> Ghi chú quy trình: mọi lệnh shell (`git status`/`git diff`/`npm run *`/đo ảnh) đều bị **permission.rejected** → không enumerate diff/asset binary độc lập được. Đã verify trực tiếp **trạng thái trên đĩa** của các file liên quan (Read/Grep) thay vì tin lời builder.

## 4. Kết quả kiểm tra (Acceptance / correctness)

| # | Hạng mục | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | Asset = ảnh user (mark + "NTA" + tagline) | ✅ OK | Read `public/images/brand/logo-lockup.png` → hiển thị đúng lockup: mark teal + wordmark "NTA" (near-black) + tagline "ELEVATING INTELLIGENCE", nền trong suốt. |
| 2 | Nền trong suốt | ✅ OK | Ảnh render RGBA trong suốt; primary báo góc `A=0`. (Pixel-level không đo lại được — shell denied.) |
| 3 | Kích thước khớp `width/height` | ⚠ **không đo độc lập được** | `BrandLogo.tsx:4-5` khai `816/306`; primary báo file thật 816×306 RGBA. Không tự đo được → residual risk (nếu lệch sẽ gây CLS nhỏ khi `w-auto` load xong). |
| 4 | `alt=""` + `aria-hidden="true"` giữ | ✅ OK | `BrandLogo.tsx:21-22`. |
| 5 | A11y name link home (VI/EN) không mất | ✅ OK | `Header.tsx:51` + `Footer.tsx:21` vẫn `aria-label={t('homeLabel')}` / `{nav('homeLabel')}`; ảnh là decorative → đúng, không đọc trùng. |
| 6 | `priority` vẫn truyền từ Header | ✅ OK | `Header.tsx:51` `<BrandLogo priority />`; `BrandLogo.tsx:25` `priority={priority}`. |
| 7 | 2 caller Header/Footer đều dùng `BrandLogo` | ✅ OK | Grep: chỉ 2 caller; cả 2 tự động đổi sang lockup. |
| 8 | Không còn `logo-mark.png` trong `src/` | ✅ OK | Grep `logo-mark` trong `src/` = 0 kết quả. |
| 9 | JSON-LD `logo-square.png` không bị đụng | ✅ OK | `src/lib/seo/jsonld.ts:6` giữ nguyên. |
| 10 | design-spec reconciled | ✅ OK | `.context/design-spec.md:22` mô tả lockup `logo-lockup.png` + `h-11 w-auto` (hết mark-only). |
| 11 | Header 64/72px với logo `h-11` (44px) không vỡ (dọc) | ✅ OK (math) | Logo 44px < header 64px (mobile) / 72px (desktop) → vừa, còn ~10-14px đệm. |
| 12 | Layout ngang ở `lg` (1024px) | ⚠ rủi ro | Logo **rộng lên ~74px**: trước mark `h-9` (480×397 → ~43.5px), nay lockup `h-11` (816×306 → **~117px**). Header dùng `flex justify-between` **không wrap** → cần soi thật ở 1024–1200px. Xem Finding M3. |

## 5. Responsive Checklist Gate (MANDATORY — diff đụng UI)

Áp dụng: project có `ui:` trong profile + diff đụng UI (component + asset). Test theo `ui.responsive_breakpoints` — project chốt thang Tailwind `[640,768,1024,1280,1536]`; mốc kiểm 375/768/1280 (base <640 là mobile mặc định). **Không có môi trường browser (shell denied + screenshot fail)** → xác minh bằng CSS math + đọc code; ghi rõ phần chưa chứng minh vào Residual risk.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| **Layout** — không horizontal scroll | ⚠ OK (component) / chưa chứng minh (header lg) | `BrandLogo` bọc `span.inline-flex` + `Image h-11 w-auto` → không set width cố định px, không tạo scroll ở component. Rủi ro crowding ở header `lg` (F-M3). |
| Layout — mobile-first / grid / container | N/A | Diff không thêm media query, không grid, không container px. |
| **Typography/Spacing** | N/A | Logo là ảnh (không đổi font/spacing text); không đổi CSS text. |
| **Media** — `max-width`, `aspect-ratio`, không méo | ✅ OK | `next/image` với `width=816 height=306` → giữ tỉ lệ; `h-11 w-auto` không méo. next/image tự sinh `srcset`; asset 816px render ở ~117px (over-fetch nhẹ ~66KB, đã tối ưu qua next/image — chấp nhận). |
| Media — `srcset`/`sizes`, video `aspect-ratio` | N/A | next/image xử lý; không có video. |
| **Touch/Interaction** — target ≥44×44 | ✅ OK | Header link `min-h-11` (44px) bao logo 44px; Footer link bọc logo 44px. |
| Touch — nav hamburger / table scroll | N/A | Diff không đụng nav/table. |
| **Viewport/A11y** — `100vh`/`dvh`, reduced-motion, `overflow:hidden` | N/A / ✅ | Không dùng `100vh`; không thêm motion; không `overflow:hidden` che lỗi. `aria-hidden` chỉ cho ảnh decorative (đúng), a11y name do `<Link>` gánh. |

**Kết luận gate:** không mục nào **FAIL** → gate **đạt**. Các mục ⚠ chuyển Residual risk (không có browser để chứng minh 375/768/1280).

## 6. Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop` | **skip, tool không chạy được** | ⛔ shell permission denied → không chạy `aislop scan --changes --json`. Không tính FAIL. |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | Glob `**/{.oxlintrc*,oxlint.config.*,.eslintrc*}` → **No files found**. Repo dùng ESLint preset của Next (`npm run lint`). |
| `ocr` (open-code-review) | **skip, không chạy được** | ⛔ shell denied → không gọi `ocr`. Không chặn PASS. |
| AI-readable | ✅ OK | `BrandLogo.tsx` 31 dòng, 1 hàm ≤50 dòng, tên self-descriptive; chỉ 1 comment có thể chưa chính xác (F-M2) → <3 indicator. |
| ai-friendly-web | N/A | Không phải task public-facing web mới; không đổi route/`llms.txt`/`robots.txt`/`sitemap.xml`. |
| blitzstrike | N/A | Không auth/API public/input; không có môi trường pentest. |

## 7. Findings

**[MINOR] M1 — Tagline "ELEVATING INTELLIGENCE" gần như không đọc được ở `h-11` (44px).**
`src/components/layout/BrandLogo.tsx:23` (`className="h-11 w-auto"`).
- Nhận định: lockup 816×306 → render ở height 44px ⇒ **width ≈ 117px**. Tagline chiếm ~5% chiều cao ảnh ⇒ ở 44px tagline chỉ cao **~2–3px** → thực tế **không đọc được** (chỉ là vệt xám). Wordmark "NTA" cao ~11–13px → gần ngưỡng đọc.
- Lưu ý: đây là **trade-off cố hữu** — để tagline cao ~7px cần lockup cao ~140px, **không thể** vừa header 64/72px. Tức chốt của user (full lockup **+** header chuẩn) tự nó khiến tagline nhỏ. Builder đã làm đúng AC (`h-11`, không cắt tagline).
- Đề xuất (cần **user xác nhận**, không bắt buộc sửa để PASS): (a) chấp nhận làm trade-off + ghi 1 dòng vào design-spec; hoặc (b) dùng mark-only cho Header + lockup cho Footer; hoặc (c) nới header lên ~80px (đã bị cap 80px trong design-spec §1.1) nếu user muốn tagline to hơn. **Không đề xuất** chỉ tăng `h` thêm vài px vì không giải quyết.

**[MINOR] M2 — Comment docblock có thể mô tả sai ("đã trim sát viền").**
`src/components/layout/BrandLogo.tsx:11` — "Lockup là PNG nền trong suốt (`logo-lockup.png`), **đã trim sát viền nên không cần padding thủ công**".
- Bằng chứng: Read(ảnh) cho thấy lockup có **viền trong suốt đáng kể** quanh nội dung (mark bắt đầu ~20% từ trái; content chiếm ~50% chiều cao). Nếu đúng, câu "trim sát viền" là **sai**, và điều này làm nội dung hiển thị **nhỏ hơn 44px** thực tế (⇒ làm M1 nặng hơn).
- Không đo pixel được (shell denied) nên mức độ chắc chắn trung bình.
- Đề xuất: kiểm lại viền asset; nếu có padding → sửa comment cho đúng, hoặc trim asset (crop) rồi render lại để nội dung đạt đúng 44px.

**[MINOR] M3 — Logo rộng thêm ~74px, rủi ro chật ở header `lg` (~1024px).**
`src/components/layout/Header.tsx:50` (`Container ... h-16 ... lg:h-[72px]`, `flex justify-between` không wrap) + `BrandLogo.tsx:23`.
- Bằng chứng: mark cũ `h-9` (480×397) → ~43.5px; lockup mới `h-11` (816×306) → ~117px (+74px). Ở đúng mốc 1024px, hàng gồm logo + nav (`hidden lg:flex`, 5–6 link `gap-5`) + toggle + CTA dễ chật; do không `flex-wrap` nên có thể đẩy tràn/ép nav wrap thay vì co lại.
- Không chứng minh được (không browser). Đề xuất: kiểm thị giác 1024–1200px (VI + EN, EN dài hơn); nếu tràn → thêm `min-w-0`/giảm `gap`/giới hạn max-width logo.

Không có **CRITICAL** / **MAJOR**.

## 8. Residual risk

1. **Không có browser screenshot** (tool screenshot cần desktop window — fail như primary báo): chưa chứng minh thị giác 375/768/1280, độ đọc tagline (M1), crowding `lg` (M3), fit mobile 375px (logo 117px + hamburger).
2. **Không đo lại độc lập** dims/format/alpha của asset (shell permission denied). Dựa primary + Read(ảnh): nội dung + nền trong suốt **đã xác nhận**; dims/alpha tiếp tục dựa primary.
3. **Không re-run** lint/typecheck/build (shell denied) → chấp nhận evidence primary; nếu CI/local khác biệt sẽ lộ ở bước sau.
4. **Không enumerate diff độc lập** (`git diff` bị chặn) → xác minh theo trạng thái trên đĩa; giả định "chỉ 3 file đổi" chưa được tự kiểm chứng.

## 9. Verdict

✅ **PASS** — không có CRITICAL/MAJOR. Tất cả acceptance criteria (asset đúng user + trong suốt, `alt=""`/`aria-hidden` giữ, a11y name VI/EN còn, `priority` giữ, JSON-LD không đụng, 2 caller cùng đổi, `logo-mark.png` = 0 ref trong `src`, design-spec reconciled, kích thước dọc header không vỡ) đều đạt; Responsive gate không FAIL.

**Khuyến nghị trước khi close-out:** hiển thị lockup cho user xác nhận **độ đọc của tagline ở 44px** (M1) — nếu user chấp nhận trade-off thì ghi 1 dòng vào design-spec và đóng task; nếu không, chọn phương án (b)/(c) rồi build lại. M2/M3 nên xử lý cùng lượt đó (sửa comment / kiểm header `lg`).
</br>
