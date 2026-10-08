import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { BlogFilter } from '@/components/blog/BlogFilter';
import { PostCard } from '@/components/cards/PostCard';
import { getAllPosts } from '@/lib/content/posts';
import type { Locale } from '@/content/types';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  const t = await getTranslations({ locale, namespace: 'blog' });
  return {
    title: `${t('title')} | NTA`,
    description: t('metadataDescription'),
    alternates: { canonical: localizedPath(locale, 'blog'), ...createLocaleAlternates('blog') },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const [t, posts] = await Promise.all([getTranslations('blog'), getAllPosts(locale as Locale)]);
  const firstPagePosts = posts.slice(0, 9);
  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/blog` }])} />
      <PageHeader breadcrumbs={[{ label: t('title') }]} description={t('intro')} title={t('title')} variant="centered" />
      <section aria-labelledby="blog-list-title" className="bg-background-alt py-12 md:py-16 xl:py-24">
        <h2 className="sr-only" id="blog-list-title">{t('title')}</h2>
        {posts.length === 0 ? (
          <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
            <EmptyState message={t('empty')} action={<Link className="mt-4 inline-flex min-h-11 items-center text-primary underline underline-offset-4" href="/">{t('home')}</Link>} />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{firstPagePosts.map((post) => <li key={post.slug}><PostCard imageAlt={t('imageAlt', { title: post.title })} post={post} /></li>)}</ul>}>
              <BlogFilter imageAltTemplate={t('imageAlt', { title: '{title}' })} posts={posts} />
            </Suspense>
          </div>
        )}
      </section>
    </>
  );
}
