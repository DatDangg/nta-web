import { Container } from '@/components/ui/Container';
import type { CaseStudyShowcase } from '@/content/types';
import { Eyebrow } from './icons';

type Props = { faq: NonNullable<CaseStudyShowcase['faq']> };

/** FAQ optional (R-08c): accordion `<details>` gốc — không cần JS, mở/đóng bằng bàn phím. Thiếu data → không render. */
export function ShowcaseFaq({ faq }: Props) {
  if (faq.items.length === 0) return null;
  return (
    <section className="pb-12 md:pb-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div>
            <Eyebrow>{faq.eyebrow}</Eyebrow>
            <h2 className="mt-4 whitespace-pre-line text-[clamp(1.75rem,1.4rem+1.3vw,2.375rem)] font-bold leading-tight text-text-primary">{faq.title}</h2>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-white px-6 shadow-sm">
            {faq.items.map((item, index) => (
              <details className="group py-5" key={`${index}-${item.question}`}>
                <summary className="flex cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden justify-between gap-4 text-base font-semibold text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">
                  {item.question}
                  <span aria-hidden="true" className="text-xl leading-none text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-text-secondary">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
