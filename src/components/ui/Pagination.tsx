'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages]);
  for (let page = Math.max(1, currentPage - 1); page <= Math.min(totalPages, currentPage + 1); page += 1) {
    pages.add(page);
  }
  return Array.from(pages).sort((left, right) => left - right);
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const t = useTranslations('interactive.pagination');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (totalPages < 2) return null;
  const visiblePages = getVisiblePages(currentPage, totalPages);

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav aria-label={t('label')} className="flex w-full flex-wrap items-center justify-center gap-1 sm:gap-2">
      <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} aria-label={t('previous')} className="min-h-11 min-w-11 rounded-full border border-border px-3 text-sm disabled:opacity-50">‹</button>
      {visiblePages.map((page, index) => (
        <span key={page} className="contents">
          {index > 0 && visiblePages[index - 1] < page - 1 && <span aria-hidden="true" className="px-1">…</span>}
          <button type="button" onClick={() => goToPage(page)} aria-current={page === currentPage ? 'page' : undefined} aria-label={t('page', { page })} className="min-h-11 min-w-11 rounded-full px-3 text-sm aria-[current=page]:bg-primary aria-[current=page]:text-text-inverse">{page}</button>
        </span>
      ))}
      <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages} aria-label={t('next')} className="min-h-11 min-w-11 rounded-full border border-border px-3 text-sm disabled:opacity-50">›</button>
    </nav>
  );
}
