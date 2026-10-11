'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { shotLayout } from './features';

type ShotImageProps = {
  src: string;
  alt: string;
  /** Tỉ lệ rộng/cao đo sẵn (xem `docs/screenshots-mapping.md`). */
  ratio?: number;
  /** Chiều cao tối đa, dạng class Tailwind. Nguồn duy nhất — không thêm `max-h-*` ở nơi khác. */
  maxH: string;
  /** Viền + bo góc + bóng. */
  skin?: string;
  sizes?: string;
  priority?: boolean;
  /** Kích thước khung `next/image`. KHÔNG phải kích thước hiển thị — ảnh co theo CSS. */
  width?: number;
  height?: number;
};

/**
 * Ảnh khung macOS — **không cắt theo bất kỳ hướng nào** (spec §3.1).
 *
 * Vì sao phải đo thay vì quyết định theo tỉ lệ: việc ảnh có bị cắt đáy hay không **phụ thuộc
 * bề rộng cột**, mà bề rộng cột lại đổi theo viewport (343px ở mobile, ~608px ở lg).
 * Ảnh `lms/07-hoc-ba-so` (ratio 0.836) cao 410px ở mobile → **vừa** `max-h-420`, không bị cắt;
 * nhưng cao 727px ở lg → bị cắt. Quyết định tĩnh theo `ratio` sẽ fade nhầm ở một trong hai
 * trường hợp, mà fade trên ảnh không bị cắt là **xoá viền dưới khung cửa sổ** — đúng thứ
 * cơ chế này sinh ra để tránh.
 *
 * Vì vậy: render, đo `scrollHeight > clientHeight` của khung, rồi mới bật fade.
 */
export function ShotImage({
  src,
  alt,
  ratio,
  maxH,
  skin = '',
  sizes = '(max-width: 1024px) 100vw, 50vw',
  priority = false,
  width = 1440,
  height = 720,
}: ShotImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [clipped, setClipped] = useState(false);
  const shot = shotLayout(ratio, maxH);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const check = () => setClipped(frame.scrollHeight > frame.clientHeight + 1);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [src]);

  const fade = shot.fade && clipped ? 'shot-fade-bottom' : '';
  const image = (
    <Image
      alt={alt}
      className={`${shot.imageClass} ${fade}`}
      height={height}
      priority={priority}
      sizes={sizes}
      src={src}
      width={width}
    />
  );

  // Nhánh A (ảnh ngang): không có phần bị cắt → không khung bọc, không fade.
  if (!shot.frameClass) {
    return image;
  }

  return (
    <div className={`${shot.frameClass} ${skin}`} ref={frameRef}>
      {image}
    </div>
  );
}