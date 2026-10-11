import { Container } from '@/components/ui/Container';

type ContentBlockProps = { title: string; content: string };

/**
 * Khối nội dung chữ thuần 1 cột.
 *
 * `SolutionBlock` có nền `background-alt` nên phải tràn full-width như mọi section khác
 * (spec §1 L2) — vì vậy padding nằm trong `<Container>` bên trong `<section>`,
 * KHÔNG đặt `px-*` ở `<section>` (sẽ cộng dồn với Container và vỡ lề so với section khác).
 *
 * KHÔNG dùng `border-y`: section có nền xám đã tách khối với vùng trắng trên/dưới, thêm kẻ
 * là dư. Bỏ kẻ cũng tránh được lỗi kẻ trải hết `100vw` / lệch mép padding.
 */
export function SolutionBlock({ title, content }: ContentBlockProps) {
  return (
    <section className="bg-background-alt py-8">
      <Container size="prose">
        <h2 className="text-h2 font-bold">{title}</h2>
        <p className="mt-4 leading-relaxed text-text-secondary">{content}</p>
      </Container>
    </section>
  );
}