import { getTranslations } from 'next-intl/server';
import type { Locale, Post } from '@/content/types';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export async function ArticleHeader({ post, locale }: { post: Post; locale: Locale }) {
  const t = await getTranslations('blog');
  const date = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', locale === 'vi' ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(post.date));
  return (
    <header className="mx-auto w-full max-w-container px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <Breadcrumb items={[{ label: t('title'), href: '/blog' }, { label: post.title }]} />
      <div className="mx-auto mt-8 max-w-[720px]">
        <Badge>{post.category}</Badge>
        <h1 className="mt-5 text-display font-bold leading-tight">{post.title}</h1>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
          <time dateTime={post.date}>{date}</time>
          {'author' in post && typeof post.author === 'string' && <span>{post.author}</span>}
        </div>
      </div>
    </header>
  );
}
