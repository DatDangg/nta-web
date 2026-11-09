import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSolutionsMenu } from '@/lib/content/solutions-menu';
import { getCompanyContact } from '@/lib/contact/company-contact';
import { createOrganizationJsonLd, createWebSiteJsonLd } from '@/lib/seo/jsonld';
import { BASE_URL, OG_LOCALE } from '@/lib/seo';
import { isLocale } from '@/lib/content/slug';
import type { Locale } from '@/content/types';
import { Inter } from 'next/font/google';
import { MotionRoot } from '@/components/motion/MotionRoot';
import { ScrollTopButton } from '@/components/motion/ScrollTopButton';
import { AUTO_MOTION_CSS } from '@/lib/motion/auto-motion';

// Failsafe: nếu sau 4s `MotionRoot` vẫn chưa chạy (JS lỗi/chặn) → `motion-off` để không có
// nội dung nào bị auto-motion giữ ở trạng thái ẩn.
const JS_FLAG_SCRIPT = "document.documentElement.classList.add('js');setTimeout(function(){var h=document.documentElement;if(!h.classList.contains('motion-ready'))h.classList.add('motion-off')},4000)";

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

// Title mặc định theo locale (trang không tự đặt title — vd 404 sau khi load). Map tĩnh, KHÔNG gọi next-intl ở metadata (CR-026/CR-032).
const DEFAULT_TITLE: Record<Locale, string> = {
  vi: 'NTA | Giải pháp công nghệ doanh nghiệp',
  en: 'NTA | Enterprise technology solutions',
  ja: 'NTA | 企業向けテクノロジーソリューション',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = isLocale(requested) ? requested : routing.defaultLocale;
  return {
    metadataBase: new URL(BASE_URL),
    title: DEFAULT_TITLE[locale],
    openGraph: {
      type: 'website', siteName: 'NTA', locale: OG_LOCALE[locale],
      images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: ['/images/og-default.png'] },
  };
}

// Trả [] → không prerender trang nào lúc build (build image không truy cập DB); trang render lần đầu theo yêu cầu.
// /en/... vào full route cache (ISR on-demand); trang vi (middleware rewrite as-needed) render mỗi request trên data cache
// có tag — Next 15.5 không cache ISR on-demand cho URL bị rewrite (decisions.md CR-031 P3-T02). Locale lạ vẫn 404 nhờ hasLocale.
export function generateStaticParams() {
  return [];
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
  const contact = await getCompanyContact(locale);
  const common = await getTranslations({ locale, namespace: 'common' });

  return (
    // `suppressHydrationWarning`: script dưới đây thêm class `js` vào <html> TRƯỚC khi
// React hydrate, nên client thấy <html class="js"> trong khi server render không có →
// mismatch ("some attributes of the server rendered HTML didn't match"). Class `js` chỉ
// dùng cho hiệu ứng reveal (globals.css: `html.js .reveal:not(.revealed)`), không ảnh hưởng nội dung.
<html className={inter.variable} lang={locale} suppressHydrationWarning>
      <body>
        {/* Font Nhật self-host (tools/fonts/build-noto-jp.mjs): CHỈ trang ja link CSS này — next/font sẽ đưa ~95KB @font-face JP
            vào CSS chung render-blocking của mọi trang vi/en. File định nghĩa --font-noto-jp (globals.css --font-sans). */}
        {/* eslint-disable-next-line @next/next/no-css-tags -- cố ý: CSS font chỉ cho ja, không đi qua bundle CSS chung */}
        {locale === 'ja' && <link href="/fonts/noto-sans-jp/noto-sans-jp.css" precedence="default" rel="stylesheet" />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          createOrganizationJsonLd(contact), createWebSiteJsonLd(locale),
        ]).replace(/</g, '\\u003c') }} />
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG_SCRIPT }} />
        <style dangerouslySetInnerHTML={{ __html: AUTO_MOTION_CSS }} />
        <NextIntlClientProvider messages={messages}>
          <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-modal focus:rounded-full focus:bg-background focus:px-4 focus:py-3 focus:text-primary" href="#main">
            {common('skipToContent')}
          </a>
          <Header solutionGroups={await getSolutionsMenu(locale)} />
          <main id="main" tabIndex={-1}>{children}</main>
          <Footer contact={contact} />
          <ScrollTopButton />
          <MotionRoot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
