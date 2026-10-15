import Image from 'next/image';

// Ảnh từng tin trong bản tin AI tuần (CR-035), do tools/ai-news/generate.py sinh:
// <NewsImage src="/uploads/<sha256>.<ext>" alt="…" width="W" height="H" />.
// Cần component riêng vì MDX 3 không map JSX <img> viết thẳng sang components.img,
// và next-mdx-remote truyền width/height dạng chuỗi.
// Regex lặp lại UPLOAD_FILE_NAME_PATTERN (src/lib/uploads/image-file.ts) thay vì import: file đó kéo node:fs vào graph component.
const NEWS_IMAGE_SRC_PATTERN = /^\/uploads\/[0-9a-f]{64}\.(jpg|png|webp)$/;
const MAX_NEWS_IMAGE_SIDE = 8192;

export interface NewsImageProps {
  src?: unknown;
  alt?: unknown;
  width?: unknown;
  height?: unknown;
}

function parseImageSide(value: unknown): number | null {
  const text = typeof value === 'number' ? String(value) : value;
  if (typeof text !== 'string' || !/^[1-9][0-9]{0,3}$/.test(text)) return null;
  const side = Number(text);
  return side <= MAX_NEWS_IMAGE_SIDE ? side : null;
}

// Thuộc tính sai dạng → không render ảnh (null) thay vì ảnh vỡ hoặc tải nguồn ngoài.
export function NewsImage({ src, alt, width, height }: NewsImageProps) {
  if (typeof src !== 'string' || !NEWS_IMAGE_SRC_PATTERN.test(src)) return null;
  if (typeof alt !== 'string' || alt.trim() === '') return null;
  const imageWidth = parseImageSide(width);
  const imageHeight = parseImageSide(height);
  if (imageWidth === null || imageHeight === null) return null;

  return (
    <Image
      alt={alt}
      height={imageHeight}
      loading="lazy"
      sizes="100vw"
      src={src}
      width={imageWidth}
      className="my-8 aspect-auto h-auto w-full rounded-md"
    />
  );
}
