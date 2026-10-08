import { Link } from '@/i18n/navigation';
import type { CaseStudy } from '@/content/types';
import { Section } from '@/components/ui/Section';

export function CaseStudyLink({ caseStudy, linkLabel, title }: { caseStudy: CaseStudy | null; linkLabel: string; title: string }) {
  if (!caseStudy) return null;

  return (
    <Section>
      <div className="grid gap-6 border-t border-border pt-6 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-h2 font-semibold">{title}</h2>
          <p className="mt-3 text-text-secondary">{caseStudy.title}</p>
        </div>
        <Link className="inline-flex min-h-11 items-center text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" href={`/case-studies/${caseStudy.slug}`}>
          {linkLabel} <span aria-hidden="true" className="ml-2">→</span>
        </Link>
      </div>
    </Section>
  );
}
