import { Container } from '@/components/ui/Container';

type ContentBlockProps = { title: string; content: string };

/**
 * Khối nội dung chữ thuần 1 cột.
 *
 * `SolutionBlock` có nền `background-alt` nên phải tràn full-width như mọi section khác
 * (spec §1 L2) — vì vậy padding nằm trong `<Container>` bên trong `<section>`,
 * KHÔNG đặt `px-*` ở `<section>` (sẽ cộng dồn với Container và vỡ lề so với section khác).
 *
 * ⚠ `border-y` đặt trên `<section>` sẽ trải hết chiều rộng viewport (0 → 100vw), dài hơn
 * mép nội dung và lệch với mọi section khác. Nền tràn full-width thì được, nhưng đường kẻ
 * phải khớp mép container → tách `bg-*` (trên section) khỏi `border-y` (trong Container).
 */
export function SolutionBlock({ title, content }: ContentBlockProps) {
  return (
    <section className="bg-background-alt py-8">
      <Container size="prose" className="border-y border-border">
        <h2 className="text-h2 font-bold">{title}</h2>
        <p className="mt-4 leading-relaxed text-text-secondary">{content}</p>
      </Container>
    </section>
  );
}