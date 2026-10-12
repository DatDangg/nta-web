/**
 * `template.tsx` mount lại mỗi lần đổi route (khác `layout.tsx`) → chuyển trang có hiệu ứng
 * mờ-hiện nhẹ. Dùng `animation-fill-mode: backwards` nên sau khi chạy xong KHÔNG để lại
 * `transform` (không tạo containing block cho phần tử `fixed`/`sticky` bên trong).
 */
export default function LocaleTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
