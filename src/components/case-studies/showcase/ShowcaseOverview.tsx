import { CountUp } from '@/components/motion/CountUp';
import { Container } from '@/components/ui/Container';
import type { CaseStudyShowcase } from '@/content/types';
import { CheckDot, ShowcaseIconBadge } from './icons';

type Props = { stats: CaseStudyShowcase['stats']; pillars: CaseStudyShowcase['pillars'] };

/** Thẻ 3 số liệu + 3 cột Thách thức / Giải pháp đề xuất / Kết quả kỳ vọng. */
export function ShowcaseOverview({ stats, pillars }: Props) {
  return (
    <section className="pb-10 md:pb-12">
      <Container>
        <dl className="grid divide-y divide-border rounded-2xl border border-border bg-white px-6 shadow-md sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-0">
          {stats.map((stat) => (
            <div className="flex items-center gap-4 py-6 sm:justify-center sm:px-6" key={stat.label}>
              <ShowcaseIconBadge icon={stat.icon} size="lg" />
              <div className="min-w-0">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-bold tracking-tight text-text-primary"><CountUp value={stat.value} /></dd>
                <dd aria-hidden="true" className="mt-1 text-sm leading-snug text-text-secondary">{stat.label}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article className="rounded-2xl border border-border bg-white p-6 shadow-sm" key={pillar.title}>
              <div className="flex items-center gap-4">
                <ShowcaseIconBadge icon={pillar.icon} />
                <h2 className="text-lg font-bold text-text-primary">{pillar.title}</h2>
              </div>
              <ul className="mt-5 space-y-3">
                {pillar.items.map((item) => (
                  <li className="flex gap-3 text-sm leading-relaxed text-text-secondary" key={item}>
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
