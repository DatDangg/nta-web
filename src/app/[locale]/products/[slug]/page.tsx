import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ShowcaseLayout } from '@/components/case-studies/showcase/ShowcaseLayout';
import { getProductBySlug } from '@/lib/content/products';
import { getProductStaticParams, isLocale } from '@/lib/content/slug';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';
import { detailTiles } from '@/content/listings';

export function generateStaticParams() {
  return getProductStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = await getProductBySlug(locale, slug);
  if (!product) notFound();
  const path = `/products/${product.slug}`;
  const name = product.brandName ?? product.title;
  return {
    title: locale === 'vi' ? `Ứng dụng ${name} | NTA` : `${name} App | NTA`,
    description: product.description,
    alternates: { canonical: localizedPath(locale, path), ...createLocaleAlternates(path) },
  };
}

/**
 * Trang chi tiết sản phẩm app — khung chi tiết dùng chung (`ShowcaseLayout`, R-08c).
 * Toàn bộ nội dung nằm trong block `showcase` của frontmatter MDX; thiếu block → loader báo lỗi lúc build.
 */
export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const [t, product] = await Promise.all([getTranslations('products'), getProductBySlug(locale, slug)]);
  if (!product) notFound();
  const name = product.brandName ?? product.title;
  const base = locale === 'en' ? '/en' : '';

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${base}/products` }, { name, path: `${base}/products/${product.slug}` }])} />
      <ShowcaseLayout breadcrumbs={[{ label: t('title'), href: '/products' }, { label: name }]} showcase={product.showcase} tiles={detailTiles(locale, product.slug)} />
    </>
  );
}
