import { BASE_URL as SITE_URL, LANGUAGE_TAG, localeHref } from '@/lib/seo';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/content/types';
import type { CompanyContact } from '@/lib/contact/company-info';

/** Thông tin liên hệ của Organization (R-10 §6) — cùng nguồn (getCompanyContact) với trang Liên hệ + Footer. */
function organizationContact({ phone, email, address }: CompanyContact) {
  return {
    telephone: phone.e164,
    email: email.display,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      addressCountry: address.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint', contactType: 'customer service',
      telephone: phone.e164, email: email.display, availableLanguage: [...routing.locales],
    },
  };
}

export function createOrganizationJsonLd(contact: CompanyContact) {
  return {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'NTA',
    url: SITE_URL, logo: `${SITE_URL}/images/brand/logo-square.png`,
    ...organizationContact(contact),
  };
}

export function createWebSiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'NTA',
    url: SITE_URL, inLanguage: LANGUAGE_TAG[locale],
  };
}

export function createBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function createArticleJsonLd(article: { title: string; url: string; date: string; image?: string }) {
  return {
    '@context': 'https://schema.org', '@type': 'Article', headline: article.title,
    mainEntityOfPage: article.url, datePublished: article.date,
    ...(article.image ? { image: article.image } : {}),
  };
}

const CONTACT_PAGE_NAME: Record<Locale, string> = { vi: 'Liên hệ NTA', en: 'Contact NTA', ja: 'NTAへのお問い合わせ' };

export function createContactPageJsonLd(locale: Locale, contact: CompanyContact) {
  return {
    '@context': 'https://schema.org', '@type': 'ContactPage',
    url: `${SITE_URL}${localeHref(locale, 'contact')}`,
    name: CONTACT_PAGE_NAME[locale],
    mainEntity: { '@type': 'Organization', name: 'NTA', url: SITE_URL, ...organizationContact(contact) },
  };
}
