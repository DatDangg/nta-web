import type { SectionVariant } from '@/components/ui/Section';
import { Section } from '@/components/ui/Section';

export type AudienceCard = { title: string; description: string };

type AudienceCardsProps = { title: string; cards: AudienceCard[] };

/**
 * 3 thẻ "Dành cho ai" (spec §5.4).
 *
 * Dùng `border-t-2 border-primary` — đường kẻ trên chứ không phải khối hộp bo góc.
 * Thẻ **tĩnh**: không hover/lift. Nếu sau này thêm hover thì mọi thẻ phải giống nhau.
 * Padding dọc do `<Section>` bên trong lo, component KHÔNG tự thêm `py-*` (tránh cộng dồn).
 *
 * ⚠ Component **tự gọi `<Section>`** — KHÔNG bọc thêm `<Section>`/`<Container>` ở ngoài.
 */
export function AudienceCards({
  title,
  cards,
  variant = 'default',
}: AudienceCardsProps & { variant?: SectionVariant }) {
  return (
    <Section variant={variant}>
      <h2 className="text-h2 font-bold">{title}</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div className="border-t-2 border-primary pt-5" key={card.title}>
            <h3 className="text-h3 font-semibold">{card.title}</h3>
            <p className="mt-2 text-body text-text-secondary">{card.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}