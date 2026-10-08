import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Locale, Post } from '@/content/types';
import { Badge } from '@/components/ui/Badge';
import { formatPostDate } from '@/lib/format/date';
import { cardImageSizes, cardImageWideClass, cardLinkClass } from './cardStyles';

interface PostCardProps {
  post: Post;
  imageAlt: string;
}

export function PostCard({ post, imageAlt }: PostCardProps) {
  const locale = useLocale() as Locale;

  return (
    <Link aria-label={post.title} className={`${cardLinkClass} p-4`} href={`/blog/${post.slug}`}>
      <Image alt={imageAlt} className={cardImageWideClass} height={540} sizes={cardImageSizes} src={post.cover} width={960} />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><Badge>{post.category}</Badge><time className="text-sm text-text-secondary" dateTime={post.date}>{formatPostDate(post.date, locale)}</time></div>
      <h3 className="mt-4 text-h3 font-semibold leading-tight">{post.title}</h3>
      <p className="mt-2 line-clamp-3 text-text-secondary">{post.excerpt}</p>
    </Link>
  );
}
