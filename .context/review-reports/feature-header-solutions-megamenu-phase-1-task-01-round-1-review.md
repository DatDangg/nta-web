# Review — feature-header-solutions-megamenu / phase-1-task-01 / round 1

**Verdict: PASS NORMAL** · CRITICAL 0 · MAJOR 0 · MINOR 0

## Kiểm
- Scope đúng task: `Header.tsx`, `layout.tsx`, `SolutionsMegaMenu.tsx` (mới), `lib/content/solutions-menu.ts` (mới). Không đụng MobileNav/i18n/icons.
- Dữ liệu thật: nhóm từ `listingPages`, mục con từ mdx theo `enterpriseSlugs`/`aiSlugs`, icon+mô tả ngắn từ `listingItems`; href `/solutions/<category>/<slug>` khớp route SSG.
- Hành vi giữ nguyên: hover/click mở, click ngoài/Esc/đổi trang đóng, header không ẩn khi mở. ArrowDown: menu render có điều kiện → focus trong `requestAnimationFrame` (đã xử lý).
- A11y: icon `aria-hidden`, link có text; Tab theo DOM: nhóm DN → nhóm AI → mục con nhóm đang chọn (focus nhóm đổi cột phải).
- Responsive: panel `min(48rem, 100vw-3rem)`; đo 1024/1280/1440 không tràn. Dưới lg dùng MobileNav (không đổi).
- Verify: typecheck/lint/build PASS; smoke 200 vi+en.
