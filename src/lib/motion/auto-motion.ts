/**
 * Auto-motion: hiệu ứng xuất hiện khi cuộn cho MỌI trang mà không phải bọc từng khối bằng `<Reveal>`.
 *
 * Nguồn DUY NHẤT của selector: cả CSS (ẩn trước khi vào viewport, render ở layout) lẫn JS
 * (`MotionRoot` quan sát IntersectionObserver) đều dùng hằng số ở file này — sửa một chỗ là đủ,
 * không lo CSS ẩn một phần tử mà JS không bao giờ hiện lại.
 *
 * Ngôn ngữ chuyển động lấy theo 2 trang tham chiếu (Sync / ThemeREX — AI Technologies, Helpdesk):
 * fade-in-up ~40–60px, tiêu đề hiện kèm blur, item trong lưới/danh sách hiện lần lượt (stagger
 * ~90ms), easing `cubic-bezier(0.19, 1, 0.22, 1)`.
 *
 * Opt-out: thêm `data-motion-off` vào một phần tử → nó và toàn bộ con không bị auto-motion.
 */

const SCOPE = '#main';

/** Phần tử cha có các con là "item" (hiện lần lượt). */
const LIST_PARENTS = ':is(ul, ol, dl, .grid)';

/** Không áp auto-motion cho các vùng này (đã có hiệu ứng riêng / tương tác riêng / ẩn). */
const EXCLUDE = [
  '[data-motion-off]',
  '[data-motion-off] *',
  '.reveal',
  '.reveal *',
  '.sr-only',
  '[aria-hidden="true"]',
  '[aria-hidden="true"] *',
  'nav *',
  'details *',
  `${LIST_PARENTS} > * *`, // phần tử nằm TRONG một item → đi cùng item, không tách riêng
  ':is(form, figure, blockquote, table) *',
  // Ảnh `priority` của next/image (hero, LCP) → hiện ngay, không chờ JS/IntersectionObserver.
  'img[fetchpriority="high"]',
].join(', ');

const not = `:not(${EXCLUDE})`;

/** Tiêu đề — fade + up + blur. */
export const MOTION_TITLE = `${SCOPE} :is(h1, h2)${not}`;
/** Khối nội dung — fade + up. */
export const MOTION_BLOCK = `${SCOPE} :is(h3, h4, p, blockquote, form, table, pre, iframe, video)${not}`;
/** Item trong danh sách / lưới — fade + up, stagger theo thứ tự vào viewport. */
export const MOTION_ITEM = `${SCOPE} ${LIST_PARENTS} > *${not}`;
/** Ảnh/figure đứng riêng — fade + thu nhỏ dần về 1 (zoom-out reveal). */
export const MOTION_MEDIA = `${SCOPE} :is(figure, img)${not}`;
/** Opt-in thủ công: `data-motion` trên phần tử bất kỳ. */
export const MOTION_OPT_IN = `${SCOPE} [data-motion]:not([data-motion-off] *)`;

export const AUTO_MOTION_SELECTOR = [MOTION_TITLE, MOTION_BLOCK, MOTION_ITEM, MOTION_MEDIA, MOTION_OPT_IN].join(',\n');

/** Thời lượng (ms) — JS dùng để biết lúc nào gắn `data-motion-done` (gỡ transition). */
export const MOTION_DURATION_MS = 1000;
export const MOTION_STAGGER_MS = 70;
export const MOTION_MAX_STAGGER_STEPS = 6;
/** Chờ ảnh trong cụm tải xong tối đa bao lâu (ms) trước khi vẫn cho cụm xuất hiện. */
export const MOTION_IMAGE_WAIT_MS = 800;

/*
 * CSS: chỉ ẩn khi `html.js` (script inline thêm trước khi paint) và chưa bị `motion-off`
 * (reduced-motion / không có IntersectionObserver / failsafe 3s nếu JS lỗi).
 *
 * Transition CHỈ gắn trong lúc đang chạy (`[data-inview]:not([data-motion-done])`) — xong thì gỡ,
 * để không đè `transition`/`transform` riêng của phần tử (vd thẻ card có hover nhấc lên).
 */
const on = 'html.js:not(.motion-off)';
const hidden = (sel: string) => sel.split(',\n').map((s) => `${on} ${s}:not([data-inview])`).join(',\n');
const running = (sel: string) => sel.split(',\n').map((s) => `${on} ${s}[data-inview]:not([data-motion-done])`).join(',\n');

export const AUTO_MOTION_CSS = `
${hidden(AUTO_MOTION_SELECTOR)} {
  opacity: 0;
  transform: translate3d(0, 40px, 0);
}
${hidden(MOTION_TITLE)} {
  transform: translate3d(0, 0.5em, 0);
  filter: blur(8px);
}
${hidden(MOTION_MEDIA)},
${on} ${MOTION_OPT_IN.replace('[data-motion]', '[data-motion="zoom"]')}:not([data-inview]) {
  transform: scale(1.06);
}
${on} ${MOTION_OPT_IN.replace('[data-motion]', '[data-motion="fade"]')}:not([data-inview]) { transform: none; }
${on} ${MOTION_OPT_IN.replace('[data-motion]', '[data-motion="left"]')}:not([data-inview]) { transform: translate3d(-60px, 0, 0); }
${on} ${MOTION_OPT_IN.replace('[data-motion]', '[data-motion="right"]')}:not([data-inview]) { transform: translate3d(60px, 0, 0); }
${running(AUTO_MOTION_SELECTOR)} {
  transition:
    opacity 900ms var(--ease-motion) var(--motion-delay, 0ms),
    transform ${MOTION_DURATION_MS}ms var(--ease-motion) var(--motion-delay, 0ms),
    filter 900ms var(--ease-motion) var(--motion-delay, 0ms);
}
@media print {
  ${hidden(AUTO_MOTION_SELECTOR)} { opacity: 1 !important; transform: none !important; filter: none !important; }
}
`;
