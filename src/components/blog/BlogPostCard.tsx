import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Locale, Post } from '@/content/types';
import { formatPostDate } from '@/lib/format/date';

export type BlogPostCardVariant = 'large' | 'compact' | 'grid';

interface BlogPostCardProps {
  post: Post;
  variant: BlogPostCardVariant;
}

const variantStyles: Record<BlogPostCardVariant, { image: string; sizes: string; title: string; body: string; excerpt: boolean }> = {
  large: { image: 'aspect-[16/9] xl:aspect-[2/1]', sizes: '(min-width: 1280px) 560px, 100vw', title: 'text-h3 md:text-[1.5rem]', body: 'p-5 md:p-6', excerpt: true },
  compact: { image: 'aspect-[16/9] xl:aspect-[3/1]', sizes: '(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw', title: 'text-lg', body: 'p-4 md:p-5', excerpt: false },
  grid: { image: 'aspect-[16/10]', sizes: '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw', title: 'text-lg', body: 'p-4 md:p-5', excerpt: false },
};

function MetaIcon({ kind }: { kind: 'calendar' | 'clock' }) {
  return (
    <svg aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      {kind === 'calendar'
        ? <><rect height="17" rx="2" width="18" x="3" y="4.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></>
        : <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
    </svg>
  );
}

/**
 * Thẻ bài viết trang `/blog` (R-09a): ảnh + badge danh mục đè góc ảnh, ngày, thời gian đọc, tiêu đề,
 * (tóm tắt ở biến thể `large`), "Đọc thêm →". Cả thẻ là 1 link. Không dùng `PostCard` (giữ cho RelatedPosts).
 */
export function BlogPostCard({ post, variant }: BlogPostCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('blog');
  const style = variantStyles[variant];

  return (
    <Link
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-white bg-white text-text-primary shadow-[0_18px_40px_-28px_rgb(15_60_70/0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus motion-safe:transition-[transform,box-shadow] motion-safe:duration-base motion-safe:ease-out-expo motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_24px_48px_-26px_rgb(15_60_70/0.5)]"
      href={`/blog/${post.slug}`}
    >
      <div className={`relative w-full shrink-0 overflow-hidden bg-surface-sunken ${style.image}`}>
        <Image alt={t('imageAlt', { title: post.title })} className="object-cover" fill sizes={style.sizes} src={post.cover} />
        <span className="absolute left-3 top-3 rounded-full bg-[#e6f7f3] px-3 py-1 text-xs font-semibold text-primary-active shadow-[0_4px_12px_-6px_rgb(15_60_70/0.4)]">
          {t(`categories.${post.category}`)}
        </span>
      </div>
      <div className={`flex flex-1 flex-col ${style.body}`}>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5"><MetaIcon kind="calendar" /><time dateTime={post.date}>{formatPostDate(post.date, locale)}</time></span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5"><MetaIcon kind="clock" />{t('readingTime', { minutes: post.readingMinutes })}</span>
        </p>
        <h3 className={`mt-3 font-semibold leading-snug transition-colors group-hover:text-primary-active ${style.title}`}>{post.title}</h3>
        {style.excerpt && <p className="mt-3 line-clamp-3 text-text-secondary">{post.excerpt}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary-active">
          {t('readMore')}
          <svg aria-hidden="true" className="size-4 motion-safe:transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </div>
    </Link>
  );
}
