import { Section } from '@/components/ui/Section';
import { ShotImage } from './ShotImage';

type AiSectionProps = {
  title: string;
  description: string;
  /** Danh sách gợi ý — dạng danh sách có nhãn, KHÔNG phải icon + chữ. */
  suggestions: string[];
  image?: string;
  imageAlt?: string;
  imageRatio?: number;
};

/**
 * Section AI — nền tối (spec §5.3).
 *
 * ⚠ Trên nền `ink`, KHÔNG dùng `text-primary` (#0071e3, chỉ đạt 3.4:1 so với #1d1d1f —
 * dưới WCAG AA). Dùng nhóm token `ink-*` và `accent-ink` #64b5ff (≈7.4:1).
 *
 * **SAI LỆCH SO VỚI SPEC §5.3 — cần anh duyệt:** spec bảo 2 cột bằng nhau (text trái, ảnh
 * phải). Nhưng ảnh crop AI là **1223×284, tỉ lệ 4.3** — một dải rất ngang và rất thấp.
 * Trong cột ~608px nó chỉ còn 608×141px, chữ bên trong **không đọc được**, mà spec cũng
 * yêu cầu "ảnh crop phải đọc rõ chữ bên trong". Hai yêu cầu này mâu thuẫn nhau.
 *
 * Chọn: **ảnh tràn ngang dưới**, chiếm trọn 1216px → hiển thị gần đúng kích thước gốc
 * (1223px), chữ đọc được. Giữ phần text + danh sách ở trên.
 * Nếu anh muốn giữ đúng 2 cột như spec, phải đổi sang crop khác
 * (`04-danh-gia-ai-tt27-crop.png`, tỉ lệ 1.157) — nhưng crop đó là lưới nhận xét TT27,
 * không phải khung Trợ lý AI mà copy §11.4 nói tới.
 */
export function AiSection({
  title,
  description,
  suggestions,
  image,
  imageAlt,
  imageRatio,
}: AiSectionProps) {
  return (
    <Section spacing="large" variant="ink">
      <div className="max-w-[65ch]">
        <h2 className="text-h2 font-bold text-ink-text">{title}</h2>
        <p className="mt-4 text-body-lg text-ink-text-secondary">{description}</p>
      </div>

      <ul className="mt-8 grid max-w-[65ch] gap-4">
        {suggestions.map((suggestion) => (
          <li
            className="border-l-2 border-accent-ink bg-ink-surface py-3 pl-4 pr-4 text-body text-ink-text"
            key={suggestion}
          >
            {suggestion}
          </li>
        ))}
      </ul>

      {image ? (
        <div className="mt-12">
          <ShotImage
            alt={imageAlt ?? ''}
            maxH="max-h-[420px]"
            ratio={imageRatio}
            skin="rounded-lg border border-ink-border"
            sizes="(max-width: 1280px) 100vw, 1216px"
            src={image}
          />
        </div>
      ) : null}
    </Section>
  );
}