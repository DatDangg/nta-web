import { BASE_URL as SITE_URL } from '@/lib/seo';

export function createOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'NTA',
    url: SITE_URL, logo: `${SITE_URL}/images/og-default.png`,
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

export function createContactPageJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org', '@type': 'ContactPage',
    url: `${SITE_URL}${locale === 'en' ? '/en' : ''}/contact`,
    name: locale === 'en' ? 'Contact NTA' : 'Liên hệ NTA',
  };
}
