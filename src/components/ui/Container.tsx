import type { ElementType, ReactNode } from 'react';

type ContainerSize = 'default' | 'prose' | 'narrow';

type ContainerProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
};

/**
 * Nguồn sự thật duy nhất cho mọi giới hạn bề rộng trên site.
 *
 * - `default` (1280px): mặc định — mọi section CÓ ảnh, section chuẩn, header, footer, CTA.
 * - `prose` (720px): CHỈ khối chữ thuần MỘT cột (FAQ, đoạn văn dài) — nội dung đọc liên tục.
 * - `narrow` (520px): hero text căn giữa. Không dùng cho phần ảnh của hero.
 *
 * ⚠ KHÔNG dùng `prose` cho khối chữ nhiều cột (grid 2–3 cột): ở 720px mỗi cột chỉ còn ~340px,
 * chữ bị bẻ dòng từng từ. Với grid, giữ `default` và giới hạn từng cột bằng `max-w-[65ch]`.
 * ⚠ KHÔNG dùng `prose` cho section có ảnh — bóp ảnh thành dải hẹp, lệch tỉ lệ giữa các trang.
 */
const sizeClass: Record<ContainerSize, string> = {
  default: 'max-w-container',
  prose: 'max-w-[720px]',
  narrow: 'max-w-[520px]',
};

export function Container({ as: Tag = 'div', children, className = '', size = 'default' }: ContainerProps) {
  // `sizeClass` đặt trước `className` để caller vẫn override được bằng class riêng.
  const classes = ['mx-auto', 'w-full', 'px-4', 'sm:px-6', 'lg:px-8', sizeClass[size], className]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes}>{children}</Tag>;
}