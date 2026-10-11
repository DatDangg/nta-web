import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type ContainerSize = 'default' | 'prose' | 'narrow';

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /**
   * Class áp cho **lớp nội dung** (bên trong padding ngang), không phải lớp ngoài.
   *
   * Dùng cho đường kẻ `border`: kẻ đặt trên lớp ngoài sẽ bắt đầu ở mép NGOÀI padding
   * (x≈79 ở 1440) trong khi chữ bắt đầu ở mép trong (x≈111) → lệch ~32px, thấy rõ ở
   * MetaBar và SolutionBlock. Đặt kẻ vào lớp nội dung là nó bắt đầu đúng mép chữ.
   */
  insetClassName?: string;
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
  insetClassName = '',
  size = 'default',
  ...containerProps
}: ContainerProps) {
  const classes = [outerClass, sizeClass[size], className].filter(Boolean).join(' ');

  // Cần lớp nội dung khi: `prose` (giới hạn 720px) HOẶC caller muốn đặt kẻ trong padding.
  // `narrow` không cần — hero căn giữa, không có kẻ.
  if (size === 'prose' || insetClassName) {
    const innerClasses = [size === 'prose' ? 'max-w-[720px]' : '', insetClassName]
      .filter(Boolean)
      .join(' ');

    return (
      <Tag className={classes} {...containerProps}>
        <div className={innerClasses}>{children}</div>
      </Tag>
    );
  }

  return (
    <Tag className={classes} {...containerProps}>
      {children}
    </Tag>
  );
}