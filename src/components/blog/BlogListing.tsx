'use client';

import { Suspense, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import type { BlogCategory, Post } from '@/content/types';
import { Pagination } from '@/components/ui/Pagination';
import { BLOG_CATEGORIES } from '@/lib/blog/categories';
import {
  BLOG_FEATURED_COUNT,
  type BlogListingParams,
  buildBlogQueryString,
  DEFAULT_BLOG_PARAMS,
  filterPosts,
  isFilterActive,
  paginate,
  parseBlogParams,
} from '@/lib/blog/filter';
import { BlogPostCard } from './BlogPostCard';
import { FeaturedPosts } from './FeaturedPosts';

const SEARCH_DEBOUNCE_MS = 300;

interface BlogListingProps {
  posts: Post[];
}

/**
 * Phần dưới hero trang `/blog` (R-09a §2–4): thanh lọc chip + tìm kiếm (trạng thái trên URL),
 * khối nổi bật, lưới "Bài viết mới nhất" / kết quả lọc + phân trang. Lọc tại client — ít bài, đã render sẵn.
 * Prerender (chưa có search params) dùng trạng thái mặc định để HTML tĩnh đã có nội dung.
 */
export function BlogListing({ posts }: BlogListingProps) {
  return (
    <Suspense fallback={<BlogListingContent params={DEFAULT_BLOG_PARAMS} posts={posts} withPagination={false} />}>
      <BlogListingFromUrl posts={posts} />
    </Suspense>
  );
}

function BlogListingFromUrl({ posts }: BlogListingProps) {
  const searchParams = useSearchParams();
  const params = useMemo(() => parseBlogParams(searchParams), [searchParams]);
  return <BlogListingContent params={params} posts={posts} withPagination />;
}

interface BlogListingContentProps extends BlogListingProps {
  params: BlogListingParams;
  /** `Pagination` đọc `useSearchParams` — chỉ render trong nhánh đã có URL (không ở fallback prerender). */
  withPagination: boolean;
}

function BlogListingContent({ posts, params, withPagination }: BlogListingContentProps) {
  const t = useTranslations('blog');
  const searchId = useId();
  const latestHeadingRef = useRef<HTMLHeadingElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [draftQuery, setDraftQuery] = useState(params.query);
  // Trạng thái component vừa ghi lên URL — phân biệt với URL đổi từ ngoài (back/forward) để không ghi đè chữ đang gõ.
  // Ghi bằng `history.replaceState` (Next đồng bộ `useSearchParams`, không cần vòng server) ⇒ không có cửa sổ race
  // giữa timer tìm kiếm và click chip / xoá lọc (reviewer r1 MAJOR-1).
  const lastWritten = useRef<{ category: BlogCategory | null; query: string }>({ category: params.category, query: params.query });
  const searchTimer = useRef<number | undefined>(undefined);

  function navigate(category: BlogCategory | null, query: string) {
    window.clearTimeout(searchTimer.current);
    lastWritten.current = { category, query: query.trim() };
    window.history.replaceState(null, '', `${window.location.pathname}${buildBlogQueryString(category, query)}`);
  }

  // URL đổi từ ngoài → đồng bộ ô tìm kiếm + mốc đã ghi; URL đổi do chính component → bỏ qua (không ghi đè chữ đang gõ).
  useEffect(() => {
    const written = lastWritten.current;
    if (params.query === written.query && params.category === written.category) return;
    lastWritten.current = { category: params.category, query: params.query };
    setDraftQuery(params.query);
  }, [params.category, params.query]);

  // Tìm theo lúc gõ, chờ 300ms rồi mới ghi URL (R-09a §URL). Danh mục lấy từ mốc đã ghi gần nhất.
  useEffect(() => {
    const trimmed = draftQuery.trim();
    if (trimmed === lastWritten.current.query) return;
    searchTimer.current = window.setTimeout(() => {
      const { category } = lastWritten.current;
      lastWritten.current = { category, query: trimmed };
      window.history.replaceState(null, '', `${window.location.pathname}${buildBlogQueryString(category, trimmed)}`);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(searchTimer.current);
  }, [draftQuery]);

  const filtering = isFilterActive(params);
  const listSource = filtering ? filterPosts(posts, params.category, params.query) : posts.slice(BLOG_FEATURED_COUNT);
  const { pageItems, page, totalPages } = paginate(listSource, params.page);
  // Dùng page đã kẹp: `?page=99` khi chỉ có 1 trang ⇒ coi như trang 1, vẫn hiện khối nổi bật.
  const showFeatured = !filtering && page === 1;

  function clearFilters() {
    setDraftQuery('');
    navigate(null, '');
  }

  function showAll() {
    const target = latestHeadingRef.current ?? toolbarRef.current;
    if (!target) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
  }

  const tabs: { id: BlogCategory | null; label: string }[] = [
    { id: null, label: t('categories.all') },
    ...BLOG_CATEGORIES.map((id) => ({ id, label: t(`categories.${id}`) })),
  ];

  return (
    <div className="flex flex-col gap-10">
      <div
        className="flex scroll-mt-28 flex-col gap-3 rounded-[24px] border border-white bg-white/80 p-2.5 shadow-[0_18px_40px_-26px_rgb(15_60_70/0.4)] backdrop-blur-md focus:outline-none lg:flex-row lg:items-center"
        ref={toolbarRef}
        tabIndex={-1}
      >
        <div aria-label={t('filterGroupLabel')} className="-mx-1 -my-1 flex min-w-0 snap-x gap-1 overflow-x-auto px-1 py-1" role="group">
          {tabs.map((tab) => {
            const active = params.category === tab.id;
            return (
              <button
                aria-pressed={active}
                className={`inline-flex min-h-11 shrink-0 snap-start items-center whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors duration-fast ${active ? 'bg-primary text-white shadow-[0_8px_18px_-8px_rgb(0_158_135/0.8)]' : 'text-text-primary hover:bg-primary-light hover:text-primary-active'}`}
                key={tab.id ?? 'all'}
                onClick={() => navigate(tab.id, draftQuery)}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="relative lg:ml-auto lg:w-[260px] lg:shrink-0">
          <label className="sr-only" htmlFor={searchId}>{t('searchLabel')}</label>
          <svg aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-text-secondary" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            className="h-11 w-full rounded-full border border-transparent bg-[#f2f6f7] pl-11 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:bg-white focus:outline-none"
            id={searchId}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder={t('searchPlaceholder')}
            type="search"
            value={draftQuery}
          />
        </div>
      </div>
      <p aria-live="polite" className="sr-only" role="status">{filtering ? t('resultCount', { count: listSource.length }) : ''}</p>

      {showFeatured && <FeaturedPosts onShowAll={showAll} posts={posts.slice(0, BLOG_FEATURED_COUNT)} />}

      {filtering && listSource.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[28px] border border-white bg-white/70 px-6 py-14 text-center">
          <p className="text-text-secondary">{t('filterEmpty')}</p>
          <button className="inline-flex min-h-11 items-center rounded-full border border-primary px-5 text-sm font-medium text-primary-active hover:bg-primary-light" onClick={clearFilters} type="button">{t('clearFilters')}</button>
        </div>
      ) : pageItems.length > 0 && (
        <section aria-labelledby="blog-latest-title">
          <h2 className="scroll-mt-28 text-[1.5rem] font-bold leading-tight tracking-[-0.01em] focus:outline-none md:text-[1.75rem]" id="blog-latest-title" ref={latestHeadingRef} tabIndex={-1}>
            {filtering ? t('resultsTitle') : t('latestTitle')}
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((post) => (
              <li className="min-w-0" key={post.slug}><BlogPostCard post={post} variant="grid" /></li>
            ))}
          </ul>
          {withPagination && totalPages > 1 && <div className="mt-10"><Pagination currentPage={page} totalPages={totalPages} /></div>}
        </section>
      )}
    </div>
  );
}
