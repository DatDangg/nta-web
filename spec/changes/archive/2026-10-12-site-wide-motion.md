---
id: site-wide-motion
type: feature
status: done
created: 2026-10-12
---

# 2026-10-12 — Hiệu ứng chuyển động (animation) cho mọi trang

- **Class:** ADDITIVE (bộ hiệu ứng mới) + MODIFY (Header, Hero, các hero trang con, `Reveal`)
- **Risk:** MEDIUM — auto-motion áp lên **mọi trang** qua selector toàn cục; Header đổi hành vi khi cuộn
- **Trạng thái:** **DONE** — đã implement + verify (tsc, eslint, Playwright 14 route VI/EN). Code trên working tree, chưa commit.
- **Tham chiếu thiết kế:** [AI Technologies – Sync](https://sync.ancorathemes.com/ai-technologies/) · [Helpdesk – Sync](https://sync.ancorathemes.com/helpdesk/)

## 1. Yêu cầu

User: "thêm hiệu ứng animation cho dự án, phân tích 2 web tham chiếu rồi thực hiện — **có animation ở mọi trang**".

## 2. Phân tích 2 trang tham chiếu (đọc DOM/CSS thật)

Cả 2 dựng bằng Elementor + ThemeREX addons + **GSAP 3.12 / ScrollTrigger**.

| Hiệu ứng | Chi tiết đo được | AI Tech | Helpdesk |
|---|---|---|---|
| Entrance khi cuộn | `ta_fadeinup` (opacity 0 → 1, `translateY(60px)` → 0), `ta_fadein`, `ta_fadeinright` (60px); delay 100–500ms | ✅ ~20 khối | ✅ ~26 khối |
| Tiêu đề tách chữ/dòng | `animation_type_char` (stagger 10–20ms), `animation_type_line` (30–50ms), `sequental` (100ms) | ✅ | ✅ |
| Hover ảnh | `trx_hover_zoom`: `scale(1.1)`, 1s `cubic-bezier(0.19,1,0.22,1)`, khung `overflow:hidden` | ✅ | ✅ |
| Header | `sc_layouts_row_fixed_ater_scroll` + keyframe `slideInDownSmooth` | ✅ | ✅ |
| Counter | `trx-addons-counter` đếm lên khi vào viewport | — | ✅ 4 số |
| Marquee | `trx-addons-marquee` dải chữ + icon chạy ngang | — | ✅ |
| Khác | parallax layers, stack section sticky/zoom, blur, scroll-to-top | ✅ | ✅ |

## 3. Giải pháp (đã code)

Không thêm dependency (không GSAP) — CSS + IntersectionObserver.

| # | Hạng mục | File |
|---|---|---|
| 1 | **Auto-motion mọi trang**: quét `#main` theo selector, fade-up 40px (tiêu đề thêm blur), item trong `ul/ol/dl/.grid` stagger 90ms, ảnh/figure zoom-out reveal. CSS + JS dùng **chung 1 nguồn selector**. Opt-out: `data-motion-off`; opt-in: `data-motion="up\|fade\|left\|right\|zoom"` | `src/lib/motion/auto-motion.ts`, `src/components/motion/MotionRoot.tsx`, `src/app/[locale]/layout.tsx` |
| 2 | Chuyển trang mờ-hiện (`animation-fill-mode: backwards`, không để lại transform) | `src/app/[locale]/template.tsx` (mới) |
| 3 | Tiêu đề tách từ (thuần CSS) — `PageHeader`, `SolutionHero`, `ArticleHeader`, 404; tách dòng — Hero trang chủ, `ShowcaseHero` | `src/components/motion/SplitText.tsx` + các file kể trên |
| 4 | Hero trang chủ: panel kính bật lên + trôi nhẹ, cột biểu đồ mọc, đường tăng trưởng tự vẽ, "+86%" đếm lên, ảnh nền thu nhỏ dần (không fade → không trễ LCP); bỏ `Reveal` thay bằng `motion-load` | `src/components/home/Hero.tsx`, `HeroVisual.tsx` |
| 5 | Marquee dưới hero trang chủ — **tái dùng nhãn `heroPanels.*.items` (VI/EN), không thêm copy** | `src/components/motion/Marquee.tsx`, `src/app/[locale]/page.tsx` |
| 6 | Counter đếm lên (giữ định dạng `2.000+`, `3,5x`, `40%`; bản `sr-only` = giá trị cuối) | `src/components/motion/CountUp.tsx`, `ResultBlock.tsx`, `ShowcaseOverview.tsx` |
| 7 | Header ẩn khi cuộn xuống / hiện khi cuộn lên (không ẩn khi dropdown mở, hiện lại khi focus) + thanh tiến độ đọc (CSS scroll-driven, trình duyệt không hỗ trợ thì ẩn) | `src/components/layout/Header.tsx` |
| 8 | Nút lên đầu trang + vòng tiến độ (hiện sau 600px) | `src/components/motion/ScrollTopButton.tsx` |
| 9 | Hover zoom ảnh trong thẻ (`a.group .overflow-hidden > img`), mũi tên CTA nhích phải, nền CTA trôi chậm | `globals.css`, `CTABanner.tsx`, `Hero.tsx` |
| 10 | `Reveal` đồng bộ nhịp mới (40px, 900–1000ms, stagger 90ms) | `src/components/ui/Reveal.tsx`, `globals.css` |

Easing chung: `--ease-motion: cubic-bezier(0.19, 1, 0.22, 1)` (lấy từ trang tham chiếu).

## 4. Ràng buộc an toàn (đã xử lý)

- `prefers-reduced-motion` → `MotionRoot` gắn `motion-off`, marquee đứng yên, thanh tiến độ ẩn, rule toàn cục tắt animation/transition.
- Failsafe: JS lỗi/chậm → sau 4s tự `motion-off`, không nội dung nào bị giữ ẩn.
- Quét lần đầu bằng `requestIdleCallback` (≤250ms) để không gắn `data-*` vào DOM chưa hydrate (tránh cảnh báo hydration mismatch đã gặp ở trang 404).
- Transition chỉ gắn **trong lúc chạy** (`[data-inview]:not([data-motion-done])`) → không đè hover/transition riêng của card.
- Loại trừ: `.reveal`, `nav`, `details`, `[aria-hidden]`, phần tử bên trong item/form/figure/table (không lồng hiệu ứng).
- `@media print` → mọi phần tử hiện đủ.

## 5. Acceptance

- [x] Mọi route (VI + EN) có hiệu ứng: `/`, `/about`, `/solutions/enterprise`, `/solutions/enterprise/[slug]`, `/solutions/ai`, `/solutions/ai/[slug]`, `/case-studies`, `/case-studies/[slug]`, `/blog`, `/blog/[slug]`, `/products`, `/contact`, 404
- [x] Cuộn hết trang: **0 phần tử kẹt opacity 0** (Playwright, 14 route)
- [x] Không cảnh báo hydration mismatch
- [x] reduced-motion → nội dung hiện ngay, không chuyển động
- [x] Không thêm dependency; không thêm copy mới (marquee tái dùng nhãn có sẵn)
- [x] `tsc --noEmit` PASS · `eslint` PASS (1 warning cũ ở `mdx/index.tsx`, không liên quan)
- [ ] `npm run build` — chưa chạy được ở sandbox (chặn Google Fonts), chạy trên máy trước khi deploy
- [x] Chụp kiểm tra: trang chủ (hero, marquee, lưới thẻ stagger, header ẩn khi cuộn, nút lên đầu trang), CRM, case study mobile 390px
- [ ] Commit (1 change = 1 commit) — user tự commit

## 6. Ghi chú

- Trang mới sau này **tự có hiệu ứng**, không cần bọc `<Reveal>`. Vùng không muốn chuyển động → `data-motion-off`.
- `.tmp/` còn file tạm do Claude tạo khi verify (`motion-verify.tgz`, `motion-patch.tgz`, `MotionRoot.tsx`, `layout.tsx`) — đã gitignore, xoá tay.
- Chưa làm (có thể tách change sau): parallax theo chuột, stack section sticky/zoom như trang AI Technologies.
