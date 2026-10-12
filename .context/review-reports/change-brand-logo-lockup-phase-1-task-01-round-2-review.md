# Review — change-brand-logo-lockup · phase-1-task-01 · round-2 (trạng thái CUỐI)

Agent: reviewer
Model: opencode-go/deepseek-v4.1-flash

- **Change file:** `spec/changes/2026-10-12-brand-logo-lockup.md`
- **Task:** `tasks/change-brand-logo-lockup/phase-1-task-01.md`
- **Ngày:** 2026-10-12
- **Review level:** **STRICT**
- **Verdict:** ✅ **PASS** (2 MINOR non-blocking + residual risk; không có CRITICAL/MAJOR)

> Vòng 2 review **trạng thái cuối** sau khi primary crop asset sát nội dung (`816×306` → `488×137`) và
> đổi hiển thị `h-11` → `h-10`. Cả 2 MINOR của round-1 (M1 tagline, M2 docblock "trim sát viền") đã được
> xử lý/giảm nhẹ; M3 (header `lg` chật) đánh giá lại bằng CSS math → **rủi ro thấp hơn round-1**.

---

## 1. Review level + Reason

| Mục | Giá trị |
|---|---|
| Level | **STRICT** |
| Reason | `BrandLogo` là **shared component** render ở Header + Footer **mọi route, VI + EN** → trúng risk đỏ "shared service/hook/component" (`AGENTS.md` §Reviewer rules / `.agent/FEATURE_WORKFLOW.md` §6). Diff đụng **asset binary trong `public/`** + UI. Change file + task file cũng tự khai `Expected review level: STRICT`. |
| Không phải STRICT vì | Không có auth/RBAC/tenant/DB/schema/migration/API contract/payment/cron/secret. |

## 2. Blast radius

- **Trực tiếp:** `src/components/layout/BrandLogo.tsx` (1 component, 31 dòng) + asset `public/images/brand/logo-lockup.png`.
- **Gián tiếp (mọi trang):** Header (`Header.tsx:51`, prop `priority`) + Footer (`Footer.tsx:21`) → **toàn bộ route VI + EN**. Grep xác nhận đúng **2 caller**.
- **Không lan:** API/DB/auth/i18n/JSON-LD (`jsonld.ts:6` vẫn `logo-square.png`), SEO/OG (dùng `og-default.png`), `logo-mark.png` (0 ref trong `src/`).

## 3. Verify commands + result

| Command | Result | Ghi chú |
|---|---|---|
| `npm run lint` | **không tự chạy được** | ⛔ shell bị **permission.rejected** cho mọi lệnh shell trong session này (giống round-1). Dựa evidence primary: 0 errors, 1 warning pre-existing `src/components/mdx/index.tsx` (ngoài scope). |
| `npm run typecheck` | **không tự chạy được** | ⛔ shell denied. Primary: PASS. |
| `npm run build` | **không tự chạy được** | ⛔ shell denied. Primary: PASS trong bản copy cách ly `…\nta-build` (distDir `.next-build`), log `✓ Compiled successfully`. |
| asset dims/format/size | **không đo được** | ⛔ shell denied (không chạy được `System.Drawing`/đọc IHDR). Xác minh **nội dung + tỉ lệ + crop** bằng `Read(ảnh)` — xem §4. Dims/alpha/54,308 bytes dựa primary → residual. |
| grep reference (Grep) | ✅ chạy được | `logo-mark` trong `src/` = **0**; `logo-lockup` trong `src/` chỉ ở `BrandLogo.tsx:3,11`; `logo-square.png` còn ở `jsonld.ts:6`; `BrandLogo` = 2 caller + 1 định nghĩa. |
| HTML build (`vi/en/about/contact`) | **không tự chạy được** | ⛔ shell denied. Dựa primary: `logo-lockup.png` = 9, `logo-mark.png` = 0, `>NTA<` = 0, `aria-label` home VI/EN còn. |

> Ghi chú quy trình: mọi lệnh shell (`git status`/`git diff`/`npm run *`/đo ảnh) đều bị **permission.rejected** ở cả 2 vòng → reviewer không enumerate diff độc lập được; đã verify trực tiếp **trạng thái trên đĩa** (Read/Grep/Glob) thay vì tin lời builder.

## 4. Kết quả kiểm tra (Acceptance / correctness — trạng thái cuối)

| # | Hạng mục | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | Asset = mark + "NTA" + tagline, **không cắt chữ/tagline** | ✅ OK | `Read public/images/brand/logo-lockup.png`: nội dung fill sát khung (viền trong suốt chỉ ~2px), mark teal + wordmark "NTA" + tagline "ELEVATING INTELLIGENCE" đều nguyên vẹn, không cắt mép. |
| 2 | Crop sát nội dung (hết viền trong suốt rộng của round-1) | ✅ OK | Tỉ lệ khung hiển thị ≈ 483/135 ≈ **3.58** khớp `488/137 = 3.56` ⇒ asset đã bị crop bám content (round-1: 816×306 có viền rộng, content chỉ 484×133). |
| 3 | An toàn trong suốt (RGBA) | ⚠ chưa đo độc lập | Preview `Read` render nền trắng (không phân biệt được trắng-đục vs trong suốt trên site nền sáng). Primary khẳng định RGBA nền trong suốt → **residual**. |
| 4 | Kích thước khớp `width/height` | ✅ OK (theo primary) | `BrandLogo.tsx:4-5` khai `488/137`; primary báo file thật 488×137 RGBA 54,308 bytes. Không tự đo được (shell denied) → dims/bytes dựa primary. |
| 5 | `alt=""` + `aria-hidden="true"` giữ | ✅ OK | `BrandLogo.tsx:21-22`. |
| 6 | A11y name link home VI/EN không mất; không đọc trùng | ✅ OK | `Header.tsx:51` `aria-label={t('homeLabel')}` + `Footer.tsx:21` `aria-label={nav('homeLabel')}`; ảnh decorative (`aria-hidden`) → đúng. |
| 7 | `priority` vẫn truyền từ Header | ✅ OK | `Header.tsx:51` `<BrandLogo priority />`; `BrandLogo.tsx:25` `priority={priority}`. |
| 8 | 2 caller Header/Footer đều dùng lockup | ✅ OK | Grep: chỉ 2 caller; cả 2 tự đổi sang lockup. |
| 9 | `logo-mark.png` = 0 ref trong `src/` | ✅ OK | Grep `logo-mark` trong `src/` = 0 kết quả. |
| 10 | JSON-LD `logo-square.png` không đụng | ✅ OK | `src/lib/seo/jsonld.ts:6` nguyên vẹn. |
| 11 | design-spec reconciled đúng behavior cuối | ✅ OK | `.context/design-spec.md:22` = lockup `logo-lockup.png`: mark + wordmark + tagline, **`h-10 w-auto`** — khớp `BrandLogo.tsx:23` (trước đây round-1 ghi `h-11` → nay reconciled). |
| 12 | Docblock mô tả đúng (M2 round-1) | ✅ OK | `BrandLogo.tsx:11` = "đã crop sát nội dung, tỉ lệ 488:137 giữ qua `w-auto`" — khớp asset (hết câu sai "trim sát viền"). |
| 13 | Header 64/72px với logo `h-10` không vỡ dọc | ✅ OK (math) | Logo 40px < 64px mobile / 72px desktop → thừa ~24–32px đệm dọc. |
| 14 | Layout ngang ở `lg` 1024px không tràn | ✅ OK (math) / residual | Ước tính: container 1024 − 2×`px-8` = **960px** inner; hàng ≈ logo+`px-2` (~158) + nav (~440) + nhóm phải toggle+CTA (~206) ≈ **804px < 960px** (~156px slack). Rủi ro **thấp hơn** đánh giá round-1 (round-1 ước logo 117px; nay hẹp hơn về chiều cao nhưng rộng ~142px — vẫn nằm trong slack). Không browser → residual. |

## 5. Responsive Checklist Gate (MANDATORY — diff đụng UI)

Áp dụng: project có block `ui:` + diff đụng UI (component + asset). Breakpoints project: `[640,768,1024,1280,1536]`; kiểm mốc 375/768/1280. **Không có môi trường browser (shell denied + screenshot fail)** → xác minh bằng CSS math + đọc code; phần chưa chứng minh → Residual risk. **Không mục nào FAIL.**

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| **Layout** — không horizontal scroll | ✅ OK (math) | `BrandLogo` bọc `span.inline-flex` + `Image h-10 w-auto` (không set width px cứng, không tạo scroll). Header `lg` ước ~804/960px → không tràn (không browser nên để residual). |
| Layout — mobile-first / grid / container px | N/A | Diff không thêm media query/grid/container. |
| **Typography/Spacing** | N/A | Logo là ảnh; diff không đổi font/spacing text. |
| **Media** — `max-width`/`aspect-ratio`/không méo | ✅ OK | `next/image` với `width=488 height=137`; `h-10 w-auto` → width ≈ **142.5px** (40 × 488/137), giữ đúng tỉ lệ (không méo). next/image tự sinh `srcset`; cap theo source width 488 ⇒ không upscale quá 488. |
| Media — `srcset`/`sizes`, video `aspect-ratio` | N/A | next/image xử lý; không có video. |
| **Touch/Interaction** — target ≥ 44×44 | ✅ OK | Header link `min-h-11` (44px) bao logo; Footer link `inline-flex` bọc logo. |
| Touch — nav hamburger / table scroll | N/A | Diff không đụng nav/table. |
| **Viewport/A11y** — `100vh`/`dvh`, reduced-motion, `overflow:hidden` | N/A / ✅ | Không `100vh`; không motion; không `overflow:hidden` che lỗi. `aria-hidden` chỉ ở ảnh decorative (đúng), a11y name do `<Link>` gánh. |

**Kết luận gate:** không mục nào **FAIL** → gate **đạt**. Các điểm chưa chứng minh (tràn header `lg` thực tế, fit 375px) → Residual risk.

## 6. Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop` | **skip, tool không chạy được** | ⛔ shell permission denied → không chạy `aislop scan --changes --json`. Không tính FAIL. |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | Repo dùng ESLint preset Next (`npm run lint`); round-1 Glob xác nhận **không có** `.oxlintrc*`/`oxlint.config.*`. |
| `ocr` (open-code-review) | **skip, không chạy được** | ⛔ shell denied → không gọi `ocr`. Không chặn PASS. |
| AI-readable | ✅ OK | `BrandLogo.tsx` 31 dòng, 1 hàm ≤ 50 dòng, tên self-descriptive, docblock khớp code; **<3 indicator** → không FAIL. |
| ai-friendly-web | N/A | Không phải task public-facing web mới; không đổi route/`llms.txt`/`robots.txt`/`sitemap.xml`. |
| blitzstrike | N/A | Không auth/API public/input; không có môi trường pentest. |

## 7. Findings

**[MINOR] M1 — Tagline vẫn nhỏ ở `h-10` (40px) — nhưng đã cải thiện ~2× so với round-1.**
`src/components/layout/BrandLogo.tsx:23` (`className="h-10 w-auto"`).
- Nhận định: sau crop, ảnh 488×137 render ở 40px ⇒ scale 40/137 ≈ 0.29. Tagline (cap ~20px trong 137px frame) ⇒ render cao **~5–6px** (x-height ~4px). Round-1 (asset 816×306 chưa crop, content 133px trong frame 306px) tagline chỉ ~2–3px ⇒ **nay rõ hơn ~2×**, mức "nhỏ nhưng đọc được". Wordmark "NTA" render ~30px ⇒ tốt.
- Đây là **trade-off cố hữu** (full lockup + header 64/72px). Builder làm đúng AC (không cắt tagline, `h-10`).
- Đề xuất (không bắt buộc để PASS): user xác nhận thị giác độ đọc tagline; nếu muốn to hơn → mark-only cho Header + lockup cho Footer, hoặc nới header (cap 80px trong design-spec §1.1).

**[MINOR] M2 — Verification Plan trong task file còn số cũ (`816x306`), chưa cập nhật theo crop `488×137`.**
`tasks/change-brand-logo-lockup/phase-1-task-01.md:52` — `asset check → PNG dims/format ... = 816x306 RGBA`.
- Đối chiếu: Acceptance Criteria cùng file (dòng 37) đã đúng **488×137**; đây là dòng plan sót lại từ trước khi crop.
- Không ảnh hưởng runtime; chỉ gây nhầm lẫn khi trace. **Đề xuất fix:** sửa dòng 52 → `488x137 RGBA (54,308 bytes, nền trong suốt)`. Non-blocking.

*(Hết findings. Không có CRITICAL / MAJOR.)*

## 8. Residual risk

1. **Không có browser screenshot** (tool screenshot cần desktop window hiển thị — fail như primary báo): chưa chứng minh thị giác 375/768/1280, độ đọc tagline thực tế (M1), và fit header `lg` 1024–1200px (EN dài hơn) — dù CSS math ước ~804/960px ⇒ đủ slack.
2. **Không đo lại độc lập** dims/format/alpha/size asset (shell permission denied). Read(ảnh) xác nhận **nội dung + crop sát + tỉ lệ khớp 488:137**; tính **trong suốt / 54,308 bytes** vẫn dựa primary.
3. **Không re-run** lint/typecheck/build (shell denied) → chấp nhận evidence primary; lệch CI/local sẽ lộ ở bước sau.
4. **Không enumerate diff độc lập** (`git diff` bị chặn) → xác minh theo trạng thái trên đĩa.
5. **Quan sát quy trình (ngoài code, non-blocking):** hiện chưa thấy `spec/updates/2026-10-12-brand-logo-lockup.md` và `spec/test-scope/current.json` (scopeVersion 17) đang là của `change-home-solution-card-images`, không phải change này; đồng thời Glob `.context/runs/*brand-logo*` **không thấy run journal** cho change này. Việc publish/scope bump dự kiến diễn ra ở **close-out**; change file đã tự flag concurrency (hairstyle v16, dự kiến logo v17) — vì v17 nay đã bị home-solution chiếm, **cần bump v18 khi publish** để giữ luật "tăng, không trùng số".

## 9. Verdict

✅ **PASS** — không có CRITICAL/MAJOR. Tất cả acceptance criterion ở trạng thái cuối đạt:
asset đúng user **đã crop sát nội dung** (không cắt mark/wordmark/tagline, tỉ lệ khớp `488:137`),
`width={488}`/`height={137}`/`h-10 w-auto` khớp asset, `alt=""` + `aria-hidden` giữ,
a11y name link home VI/EN còn, `priority` giữ, JSON-LD `logo-square.png` không đụng,
`logo-mark.png` = 0 ref trong `src`, **design-spec reconciled đúng `h-10`**, header không vỡ dọc;
Responsive gate không FAIL.

**Khuyến nghị trước close-out:** (1) user xác nhận thị giác tagline ở 40px (M1) và header `lg` 1024px;
(2) sửa dòng Verification Plan cũ trong task file (M2); (3) khi publish spec phải dùng **scopeVersion 18**
(đừng trùng v17 của home-solution).
