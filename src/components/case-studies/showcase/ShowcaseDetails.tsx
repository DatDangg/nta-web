import { Container } from '@/components/ui/Container';
import type { CaseStudyShowcase } from '@/content/types';
import { CheckDot, Eyebrow } from './icons';

type Props = { details: NonNullable<CaseStudyShowcase['details']> };

/**
 * Tình huống sử dụng & kết nối (block optional của khung chung, R-08c): các thẻ danh sách
 * cùng phong cách pillar, nằm giữa Lưới tính năng và FAQ. Thiếu data → không render.
 */
export function ShowcaseDetails({ details }: Props) {
  const groups = details.groups.filter((group) => group.items.length > 0);
  if (groups.length === 0) return null;
  return (
    <section className="pb-12 md:pb-16">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{details.eyebrow}</Eyebrow>
          <h2 className="mt-4 whitespace-pre-line text-[clamp(1.75rem,1.4rem+1.3vw,2.375rem)] font-bold leading-tight text-text-primary">{details.title}</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {groups.map((group, index) => (
            <article className="rounded-2xl border border-border bg-white p-6 shadow-sm" key={`${index}-${group.title}`}>
              <h3 className="text-lg font-bold text-text-primary">{group.title}</h3>
              {group.intro && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{group.intro}</p>}
              <ul className="mt-5 space-y-3">
                {group.items.map((item, itemIndex) => (
                  <li className="flex gap-3 text-sm leading-relaxed text-text-secondary" key={`${itemIndex}-${item}`}>
                    <CheckDot />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
