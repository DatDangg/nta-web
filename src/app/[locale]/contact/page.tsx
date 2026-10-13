import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ContactDetails } from '@/components/contact/ContactDetails';
import { ContactForm } from '@/components/contact/ContactForm';
import { GlassVisual } from '@/components/listing/GlassVisual';
import { ListingHero } from '@/components/listing/ListingHero';
import { Container } from '@/components/ui/Container';
import type { Locale } from '@/content/types';
import { createBreadcrumbJsonLd, createContactPageJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

const metadataByLocale: Record<Locale, { title: string; description: string }> = {
  vi: { title: 'Liên hệ | NTA', description: 'Liên hệ NTA qua hotline 0335546831, email admin@ntasolution.vn hoặc văn phòng tại tòa nhà Kim Hoàn, ngõ 19 Duy Tân, Cầu Giấy, Hà Nội. Đội ngũ NTA phản hồi trong 24h.' },
  en: { title: 'Contact | NTA', description: 'Contact NTA by phone 0335546831, email admin@ntasolution.vn or visit our office at Kim Hoan Building, Lane 19 Duy Tan, Cau Giay, Hanoi. Our team replies within 24 hours.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  return {
    ...metadataByLocale[locale],
    alternates: { canonical: localizedPath(locale, 'contact'), ...createLocaleAlternates('contact') },
  };
}

/** Trang Liên hệ (R-10, spec 3.6.0): hero nền sóng + 2 card — thông tin/bản đồ (trái) và form (phải); `< lg` xếp 1 cột. */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  return <>
    <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/contact` }])} />
    <ListingHero
      accent={t('heroAccent')}
      breadcrumbs={[{ label: t('title') }]}
      description={t('heroDescription')}
      highlights={[]}
      lead={t('heroLead')}
      title={t('heroTitle')}
      visual={<GlassVisual card={{ title: t('glassTitle'), text: t('glassText') }} tiles={[{ icon: 'chat', theme: 'teal' }, { icon: 'headset', theme: 'teal' }, { icon: 'mail', theme: 'teal' }]} />}
    >
      <Container className="pb-16 md:pb-20 xl:pb-24">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <ContactDetails />
          <section aria-labelledby="contact-form-title" className="rounded-2xl border border-border bg-surface p-5 shadow-[0_24px_60px_-32px_rgb(0_110_100/0.35)] sm:p-7">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
              <span aria-hidden="true" className="h-0.5 w-7 rounded-full bg-primary" />
              {t('form.eyebrow')}
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.01em] text-text-primary sm:text-[1.875rem]" id="contact-form-title">{t('form.title')}</h2>
            <p className="mt-2 text-text-secondary">{t('form.description')}</p>
            <div className="mt-6"><ContactForm /></div>
          </section>
        </div>
      </Container>
    </ListingHero>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createContactPageJsonLd(locale)).replace(/</g, '\\u003c') }} />
  </>;
}
