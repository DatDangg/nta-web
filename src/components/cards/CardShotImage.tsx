'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/**
 * Ảnh giao diện thật trong **thẻ giải pháp** (change `2026-10-12-solution-card-real-images`).
 *
 * Khác `ShotImage` (trang chi tiết) ở chỗ: đây là **khung tỉ lệ cố định của thẻ**, ảnh rộng bằng
 * khung và **bám mép trên**, phần dư ở đáy do khung `overflow-hidden` cắt rồi fade đi.
 *
 * **Tuyệt đối không cắt 2 bên, không `object-cover`** — `object-cover` sẽ cắt mất thanh tiêu đề
 * và 3 chấm macOS ở mép trên, tức mất đúng phần nói "đây là giao diện NTA". Ở đây ảnh luôn
 * `w-full h-auto` nên bề rộng khớp khung; chỉ chiều cao bị khung cắt.
 *
 * Fade chỉ bật khi ảnh **thực sự** cao hơn khung (đo `scrollHeight > clientHeight`) — bật vô điều
 * kiện sẽ làm mờ viền dưới khung cửa sổ vốn đã hiện đủ. Lý do đo thay vì so tỉ lệ tĩnh: khung
 * đổi bề rộng theo viewport, cùng một ảnh có thể vừa/không vừa ở hai mốc khác nhau.
 */
export function CardShotImage({
  src,
  alt,
  frameClassName,
  ratio,
  sizes = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
}: {
  src: string;
  alt: string;
  /** Class của KHUNG bọc (tỉ lệ cố định + `overflow-hidden`) — truyền từ `cardStyles`. */
  frameClassName: string;
  ratio?: number;
  sizes?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [clipped, setClipped] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const check = () => setClipped(frame.scrollHeight > frame.clientHeight + 1);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [src]);

  // `width`/`height` chỉ để `next/image` tính kích thước nội tại (chống layout shift) —
  // ảnh co theo CSS, nên số này không phải kích thước hiển thị.
  const width = 1600;
  const height = ratio ? Math.round(width / ratio) : 1125;

  return (
    <div className={frameClassName} ref={frameRef}>
      <Image
        alt={alt}
        className={`w-full h-auto ${clipped ? 'shot-fade-bottom' : ''}`}
        height={height}
        sizes={sizes}
        src={src}
        width={width}
      />
    </div>
  );
}
