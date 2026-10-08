import { useId } from 'react';
import { Link } from '@/i18n/navigation';
import type { CaseStudy } from '@/content/types';

export function CaseStudyTeaser({ caseStudy, linkLabel, title }: { caseStudy: CaseStudy | null; linkLabel: string; title: string }) {
  const titleId = useId();
  if (!caseStudy) return null;

  return (
    <section aria-labelledby={titleId} className="bg-background py-12 md:py-16 xl:py-24">
      <div className="mx-auto grid w-full max-w-container gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <h2 className="text-h2 font-semibold" id={titleId}>{title}</h2>
        <div className="border-t border-border pt-5">
          <h3 className="text-h3 font-semibold">{caseStudy.title}</h3>
          <p className="mt-3 text-text-secondary">{caseStudy.solution}</p>
          <Link className="mt-4 inline-flex min-h-11 items-center text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" href={`/case-studies/${caseStudy.slug}`}>
            {linkLabel} <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
