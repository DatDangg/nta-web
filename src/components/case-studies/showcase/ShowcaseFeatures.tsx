import { Container } from '@/components/ui/Container';
import type { CaseStudyShowcase } from '@/content/types';
import { Eyebrow, ShowcaseIconBadge } from './icons';

type Props = { features: NonNullable<CaseStudyShowcase['features']> };

/** Lưới tính năng (block optional của khung chung, R-08c): thẻ bo góc cùng phong cách pillar. Thiếu data → không render. */
export function ShowcaseFeatures({ features }: Props) {
  if (features.items.length === 0) return null;
  return (
    <section className="py-12 md:py-16" id="features">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{features.eyebrow}</Eyebrow>
          <h2 className="mt-4 whitespace-pre-line text-[clamp(1.75rem,1.4rem+1.3vw,2.375rem)] font-bold leading-tight text-text-primary">{features.title}</h2>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.items.map((item, index) => (
            <li className="rounded-2xl border border-border bg-white p-6 shadow-sm" key={`${index}-${item.title}`}>
              {item.icon && <ShowcaseIconBadge icon={item.icon} />}
              <h3 className="mt-4 text-lg font-bold text-text-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
