import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { createOrganizationJsonLd, createWebSiteJsonLd } from '@/lib/seo/jsonld';
import { BASE_URL } from '@/lib/seo';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(BASE_URL),
    title: 'NTA | Giải pháp công nghệ doanh nghiệp',
    openGraph: {
      type: 'website', siteName: 'NTA', locale: locale === 'en' ? 'en_US' : 'vi_VN',
      images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: ['/images/og-default.png'] },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    // `suppressHydrationWarning`: script dưới đây thêm class `js` vào <html> TRƯỚC khi
// React hydrate, nên client thấy <html class="js"> trong khi server render không có →
// mismatch ("some attributes of the server rendered HTML didn't match"). Class `js` chỉ
// dùng cho hiệu ứng reveal (globals.css: `html.js .reveal:not(.revealed)`), không ảnh hưởng nội dung.
<html className={inter.variable} lang={locale} suppressHydrationWarning>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          createOrganizationJsonLd(), createWebSiteJsonLd(locale),
        ]).replace(/</g, '\\u003c') }} />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <NextIntlClientProvider messages={messages}>
          <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-modal focus:rounded-full focus:bg-background focus:px-4 focus:py-3 focus:text-primary" href="#main">
            {locale === 'vi' ? 'Bỏ qua tới nội dung' : 'Skip to content'}
          </a>
          <Header />
          <main id="main" tabIndex={-1}>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
