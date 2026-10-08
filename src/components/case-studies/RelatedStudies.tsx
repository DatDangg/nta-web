import { CaseStudyCard } from '@/components/cards/CaseStudyCard';
import type { CaseStudy } from '@/content/types';

type RelatedStudiesProps = { studies: CaseStudy[]; title: string; imageAlt: (study: CaseStudy) => string; categoryLabel: (study: CaseStudy) => string };

export function RelatedStudies({ studies, title, imageAlt, categoryLabel }: RelatedStudiesProps) {
  if (studies.length === 0) return null;
  return <section className="bg-background-alt py-12 md:py-16"><div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8"><h2 className="text-h2 font-bold">{title}</h2><ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{studies.slice(0, 3).map((study) => <li key={study.slug}><CaseStudyCard caseStudy={study} categoryLabel={categoryLabel(study)} imageAlt={imageAlt(study)} /></li>)}</ul></div></section>;
}
