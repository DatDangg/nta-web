import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type ContainerSize = 'default' | 'prose' | 'narrow';

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
};

/**
 * Nguồn sự thật duy nhất cho mọi giới hạn bề rộng trên site.
 *
 * - `default` (1280px): mặc định — mọi section CÓ ảnh, section chuẩn, header, footer, CTA.
 * - `prose` (720px): CHỈ khối chữ thuần MỘT cột (FAQ, đoạn văn dài). **Bám mép trái** của
 *   container 1280 (không căn giữa) — nếu căn giữa, khối 720px lùi vào giữa, lệch so với
 *   các section 1280 xung quanh và tiêu đề cùng cấp. Quy tắc: chỉ hero mới căn giữa.
 * - `narrow` (520px): **duy nhất** căn giữa (`mx-auto`) — hero text.
 *
 * ⚠ KHÔNG dùng `prose` cho khối chữ nhiều cột (grid 2–3 cột): ở 720px mỗi cột chỉ còn ~340px,
 * chữ bị bẻ dòng từng từ. Với grid, giữ `default` và giới hạn từng cột bằng `max-w-[65ch]`.
 * ⚠ KHÔNG dùng `prose` cho section có ảnh — bóp ảnh thành dải hẹp, lệch tỉ lệ giữa các trang.
 */
const sizeClass: Record<ContainerSize, string> = {
  default: 'mx-auto max-w-container',
  prose: 'max-w-[720px]',
  narrow: 'mx-auto max-w-[520px]',
};

export function Container({
  as: Tag = 'div',
  children,
  className = '',
  size = 'default',
  ...containerProps
}: ContainerProps) {
  // `sizeClass` đặt trước `className` để caller vẫn override được bằng class riêng.
  // `prose` không có `mx-auto` → bám mép trái, dùng padding y hệt `default`.
  const classes = ['w-full', 'px-4', 'sm:px-6', 'lg:px-8', sizeClass[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...containerProps}>
      {children}
    </Tag>
  );
}