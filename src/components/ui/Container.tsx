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
 * - `default` (1280px): mặc định — dùng cho mọi section CÓ ảNH, section chuẩn, header, footer, CTA.
 *   Không bao giờ bọc ảnh trong `prose` (720px): sẽ bóp ảnh thành dải hẹp, lệch tỉ lệ giữa các trang.
 * - `prose` (720px): CHỈ khối chữ thuần (FAQ, đoạn văn dài) — nội dung đọc liên tục, không có ảnh.
 * - `narrow` (520px): hero text căn giữa. Không dùng cho phần ảnh của hero.
 */
const sizeClass: Record<ContainerSize, string> = {
  default: '',
  prose: 'max-w-[720px]',
  narrow: 'max-w-[520px]',
};

export function Container({ as: Tag = 'div', children, className = '', size = 'default' }: ContainerProps) {
  const classes = ['mx-auto', 'w-full', 'max-w-container', 'px-4', 'sm:px-6', 'lg:px-8', sizeClass[size], className]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes}>{children}</Tag>;
}