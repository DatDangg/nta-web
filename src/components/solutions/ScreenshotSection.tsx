import { ShotImage } from './ShotImage';
import { HomeImage } from '@/components/shared/HomeImage';
import { Section } from '@/components/ui/Section';

/** Item screenshots: chuỗi (alt chung) hoặc object alt riêng + tỉ lệ đo sẵn (bảng §7). */
type ScreenshotItem = string | { src: string; alt: string; ratio?: number };

type ScreenshotSectionProps = {
  images: ScreenshotItem[];
  title: string;
  /** Alt dự phòng cho item dạng chuỗi (cách dùng cũ — các trang AI vẫn truyền kiểu này). */
  imageAlt: string;
  /**
   * Chú thích `<figcaption>` dưới mọi ảnh — chỉ trang HRM dùng (ảnh mock vẽ tay,
   * spec §7). Thiếu → không caption, DOM y hệt cũ.
   */
  caption?: string;
  /**
   * Bọc ảnh v2 khung macOS (viền + bóng + chống cắt theo tỉ lệ, spec §3.1) —
   * chỉ 3 trang doanh nghiệp truyền. Trang AI (ảnh JPG có nền) KHÔNG truyền → giữ
   * nguyên render `HomeImage` cũ, không đổi giao diện trang AI.
   */
  shotFrame?: boolean;
};

export function ScreenshotSection({ images, title, imageAlt, caption, shotFrame }: ScreenshotSectionProps) {
  if (images.length === 0) return null;

  const items = images.map((item) =>
    typeof item === 'string' ? { src: item, alt: imageAlt, ratio: undefined } : { ratio: undefined, ...item }
  );

  return (
    <Section>
      <h2 className="text-h2 font-semibold">{title}</h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.src}>
            {shotFrame ? (
              <figure>
                <ShotImage alt={item.alt} maxH="max-h-[320px] lg:max-h-[420px]" ratio={item.ratio} skin="rounded-lg border border-border shadow-md" src={item.src} />
                {caption ? (
                  <figcaption className="mt-3 text-body-sm text-text-secondary text-center">{caption}</figcaption>
                ) : null}
              </figure>
            ) : (
              <HomeImage alt={item.alt} className="h-auto w-full rounded-lg" height={1900} sizes="(min-width: 640px) 50vw, 100vw" src={item.src} width={2600} />
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
