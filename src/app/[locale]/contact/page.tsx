import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactInfo } from '@/components/contact/ContactInfo';
import { MapEmbed } from '@/components/contact/MapEmbed';
import { OfficeHours } from '@/components/contact/OfficeHours';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Locale } from '@/content/types';
import { createBreadcrumbJsonLd, createContactPageJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

const metadataByLocale: Record<Locale, { title: string; description: string }> = {
  vi: { title: 'Liên hệ | NTA', description: 'Liên hệ NTA để trao đổi về nhu cầu số hóa của doanh nghiệp. Đội ngũ NTA sẽ tư vấn giải pháp phù hợp nhất và phản hồi nhanh trong vòng 1-2 ngày làm việc.' },
  en: { title: 'Contact | NTA', description: 'Contact NTA to discuss the digital needs and goals of your organization. Our team will advise on the right solutions and reply within 1-2 business days.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  return {
    ...metadataByLocale[locale],
    alternates: { canonical: localizedPath(locale, 'contact'), ...createLocaleAlternates('contact') },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  return <>
    <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/contact` }])} />
    <PageHeader breadcrumbs={[{ label: t('title') }]} description={t('intro')} title={t('title')} />
    <section aria-label={t('title')} className="mx-auto grid w-full max-w-container grid-cols-1 gap-12 px-4 pb-12 sm:px-6 md:grid-cols-2 md:pb-16 lg:grid-cols-[3fr_2fr] lg:px-8 xl:pb-24">
      <ContactForm />
      <aside className="grid content-start gap-10 lg:col-start-2 lg:row-start-1">
        <ContactInfo />
        <OfficeHours />
      </aside>
      <div className="w-full md:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-2"><MapEmbed /></div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createContactPageJsonLd(locale)).replace(/</g, '\\u003c') }} />
  </>;
}
