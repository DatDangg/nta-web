import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasDownloadUrl } from '@/components/products/DownloadLinks';
import { CTABanner } from '@/components/shared/CTABanner';
import { GlassVisual } from '@/components/listing/GlassVisual';
import { ListingExplorer } from '@/components/listing/ListingExplorer';
import { ListingHero } from '@/components/listing/ListingHero';
import type { ListingItem } from '@/components/listing/types';
import { getListingCtas, getListingItems, getListingLabels, getListingPages, getRegistrySlugs } from '@/lib/content/registry';
import type { Locale, Product } from '@/content/types';
import { getAllProducts } from '@/lib/content/products';
import { JsonLd } from '@/components/seo/JsonLd';
import { isLocale } from '@/lib/content/slug';
import { createLocaleBreadcrumbJsonLd } from '@/lib/seo/breadcrumb';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

const pageMetadata: Record<Locale, Metadata> = {
  vi: { title: 'Sản phẩm App | NTA', description: 'Khám phá các ứng dụng di động do NTA phát triển, từ trải nghiệm âm nhạc hỗ trợ bởi AI đến thử kiểu tóc với AI, mang lại trải nghiệm số thực tế cho người dùng.' },
  en: { title: 'Apps | NTA', description: 'Explore NTA mobile apps, from AI-assisted music experiences to trying different hairstyles with AI, delivering practical digital experiences for everyday users.' },
  ja: { title: 'アプリ | NTA', description: 'AIを活用した音楽体験からAIヘアスタイル試着まで、NTAが開発したモバイルアプリで日常に役立つデジタル体験をお届けします。' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return {
    ...pageMetadata[locale],
    alternates: { canonical: localizedPath(locale, 'products'), ...createLocaleAlternates('products') },
  };
}

function orderProducts(products: Product[], productSlugs: readonly string[]) {
  return productSlugs.flatMap((slug) => {
    const product = products.find((item) => item.slug === slug);
    return product ? [product] : [];
  });
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const [t, products, productSlugs, listingPages, listingItems, listingCtas, listingLabels] = await Promise.all([
    getTranslations('products'), getAllProducts(locale), getRegistrySlugs('product'),
    getListingPages(locale), getListingItems(locale), getListingCtas(locale), getListingLabels(locale),
  ]);
  const copy = listingPages.products;
  const ordered = orderProducts(products, productSlugs);
  const detailTitle = t('detailTitle');
  const items: ListingItem[] = ordered.map((product) => {
    const meta = listingItems[product.slug];
    const poster = product.screenshots[0];
    return {
      id: product.slug,
      href: `/products/${product.slug}`,
      title: product.title,
      subtitle: meta?.subtitle,
      description: product.description,
      chips: meta?.chips ?? [],
      icon: meta?.icon ?? 'apps',
      theme: meta?.theme ?? 'teal',
      categories: meta?.categories ?? [],
      status: hasDownloadUrl(product) ? undefined : t('comingSoon'),
      keywords: product.features?.join(' '),
      linkLabel: `${product.title} — ${detailTitle}`,
      media: poster ? { kind: 'phone', src: poster, alt: t('screenshotAlt', { title: product.title }), width: 941, height: 1672 } : undefined,
    };
  });

  return (
    <>
      <JsonLd data={await createLocaleBreadcrumbJsonLd(locale, [{ name: t('title'), path: `/products` }])} />
      <ListingHero
        accent={copy.accent}
        breadcrumbs={copy.crumbs.map((label) => ({ label }))}
        description={copy.description}
        highlights={copy.highlights}
        lead={copy.lead}
        title={copy.title}
        visual={<GlassVisual card={copy.glassCard} tiles={copy.tiles} />}
      >
        <ListingExplorer
          ariaLabel={copy.ariaLabel}
          categories={copy.categories}
          cta={{ ...listingCtas.products, href: '/contact', icon: 'plus' }}
          items={items}
          labels={{ ...listingLabels, searchPlaceholder: copy.searchPlaceholder }}
        />
      </ListingHero>
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="alt" />
    </>
  );
}
