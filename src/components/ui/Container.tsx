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
 * - `prose` (720px): CHỈ khối chữ thuần MỘT cột (FAQ, đoạn văn dài).
 *   **2 lớp**: lớp ngoài y hệt `default` (1280 + `mx-auto` + padding) để mép trái khớp mọi
 *   section khác; lớp trong `max-w-[720px]` bám mép trái lớp ngoài (KHÔNG `mx-auto` — nếu có
 *   sẽ lùi vào giữa và lệch so với tiêu đề cùng cấp).
 * - `narrow` (520px): **duy nhất** căn giữa (`mx-auto`) — hero text.
 *
 * ⚠ KHÔNG dùng `prose` cho khối chữ nhiều cột (grid 2–3 cột): ở 720px mỗi cột chỉ còn ~340px,
 * chữ bị bẻ dòng từng từ. Với grid, giữ `default` và giới hạn từng cột bằng `max-w-[65ch]`.
 * ⚠ KHÔNG dùng `prose` cho section có ảnh — bóp ảnh thành dải hẹp, lệch tỉ lệ giữa các trang.
 */
const outerClass = 'mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8';

const sizeClass: Record<ContainerSize, string> = {
  default: '',
  prose: '',
  narrow: 'mx-auto max-w-[520px]',
};

export function Container({
  as: Tag = 'div',
  children,
  className = '',
  size = 'default',
  ...containerProps
}: ContainerProps) {
  const classes = [outerClass, sizeClass[size], className].filter(Boolean).join(' ');

  // `prose` cần thêm một lớp trong để giới hạn 720px mà vẫn bám mép trái lớp ngoài.
  if (size === 'prose') {
    return (
      <Tag className={classes} {...containerProps}>
        <div className="max-w-[720px]">{children}</div>
      </Tag>
    );
  }

  return (
    <Tag className={classes} {...containerProps}>
      {children}
    </Tag>
  );
}