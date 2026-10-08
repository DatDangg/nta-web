'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { CaseStudy } from '@/content/types';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { CaseStudyCard } from '@/components/cards/CaseStudyCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar, type ContentFilter } from '@/components/ui/FilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';

type CaseStudyFilterProps = { studies: CaseStudy[] };
const pageSize = 9;

function validFilter(value: string | null): ContentFilter {
  return value === 'enterprise' || value === 'ai' || value === 'app-ai' ? value : 'all';
}

export function CaseStudyFilter({ studies }: CaseStudyFilterProps) {
  const t = useTranslations('caseStudies');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = validFilter(searchParams.get('filter'));
  const filtered = useMemo(() => filter === 'all' ? studies : studies.filter((study) => study.category === filter), [filter, studies]);
  const requestedPage = Number(searchParams.get('page'));
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, Math.max(1, Math.ceil(filtered.length / pageSize))) : 1;
  const pageStudies = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function changeFilter(nextFilter: ContentFilter) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (nextFilter === 'all') params.delete('filter');
    else params.set('filter', nextFilter);
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }

  function clearFilter() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('filter');
    params.delete('page');
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }

  return <div><FilterBar onChange={changeFilter} resultCount={filtered.length} value={filter} /><div className="mt-8">{filtered.length === 0 ? <EmptyState announce={false} action={<Button onClick={clearFilter} variant="secondary">{t('clearFilter')}</Button>} message={t('emptyMessage')} /> : <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{pageStudies.map((study) => <li key={study.slug}><CaseStudyCard caseStudy={study} categoryLabel={t(`categories.${study.category}`)} imageAlt={t('imageAlt', { title: study.title })} /></li>)}</ul>}</div><div className="mt-10"><Pagination currentPage={currentPage} totalPages={Math.ceil(filtered.length / pageSize)} /></div></div>;
}
