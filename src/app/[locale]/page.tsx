import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CaseStudyHighlight } from '@/components/home/CaseStudyHighlight';
import { Hero } from '@/components/home/Hero';
import { ProductStrip } from '@/components/home/ProductStrip';
import { SolutionGridHome } from '@/components/home/SolutionGridHome';
import { CTABanner } from '@/components/shared/CTABanner';
import { ListingIcon, type ListingIconName } from '@/components/listing/icons';
import { Marquee } from '@/components/motion/Marquee';
import { getHomeContent } from '@/content/home';
import type { Locale } from '@/content/types';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

/** Icon cho từng nhãn ở dải chữ chạy — theo đúng thứ tự `items` của mỗi panel hero (vi/en dùng chung). */
const marqueeIcons: Record<'ai' | 'management' | 'apps', ListingIconName[]> = {
  ai: ['sparkles', 'gear', 'chart', 'cpu'],
  management: ['layers', 'users', 'box', 'shield'],
  apps: ['phone', 'camera', 'plug', 'smile'],
};

const homeMetadata: Record<Locale, { title: string; description: string }> = {
  vi: {
    title: 'NTA | Giải pháp Doanh nghiệp, AI và Ứng dụng AI',
    description: 'NTA cung cấp giải pháp số hóa về quản trị, AI và ứng dụng di động cho doanh nghiệp, cơ quan nhà nước, tối ưu vận hành và cải thiện trải nghiệm người dùng.',
  },
  en: {
    title: 'NTA | Enterprise, AI and App Solutions',
    description: 'NTA provides digital solutions in management, AI and mobile apps for businesses and government agencies to improve daily workflows and user experiences.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  const metadata = homeMetadata[locale];

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: { canonical: localizedPath(locale), ...createLocaleAlternates('') },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);

  const [t, home] = await Promise.all([
    getTranslations('home'),
    Promise.resolve(getHomeContent(locale)),
  ]);

  return (
    <>
      <Hero panels={home.heroPanels} />
      {/* Dải chữ chạy (running line) — tái dùng nhãn năng lực của panel hero, không thêm copy mới. */}
      <section className="border-y border-border bg-background-alt py-5 md:py-6">
        <Marquee
          className="text-base font-normal text-text-primary md:text-lg"
          items={(['ai', 'management', 'apps'] as const).flatMap((panel) =>
            home.heroPanels[panel].items.map((label, i) => {
              const icon = marqueeIcons[panel][i];
              return { label, icon: icon ? <ListingIcon className="size-6" name={icon} /> : undefined };
            }),
          )}
        />
      </section>
      <SolutionGridHome
        description={t('solutionsLead')}
        eyebrow={t('solutionsEyebrow')}
        solutions={home.solutionCards}
        titleAccent={t('solutionsTitleAccent')}
        titleLead={t('solutionsTitleLead')}
      />
      <ProductStrip products={home.featuredProducts} title={t('productsTitle')} />
      <CaseStudyHighlight study={home.featuredCase} title={t('caseStudyTitle')} />
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="primary" />
    </>
  );
}
