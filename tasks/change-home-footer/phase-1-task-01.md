# phase-1-task-01 — Restyle dải CTA + Footer toàn site theo ảnh goal

> Change request: `spec/changes/2026-10-12-home-footer-redesign.md` (type: feature, MODIFY UI/content)
> Slug: `change-home-footer-redesign` · Phase 1 (UI) · 1 task
> Reviewer mặc định: **STRICT** (shared component render MỌI route VI+EN + asset binary trong `public/`).

## Classification / Risk

| Trường | Giá trị |
|---|---|
| Change type | MODIFY (visual + content) — không đổi requirement |
| Scope | 2 component dùng chung (`src/components/shared/CTABanner.tsx`, `src/components/layout/Footer.tsx`) + i18n (`vi.json`/`en.json`) + 2 asset ảnh nền |
| Expected review level | **STRICT** |
| Blast radius | CTABanner render 7 route (home `primary`; blog/[slug], solutions/enterprise, solutions/ai, about, case-studies/[slug], products `alt`). Footer render MỌI route VI+EN qua `src/app/[locale]/layout.tsx:66` |
| Doc impact | `.context/design-spec.md` §1.2 Footer + §1.3 CTA/§2 Screen 1 CTA + Screen 9/11 CTA mô tả; `docs/DESIGN.md` (nếu mô tả footer) |
| Decision impact | Không. Không đổi nav/form/i18n toggle/JSON-LD. Spec 3.0.0 **KHÔNG bump** (R-01/R-03/R-11 vẫn thoả) |
| Risk | MEDIUM (shared UI + a11y + contrast + dead-link) |

## Inputs

- Ảnh goal: `tasks/change-home-footer/refs/goal.jpg`; nền CTA `public/images/home/footer-cta-bg.jpg` (1920×819, teal wave tối); nền footer `public/images/home/footer-bg.jpg` (1922×818, sáng globe dot).
- Design constraints `.context/design-spec.md`: CẤM em-dash `—`; CẤM eyebrow/kicker; 1 label/intent CTA; touch target ≥44×44; `Container` = nguồn sự thật bề rộng (**KHÔNG** đặt `px-*` ở `<section>`).
- Canonical CTA label: `common.cta.contact` = "Liên hệ tư vấn" / "Contact us" (GIỮ NGUYÊN).

## Outputs

1. `src/components/shared/CTABanner.tsx` — nền ảnh teal + text trắng + hàng 3 gạch đầu dòng icon (monitor/gear/bolt) ngăn vạch dọc + nút pill trắng "Liên hệ tư vấn →". Copy tiêu đề/mô tả GIỮ NGUYÊN (prop `title`/`description` từ caller).
2. `src/components/layout/Footer.tsx` — tách sub-component (`FooterBrand`, `FooterLinks`, `SupportCard`, legal bar); nền ảnh sáng; cột thương hiệu (BrandLogo + tagline + 3 social); vạch dọc desktop; 3 cột link đúng mapping; card "Cần hỗ trợ?" → `/contact` (phải desktop, dưới mobile); legal = copyright + LanguageToggle.
3. `src/i18n/messages/vi.json` + `en.json` — key mới đủ 2 locale + bỏ key chết (`contactGroup`, `ctaText`, `privacy`).
4. 2 asset ảnh nền trong `public/images/home/`.

## Mapping link footer (CHỐT — chỉ route tồn tại)

| Cột | Mục | Key | Route |
|---|---|---|---|
| Về NTA | Giới thiệu | `footer.intro` (mới) | `/about` |
| Về NTA | Liên hệ | `nav.contact` | `/contact` |
| Giải pháp | Giải pháp Doanh nghiệp | `nav.enterprise` | `/solutions/enterprise` |
| Giải pháp | Giải pháp AI | `nav.ai` | `/solutions/ai` |
| Giải pháp | Ứng dụng AI | `footer.aiApps` (mới) | `/products` |
| Giải pháp | Case Study | `nav.caseStudies` | `/case-studies` |
| Nội dung | Sản phẩm | `nav.products` | `/products` |
| Nội dung | Tin tức | `nav.news` | `/blog` |

BỎ (không có trang): Đội ngũ, Tuyển dụng, Tài liệu, Câu hỏi thường gặp, cả 3 link legal.
Route tồn tại xác nhận từ `src/app/[locale]/**/page.tsx`: `/about /contact /products /case-studies /blog /solutions/enterprise /solutions/ai`.

## Acceptance Criteria

- [x] CTA mọi trang: nền ảnh teal (`footer-cta-bg.jpg`), tiêu đề/mô tả trắng, **3 gạch đầu dòng icon** ngăn vạch dọc, nút pill trắng chữ tối + mũi tên →. Copy tiêu đề/mô tả giữ nguyên.
- [x] Footer mọi trang: nền sáng (`footer-bg.jpg`) phủ `bg-background` (chữ đọc rõ), cột thương hiệu (BrandLogo + tagline + 3 social tròn), vạch dọc phân cách (desktop), 3 cột link đúng mapping, card "Cần hỗ trợ?" → `/contact`, legal = copyright (+ LanguageToggle giữ behavior R-20).
- [x] **0 dead link**: mọi `<Link>` trong CTABanner/Footer trỏ route tồn tại.
- [x] i18n **key parity VI/EN**; không em-dash `—` trong chuỗi UI; không eyebrow/kicker.
- [x] A11y: social link có `aria-label`; target ≥44×44 (social + CTA pill); ảnh nền decorative (`alt="" aria-hidden`); heading footer dùng `<h2>`.
- [x] Responsive 375/768/1280: mobile 1 cột (card hỗ trợ xuống dưới), desktop đúng layout ảnh; không scroll ngang.
- [x] Không đổi behavior khác (nav, form, i18n toggle, JSON-LD).
- [x] Verify: lint + typecheck + build PASS; HTML build kiểm VI + EN (ảnh nền render, 0 dead link, key parity).

## Verification Plan

- `npm run lint` (từ `.context/project-config.md:33` → `web_lint_command`).
- `npm run typecheck` (`web_typecheck_command`).
- `npm run build` (`build_command`) — dùng `distDir` tách riêng (`.next-build`) vì `.next` có thể bị `next dev` chiếm (tiền lệ change brand-logo-lockup).
- HTML build: grep `footer-cta-bg.jpg` / `footer-bg.jpg` render ở mọi trang VI+EN; grep route link trong HTML footer/CTA ⊆ route tồn tại; kiểm key parity bằng script so 2 file JSON.
- `test_command: null` → skip (chưa có test framework), ghi rõ.

## Retry / Error Memory

- Attempt 1 fail → đọc `reportPath`, sửa tối thiểu theo root cause, không patch triệu chứng.
- Attempt 2 fail → so pattern component đang hoạt động (Header/BrandLogo), kiểm lại assumption.
- Attempt 3 fail → **KHÔNG** thử #4; set `architecture_review_needed`, báo human.

## Doc / Decision Impact

- Reconcile: `.context/design-spec.md` §1.2 (Footer) + §1.3/§2 (CTA mô tả) theo thiết kế mới; `docs/DESIGN.md` nếu mô tả footer là as-built current-state (chỉ mô tả layout, không đổi intent).
- Không đổi `SPECIFICATIONS.md` (R-01/R-03/R-11 vẫn thoả) → spec 3.0.0 KHÔNG bump; vẫn publish `spec/updates/` + `spec/CHANGELOG.md` + `spec/test-scope/current.json` (scope +1).

## Feature Verification

**Trạng thái: DONE** — tất cả Acceptance criteria PASS (verify bởi primary trên đĩa, build thật).

### Verify commands + result

| Command | Nguồn | Kết quả |
|---|---|---|
| `npm run lint` | `web_lint_command` | ✅ 0 errors, 1 warning pre-existing (`src/components/mdx/index.tsx` no-img-element — ngoài scope) |
| `npm run typecheck` | `web_typecheck_command` | ✅ PASS (0 lỗi) |
| `npm run build` | `build_command` | ✅ PASS — 43 trang HTML (`distDir .next-build`); không route nào fail |
| `test` | `test_command: null` | skip — chưa có test framework |
| Key parity vi/en | script Node | ✅ 168/168 key, vi-only [] · en-only [] |

### HTML build evidence (Node, UTF-8)

- `footer-bg.jpg` render **43/43 trang** (trừ `_not-found.html` = 404 global không dùng locale layout — pre-existing).
- `footer-cta-bg.jpg` render đúng **mọi trang có `CTABanner`** (home/about/products/solutions×2/blog detail/case detail); các trang list không có CTA (blog list, case-studies list, contact, solution detail dùng CTAForm) đúng như trước, không regression.
- Chuỗi footer đúng locale: VI (`Nền tảng vận hành...`, `Tư vấn chuyên sâu`, `Cần hỗ trợ?`, `Bảo lưu mọi quyền`) / EN tương ứng.
- **0 dead link**: 63 href nội bộ distinct ⊆ route tồn tại (`/about /contact /products /case-studies /blog /solutions/enterprise /solutions/ai` + slug detail).
- Không em-dash trong chuỗi UI MỚI (em-dash còn trong payload i18n là key `products.screenshotAlt` pre-existing, ngoài scope).

### Reviewer

- `.context/review-reports/change-home-footer-redesign-phase-1-task-01-round-1-review.md`
- **Verdict: PASS** (STRICT) — 0 CRITICAL / 0 MAJOR; 2 MINOR:
  - MINOR-1 `Footer.tsx` SupportCard thiếu `sm:col-span-2` → **đã fix tại close-out** (1 dòng).
  - MINOR-2 URL 3 social còn trỏ trang chủ nền tảng (cần profile thật của NTA) → **residual**.
- Reviewer shell bị permission deny → verify tĩnh + dựa evidence primary. Residual: chưa render browser.

### Residual risk

- URL social thật của NTA chưa có.
- Các mục link trong ảnh goal (Đội ngũ, Tuyển dụng, Tài liệu, Câu hỏi thường gặp, 3 link legal) bị lược vì chưa có trang.
- Chưa render browser thật (contrast/layout đo bằng CSS math + ảnh nguồn).
- Concurrency: `vi.json`/`en.json` + `.context/design-spec.md` trong working tree còn hunk của session `hero-banner-restyle` (ngoài scope — commit tách hunk).
