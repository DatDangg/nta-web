import type { SectionVariant } from '@/components/ui/Section';
import { Section } from '@/components/ui/Section';
import { ShotImage } from './ShotImage';

export type ComplianceItem = {
  title: string;
  description: string;
  /** true = ô lớn chiếm 2 cột × 2 hàng; false = ô nhỏ. */
  large?: boolean;
  /**
   * Ảnh đặt dưới mô tả trong ô (ô lớn).
   * Ảnh khung macOS → đi qua `ShotImage` để giữ nguyên tỉ lệ, không cắt khung.
   */
  image?: { src: string; alt: string; ratio?: number };
  /**
   * Con số cực lớn làm điểm nhấn, thay cho ảnh — ví dụ "27" của Thông tư 27/2020.
   * Dùng khi ảnh trong ô không tạo được nhịp thị giác tốt.
   */
  figure?: { value: string; suffix?: string };
};

type BentoComplianceProps = { title: string; items: ComplianceItem[] };

/**
 * Bento "Bám sát văn bản pháp quy" (spec §5.2).
 *
 * Grid **không đều** — tránh kiểu "3 card icon + tiêu đề + chữ" quen thuộc.
 * Ô lớn `lg:col-span-2 lg:row-span-2`, các ô nhỏ xếp cột còn lại.
 *
 * Dùng viền + nền, **không** dùng shadow (bento dùng cả hai là nặng).
 * Padding dọc do `<Section>` bên trong lo, component KHÔNG tự thêm `py-*` (tránh cộng dồn).
 *
 * ⚠ Component **tự gọi `<Section>`** — KHÔNG bọc thêm `<Section>`/`<Container>` ở ngoài
 * (lồng thêm sẽ cộng padding ngang 2 lần, xem `FeatureZigZag`).
 */
export function BentoCompliance({
  title,
  items,
  variant = 'alt',
}: BentoComplianceProps & { variant?: SectionVariant }) {
  return (
    <Section variant={variant}>
      <h2 className="text-h2 font-bold">{title}</h2>
      <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
        {items.map((item) => (
          // Ô lớn chiếm 2×2 nên cao hơn hẳn nội dung của nó (2 ô nhỏ quyết định chiều cao
          // hàng). Căn giữ `justify-center` để khoảng trống thành padding cân đối, không
          // phải một mảng trống dính đáy.
          <div
            className={`rounded-lg border border-border p-6 ${
              item.large
                ? 'flex flex-col justify-center bg-surface lg:col-span-2 lg:row-span-2'
                : 'bg-surface-sunken'
            }`}
            key={item.title}
          >
            <h3 className="text-h3 font-semibold">{item.title}</h3>
            <p className="mt-2 text-body text-text-secondary">{item.description}</p>

            {item.figure ? (
              <p className="mt-6 flex items-baseline gap-2 text-primary">
                <span className="text-8xl font-bold leading-none tracking-tight sm:text-9xl">
                  {item.figure.value}
                </span>
                {item.figure.suffix ? (
                  <span className="text-3xl font-semibold">{item.figure.suffix}</span>
                ) : null}
              </p>
            ) : null}

            {item.image ? (
              <div className="mt-6">
                <ShotImage
                  alt={item.image.alt}
                  maxH="max-h-[360px]"
                  ratio={item.image.ratio}
                  skin="mx-auto rounded-md border border-border shadow-sm"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  src={item.image.src}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}