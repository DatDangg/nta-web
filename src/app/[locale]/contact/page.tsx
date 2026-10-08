import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactInfo } from '@/components/contact/ContactInfo';
import { MapEmbed } from '@/components/contact/MapEmbed';
import { OfficeHours } from '@/components/contact/OfficeHours';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Locale } from '@/content/types';

const metadataByLocale: Record<Locale, { title: string; description: string }> = {
  vi: { title: 'Liên hệ | NTA', description: 'Liên hệ NTA để trao đổi về nhu cầu số hóa. Đội ngũ NTA sẽ phản hồi trong 1-2 ngày làm việc.' },
  en: { title: 'Contact | NTA', description: 'Contact NTA to discuss your digital needs. Our team will reply within 1-2 business days.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  const origin = 'https://ntasolution.vn';
  const canonical = locale === 'vi' ? `${origin}/contact` : `${origin}/en/contact`;
  return {
    ...metadataByLocale[locale],
    alternates: { canonical, languages: { vi: `${origin}/contact`, en: `${origin}/en/contact`, 'x-default': `${origin}/contact` } },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  return <>
    <PageHeader breadcrumbs={[{ label: t('title') }]} description={t('intro')} title={t('title')} />
    <section aria-label={t('title')} className="mx-auto grid w-full max-w-container grid-cols-1 gap-12 px-4 pb-12 sm:px-6 md:grid-cols-2 md:pb-16 lg:grid-cols-[3fr_2fr] lg:px-8 xl:pb-24">
      <ContactForm />
      <aside className="grid content-start gap-10">
        <ContactInfo />
        <OfficeHours />
        <MapEmbed />
      </aside>
    </section>
  </>;
}
