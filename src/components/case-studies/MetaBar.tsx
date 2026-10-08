import type { CaseStudy } from '@/content/types';

type MetaBarProps = { caseStudy: CaseStudy; labels: { client: string; sector: string; year: string } };

export function MetaBar({ caseStudy, labels }: MetaBarProps) {
  return (
    <dl className="grid grid-cols-1 gap-4 border-y border-border py-6 sm:grid-cols-3 md:flex md:flex-wrap md:gap-8">
      {[{ label: labels.client, value: caseStudy.client }, { label: labels.sector, value: caseStudy.sector }, { label: labels.year, value: String(caseStudy.year) }].filter((item) => item.value).map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-sm text-text-secondary">{item.label}</dt>
          <dd className="mt-1 font-medium text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
