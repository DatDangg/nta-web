'use client';

import { useTranslations } from 'next-intl';

export type ContentFilter = 'all' | 'enterprise' | 'ai' | 'app-ai';

type FilterBarProps = {
  value: ContentFilter;
  resultCount: number;
  onChange: (filter: ContentFilter) => void;
};

const filters: ContentFilter[] = ['all', 'enterprise', 'ai', 'app-ai'];

export function FilterBar({ value, resultCount, onChange }: FilterBarProps) {
  const t = useTranslations('interactive');

  return (
    <div>
      <div role="group" aria-label={t('filter.groupLabel')} className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 md:flex-wrap md:snap-none md:overflow-visible">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={value === filter}
            onClick={() => onChange(filter)}
            className={`min-h-11 shrink-0 snap-start rounded-full border px-4 text-sm font-medium transition-colors ${value === filter ? 'border-primary bg-primary text-text-inverse' : 'border-border bg-surface text-text-primary hover:bg-background-alt'}`}
          >
            {t(`filter.options.${filter}`)}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className="sr-only">{t('filter.resultCount', { count: resultCount })}</p>
    </div>
  );
}
