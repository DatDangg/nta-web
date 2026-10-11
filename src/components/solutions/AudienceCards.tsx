import { Container } from '@/components/ui/Container';

export type AudienceCard = { title: string; description: string };

type AudienceCardsProps = { cards: AudienceCard[] };

/**
 * 3 thẻ "Dành cho ai" (spec §5.4).
 *
 * Dùng `border-t-2 border-primary` — đường kẻ trên chứ không phải khối hộp bo góc.
 * Thẻ **tĩnh**: không hover/lift. Nếu sau này thêm hover thì mọi thẻ phải giống nhau.
 * Padding dọc do `<Section>` bên ngoài lo, component KHÔNG tự thêm `py-*` (tránh cộng dồn).
 */
export function AudienceCards({ cards }: AudienceCardsProps) {
  return (
    <Container>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div className="border-t-2 border-primary pt-5" key={card.title}>
            <h3 className="text-h3 font-semibold">{card.title}</h3>
            <p className="mt-2 text-body text-text-secondary">{card.description}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}