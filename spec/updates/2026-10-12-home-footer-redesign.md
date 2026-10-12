# Spec update — 2026-10-12 · change `home-footer-redesign`

- **Spec version**: 3.0.0 (**KHÔNG bump** — không đổi requirement/behavior contract; R-11 và BR-001 vẫn thoả)
- **Scope version**: v18 → **v19** (`feature-update`)
- **Trigger**: `feature-update` (post-build MODIFY UI/content)
- **Change file**: `spec/changes/2026-10-12-home-footer-redesign.md`
- **Task**: `tasks/change-home-footer/phase-1-task-01.md`

## Thay đổi

Restyle **dải CTA cuối trang** (`CTABanner`) + **Footer** toàn site (VI+EN) theo ảnh goal user cung cấp:

- `CTABanner` (7 route): nền ảnh teal `footer-cta-bg.jpg` + overlay gradient, chữ trắng; thêm hàng
  3 gạch đầu dòng icon (Tư vấn chuyên sâu / Giải pháp phù hợp / Triển khai nhanh chóng) ngăn vạch dọc;
  nút pill trắng "Liên hệ tư vấn" + mũi tên → `/contact`. Copy `title`/`description` GIỮ NGUYÊN.
- `Footer` (mọi route): nền ảnh sáng `footer-bg.jpg` phủ `bg-background`; cột thương hiệu
  (BrandLogo + tagline "Nền tảng vận hành doanh nghiệp thông minh với AI." + 3 social tròn);
  vạch dọc desktop; 3 cột link; card "Cần hỗ trợ?" → `/contact`; legal = copyright + `LanguageToggle`.
- i18n `vi.json`/`en.json`: thêm `common.cta.bulletConsulting|bulletSolution|bulletDeploy` +
  `footer.{intro,aiApps,tagline,supportTitle,supportLink,socialFacebook,socialLinkedIn,socialYouTube}`;
  bỏ key chết `footer.{contactGroup,ctaText,privacy}`.

## Phạm vi / quyết định đã chốt với user

1. Sửa CẢ dải CTA + Footer, **áp dụng toàn site**.
2. **Chỉ link tới route đã tồn tại** (tránh dead link, theo tiền lệ `2026-10-09-fix-layer1-dead-links`):
   - Về NTA: Giới thiệu `/about` · Liên hệ `/contact`
   - Giải pháp: Giải pháp Doanh nghiệp `/solutions/enterprise` · Giải pháp AI `/solutions/ai` · Ứng dụng AI `/products` · Case Study `/case-studies`
   - Nội dung: Sản phẩm `/products` · Tin tức `/blog`
   - BỎ (không có trang): Đội ngũ, Tuyển dụng, Tài liệu, Câu hỏi thường gặp, cả 3 link legal.

## Impact

- **Direct**: mọi trang VI+EN (Footer qua `[locale]/layout.tsx`); 7 route có `CTABanner`.
- **Dependents**: `src/i18n/messages/{vi,en}.json`; `.context/design-spec.md` §1.2.
- **Regression**: `variant` prop `CTABanner` giữ để tương thích 7 caller (chỉ còn chọn màu nền dự phòng);
  `LanguageToggle` vẫn ở footer (R-20); BR-001 thoả qua `SupportCard` → `/contact`; không đổi nav/form/JSON-LD.

## Acceptance / verify

- Dải CTA + Footer render đúng ảnh nền + nội dung mọi trang VI/EN.
- **0 dead link** (mọi href nội bộ ⊆ route tồn tại).
- i18n key parity vi/en = 168/168; không em-dash trong chuỗi UI mới.
- Verify: `npm run lint` (0 errors, 1 warning pre-existing `src/components/mdx/index.tsx`) · `npm run typecheck` PASS · `npm run build` PASS (43 trang HTML) · `test_command: null` → skip.
- Reviewer STRICT round 1 = **PASS** (0 CRITICAL/MAJOR; 2 MINOR: SupportCard `sm:col-span-2` đã fix tại close-out; URL social còn generic → residual).

## Residual

- URL 3 social trỏ trang chủ nền tảng (`facebook.com/`, `linkedin.com/`, `youtube.com/`) — cần profile thật của NTA.
- Các mục link trong ảnh goal (Đội ngũ/Tuyển dụng/Tài liệu/FAQ/legal) bị lược vì chưa có trang.
- Chưa render browser thật (contrast/layout đo bằng CSS math + ảnh nguồn).
