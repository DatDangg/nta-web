'use client';

import Image from 'next/image';
import { useState } from 'react';

type HomeImageProps = {
  alt: string;
  className: string;
  height?: number;
  priority?: boolean;
  sizes: string;
  src: string;
  width?: number;
};

/**
 * Ảnh có thuộc tính tỉ lệ rõ ràng.
 *
 * KHÔNG set `width`/`height` mặc định: tỉ lệ cứng 1200×720 (1.67:1) làm méo mọi ảnh vốn khác tỉ lệ.
 * `next/image` cần width/height (hoặc `fill`) để tính intrinsic size, nên call site PHẢI truyền
 * kích thước đúng cho từng ngữ cảnh — ví dụ avatar 200×200, logo 160×48.
 *
 * Nếu không biết tỉ lệ: đặt width/height theo khung CSS đang dùng (class `aspect-*` hoặc grid),
 * hoặc bỏ qua `next/image` và dùng thẻ `<img>` thuần cho ảnh cần giữ tỉ lệ gốc.
 */
export function HomeImage({
  alt,
  className,
  height,
  priority = false,
  sizes,
  src,
  width,
}: HomeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div aria-label={alt} className={className} role="img" />;
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={height}
      onError={() => setFailed(true)}
      priority={priority}
      sizes={sizes}
      src={src}
      width={width}
    />
  );
}