import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/content/types';
import { localeHref } from '@/lib/seo';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';

/**
 * BreadcrumbList cho trang theo locale: tự thêm mục "Trang chủ" (nhãn `nav.home` của locale) và prefix locale vào path.
 * `items[].path` là path KHÔNG prefix (vd `/about`) — 1 chỗ suy prefix thay vì rải `locale === 'en' ? '/en' : ''` ở từng page (CR-044).
 */
export async function createLocaleBreadcrumbJsonLd(locale: Locale, items: Array<{ name: string; path: string }>) {
  const nav = await getTranslations({ locale, namespace: 'nav' });
  return createBreadcrumbJsonLd([
    { name: nav('home'), path: localeHref(locale) },
    ...items.map((item) => ({ name: item.name, path: localeHref(locale, item.path) })),
  ]);
}
