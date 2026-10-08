import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AppCard } from '@/components/cards/AppCard';
import { DownloadLinks } from '@/components/products/DownloadLinks';
import { ScreenshotCarousel } from '@/components/products/ScreenshotCarousel';
import { CTABanner } from '@/components/shared/CTABanner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import type { Locale, Product } from '@/content/types';
import { getAllProducts } from '@/lib/content/products';

const productSlugs = ['music-app', 'hair-style-ai'];
const pageMetadata: Record<Locale, Metadata> = {
  vi: { title: 'Sản phẩm App | NTA', description: 'Khám phá các ứng dụng di động do NTA phát triển, từ trải nghiệm âm nhạc hỗ trợ bởi AI đến thử kiểu tóc với AI.' },
  en: { title: 'Apps | NTA', description: 'Explore NTA mobile apps, from AI-assisted music experiences to trying different hairstyles with AI.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  return {
    ...pageMetadata[locale],
    alternates: { languages: { vi: 'https://ntasolution.vn/products', en: 'https://ntasolution.vn/en/products', 'x-default': 'https://ntasolution.vn/products' } },
  };
}

function orderProducts(products: Product[]) {
  return productSlugs.flatMap((slug) => {
    const product = products.find((item) => item.slug === slug);
    return product ? [product] : [];
  });
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const [t, products] = await Promise.all([getTranslations('products'), getAllProducts(locale)]);

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t('title') }]} description={t('intro')} title={t('title')} variant="centered" />
      <section aria-label={t('title')} className="bg-background-alt py-12 md:py-16 xl:py-24">
        <div className="mx-auto grid w-full max-w-container grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {orderProducts(products).map((product) => (
            <Reveal key={product.slug}>
              <AppCard
                imageAlt={t('screenshotAlt', { title: product.title })}
                media={(
                  <ScreenshotCarousel
                    ariaRoleDescription={t('carouselRoleDescription')}
                    imageAlt={t('screenshotAlt', { title: product.title })}
                    nextLabel={t('nextScreenshot')}
                    previousLabel={t('previousScreenshot')}
                    screenshots={product.screenshots}
                    title={product.title}
                  />
                )}
                downloadLinks={<DownloadLinks comingSoonLabel={t('comingSoon')} downloadLabel={t('download')} product={product} />}
                product={product}
              />
            </Reveal>
          ))}
        </div>
      </section>
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="alt" />
    </>
  );
}
