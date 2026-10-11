import { Container } from '@/components/ui/Container';

export type ComplianceItem = {
  title: string;
  description: string;
  /** true = ô lớn chiếm 2 cột × 2 hàng; false = ô nhỏ. */
  large?: boolean;
};

type BentoComplianceProps = { title: string; items: ComplianceItem[] };

/**
 * Bento "Bám sát văn bản pháp quy" (spec §5.2).
 *
 * Grid **không đều** — tránh kiểu "3 card icon + tiêu đề + chữ" quen thuộc.
 * Ô lớn `lg:col-span-2 lg:row-span-2`, các ô nhỏ xếp cột còn lại.
 *
 * Dùng viền + nền, **không** dùng shadow (bento dùng cả hai là nặng).
 * Padding dọc do `<Section>` bên ngoài lo, component KHÔNG tự thêm `py-*` (tránh cộng dồn).
 */
export function BentoCompliance({ title, items }: BentoComplianceProps) {
  return (
    <Container>
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
          </div>
        ))}
      </div>
    </Container>
  );
}