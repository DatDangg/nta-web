import { getTranslations } from 'next-intl/server';
import type { Post } from '@/content/types';
import { PostCard } from '@/components/cards/PostCard';

export async function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  const t = await getTranslations('blog');
  return (
    <section aria-labelledby="related-posts-title" className="mx-auto w-full max-w-container px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <h2 className="mb-6 text-h2 font-bold" id="related-posts-title">{t('related')}</h2>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => <li key={post.slug}><PostCard imageAlt={t('imageAlt', { title: post.title })} post={post} /></li>)}
      </ul>
    </section>
  );
}
