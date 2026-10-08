import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArticleHeader } from '@/components/blog/ArticleHeader';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ShareBar } from '@/components/blog/ShareBar';
import { CTABanner } from '@/components/shared/CTABanner';
import { mdxComponents } from '@/components/mdx';
import type { Locale } from '@/content/types';
import { getAllPosts, getPostBySlug } from '@/lib/content/posts';
import { RenderMdx } from '@/lib/content/render-mdx';
import { JsonLd } from '@/components/seo/JsonLd';
import { createArticleJsonLd, createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath, BASE_URL } from '@/lib/seo';

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (params.locale !== 'vi' && params.locale !== 'en') return [];
  return (await getAllPosts(params.locale as Locale)).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  const post = await getPostBySlug(locale, slug);
  if (!post) notFound();
  return {
    title: `${post.title} | NTA`,
    description: post.excerpt,
    alternates: { canonical: localizedPath(locale, `blog/${slug}`), ...createLocaleAlternates(`blog/${slug}`) },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const [post, posts, t] = await Promise.all([getPostBySlug(locale, slug), getAllPosts(locale), getTranslations('blog')]);
  if (!post) notFound();
  const related = posts.filter((candidate) => candidate.slug !== post.slug && candidate.category === post.category).slice(0, 3);
  const author = 'author' in post && typeof post.author === 'string' ? { name: post.author } : undefined;
  const structuredData = { ...createArticleJsonLd({ title: post.title, url: localizedPath(locale, `blog/${slug}`), date: post.date, image: `${BASE_URL}/images/og-default.png` }), ...(author ? { author: { '@type': 'Person', name: author.name } } : {}) };

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: locale === 'en' ? 'Blog' : 'Blog', path: `${locale === 'en' ? '/en' : ''}/blog` }, { name: post.title, path: `${locale === 'en' ? '/en' : ''}/blog/${slug}` }])} />
      <article>
        <ArticleHeader locale={locale} post={post} />
        <div className="mx-auto max-w-[720px] px-4">
          <div className="prose prose-base max-w-none text-text-primary prose-headings:text-text-primary prose-a:text-primary prose-img:rounded-md prose-li:marker:text-text-secondary">
            <RenderMdx components={mdxComponents} source={post.body} />
          </div>
        </div>
        <div className="my-10"><ShareBar pageUrl={localizedPath(locale, `blog/${slug}`)} /></div>
      </article>
      <RelatedPosts posts={related} />
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="alt" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    </>
  );
}
