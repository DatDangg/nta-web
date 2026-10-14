import { BASE_URL as SITE_URL } from '@/lib/seo';
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
      telephone: phone.e164, email: email.display, availableLanguage: ['vi', 'en'],
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

export function createWebSiteJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'NTA',
    url: SITE_URL, inLanguage: locale === 'en' ? 'en-US' : 'vi-VN',
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

export function createContactPageJsonLd(locale: string, contact: CompanyContact) {
  return {
    '@context': 'https://schema.org', '@type': 'ContactPage',
    url: `${SITE_URL}${locale === 'en' ? '/en' : ''}/contact`,
    name: locale === 'en' ? 'Contact NTA' : 'Liên hệ NTA',
    mainEntity: { '@type': 'Organization', name: 'NTA', url: SITE_URL, ...organizationContact(contact) },
  };
}
