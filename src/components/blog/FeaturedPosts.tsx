import { useTranslations } from 'next-intl';
import type { Post } from '@/content/types';
import { BlogPostCard } from './BlogPostCard';

interface FeaturedPostsProps {
  posts: Post[];
  onShowAll: () => void;
}

/** Thẻ "TIN MỚI — Cập nhật mới nhất từ NTA" (không có newsletter — ngoài phạm vi, quyết định user 2026-10-13). */
function HighlightCard({ onShowAll }: { onShowAll: () => void }) {
  const t = useTranslations('blog');
  return (
    <div className="relative isolate flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-[20px] bg-[linear-gradient(140deg,#0b7a6c_0%,#075e57_55%,#063f3d_100%)] p-6 text-white shadow-[0_24px_48px_-28px_rgb(6_63_61/0.8)] md:p-7">
      <svg aria-hidden="true" className="absolute -bottom-6 -right-10 -z-10 h-40 w-72 opacity-40" fill="none" viewBox="0 0 288 160">
        <path d="M0 140C70 120 120 60 190 70s80-40 98-70" stroke="#5eead4" strokeWidth="1.5" />
        <path d="M20 160C90 136 140 86 206 92s62-34 82-60" stroke="#99f6e4" strokeOpacity="0.6" strokeWidth="1" />
      </svg>
      <svg aria-hidden="true" className="absolute right-6 top-6 size-14 rotate-6 drop-shadow-[0_10px_18px_rgb(0_0_0/0.25)]" fill="none" viewBox="0 0 56 56">
        <rect fill="#fff" height="52" rx="8" width="42" x="7" y="2" />
        <rect fill="#0b9f8a" height="6" rx="3" width="28" x="14" y="12" />
        <rect fill="#2dd4bf" height="4" rx="2" width="28" x="14" y="24" />
        <rect fill="#2dd4bf" height="4" rx="2" width="22" x="14" y="32" />
        <rect fill="#2dd4bf" height="4" rx="2" width="26" x="14" y="40" />
      </svg>
      <div className="pr-16">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#99f6e4]">{t('highlightEyebrow')}</p>
        <p className="mt-3 text-[1.375rem] font-bold leading-snug">{t('highlightTitle')}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/85">{t('highlightText')}</p>
      </div>
      <button
        className="mt-6 inline-flex min-h-11 items-center gap-3 self-start rounded-full text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        onClick={onShowAll}
        type="button"
      >
        <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-white text-[#075e57] motion-safe:transition-transform hover:translate-x-0.5">
          <svg className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
        {t('viewAll')}
      </button>
    </div>
  );
}

/**
 * Khối nổi bật (R-09a §3, chỉ khi không lọc/tìm, trang 1): bài mới nhất dạng lớn, ≤2 bài nhỏ, thẻ TIN MỚI.
 * xl: 3 cột · md–lg: bài lớn + thẻ TIN MỚI full-width, 2 bài nhỏ 2 cột · base: 1 cột.
 */
export function FeaturedPosts({ posts, onShowAll }: FeaturedPostsProps) {
  const t = useTranslations('blog');
  const [lead, ...others] = posts;
  if (!lead) return null;

  return (
    <section aria-label={t('featuredLabel')} className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1.38fr)_minmax(0,1fr)_minmax(0,0.86fr)]">
      <div className="min-w-0 md:col-span-2 xl:col-span-1">
        <BlogPostCard post={lead} variant="large" />
      </div>
      {others.length > 0 && (
        <ul className="grid min-w-0 grid-cols-1 gap-6 md:col-span-2 md:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
          {others.map((post) => (
            <li className="min-w-0" key={post.slug}><BlogPostCard post={post} variant="compact" /></li>
          ))}
        </ul>
      )}
      <div className={`min-w-0 md:col-span-2 xl:col-span-1 ${others.length === 0 ? 'xl:col-start-3' : ''}`}>
        <HighlightCard onShowAll={onShowAll} />
      </div>
    </section>
  );
}
