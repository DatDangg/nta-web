'use client';

import { type CSSProperties, useId, useMemo, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { ListingIcon } from './icons';
import { ListingCard, ListingCtaCard } from './ListingCard';
import type { ListingCategory, ListingCta, ListingItem, ListingLabels } from './types';

interface ListingExplorerProps {
  items: ListingItem[];
  categories: ListingCategory[];
  labels: ListingLabels;
  cta?: ListingCta;
  /**
   * `3` — 2 thẻ lớn + thẻ CTA hẹp trên 1 hàng (ảnh mẫu, trang sản phẩm / case study).
   * `2` — lưới 2 cột (trang giải pháp, ảnh giao diện ngang); CTA tràn 2 cột khi số thẻ chẵn.
   */
  columns?: 2 | 3;
  ariaLabel: string;
}

/** Bỏ dấu tiếng Việt để tìm "kieu toc" vẫn ra "Kiểu tóc". */
function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

const delay = (index: number) => ({ '--d': `${index * 90}ms` }) as CSSProperties;

/**
 * Thanh lọc (tab có icon + ô tìm kiếm) và lưới thẻ của trang danh sách. Lọc tại client —
 * danh sách ngắn, dữ liệu đã render sẵn từ server. Chỉ hiện tab có ít nhất 1 mục.
 */
export function ListingExplorer({ items, categories, labels, cta, columns = 3, ariaLabel }: ListingExplorerProps) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const searchId = useId();

  const tabs = useMemo(
    () => [{ id: 'all', label: labels.all, icon: 'grid' as const }, ...categories.filter((cat) => items.some((item) => item.categories.includes(cat.id)))],
    [categories, items, labels.all],
  );

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return items.filter((item) => {
      if (category !== 'all' && !item.categories.includes(category)) return false;
      if (!needle) return true;
      const haystack = normalize([item.title, item.subtitle, item.description, item.keywords, ...item.chips].filter(Boolean).join(' '));
      return haystack.includes(needle);
    });
  }, [category, items, query]);

  function reset() {
    setCategory('all');
    setQuery('');
  }

  const gridClass = columns === 3
    ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.74fr)]'
    : 'grid grid-cols-1 gap-6 md:grid-cols-2';
  const ctaWide = columns === 2 && filtered.length % 2 === 0;
  const ctaSpan = columns === 3 ? (filtered.length % 2 === 0 ? 'md:col-span-2 lg:col-span-1' : '') : ctaWide ? 'md:col-span-2' : '';

  return (
    <section aria-label={ariaLabel} className="pb-16 md:pb-20 xl:pb-24" data-motion-off>
      <Container>
        <div className="motion-load flex flex-col gap-3 rounded-[24px] border border-white bg-white/80 p-2.5 shadow-[0_18px_40px_-26px_rgb(15_60_70/0.4)] backdrop-blur-md lg:flex-row lg:items-center" style={{ '--d': '600ms' } as CSSProperties}>
          <div aria-label={labels.groupLabel} className="-mx-1 flex snap-x gap-1 overflow-x-auto px-1 pb-0.5 lg:flex-wrap lg:overflow-visible" role="group">
            {tabs.map((tab) => {
              const active = category === tab.id;
              return (
                <button
                  aria-pressed={active}
                  className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-fast sm:px-5 ${active ? 'bg-primary text-white shadow-[0_8px_18px_-8px_rgb(0_158_135/0.8)]' : 'text-text-primary hover:bg-primary-light hover:text-primary-active'}`}
                  key={tab.id}
                  onClick={() => setCategory(tab.id)}
                  type="button"
                >
                  <ListingIcon className="size-[18px]" name={tab.icon} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="relative lg:ml-auto lg:w-[300px]">
            <label className="sr-only" htmlFor={searchId}>{labels.searchLabel}</label>
            <ListingIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-text-secondary" name="search" />
            <input
              className="h-11 w-full rounded-full border border-transparent bg-[#f2f6f7] pl-11 pr-4 text-sm text-text-primary placeholder:text-text-secondary/80 focus:border-primary focus:bg-white focus:outline-none"
              id={searchId}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              type="search"
              value={query}
            />
          </div>
        </div>
        <p aria-live="polite" className="sr-only" role="status">{labels.resultCount.replace('{count}', String(filtered.length))}</p>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-[28px] border border-white bg-white/70 px-6 py-14 text-center">
              <ListingIcon className="size-8 text-text-secondary" name="search" />
              <p className="text-text-secondary">{labels.empty}</p>
              <button className="inline-flex min-h-11 items-center rounded-full border border-primary px-5 text-sm font-medium text-primary-active hover:bg-primary-light" onClick={reset} type="button">{labels.clear}</button>
            </div>
          ) : (
            <ul className={gridClass}>
              {filtered.map((item, index) => (
                <li className="min-w-0" key={`${category}-${item.id}`}>
                  <ListingCard item={item} style={delay(index)} />
                </li>
              ))}
              {cta && (
                <li className={`min-w-0 ${ctaSpan}`} key={`${category}-cta`}>
                  <ListingCtaCard cta={cta} style={delay(filtered.length)} wide={ctaWide} />
                </li>
              )}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
