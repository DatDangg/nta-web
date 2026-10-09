import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://landing.ntasolution.vn';

function localizedSegments(locale: string, pathname: string) {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${prefix}${normalizedPath ? `/${normalizedPath}` : ''}`;
}

export function localizedPath(locale: string, pathname = ''): string {
  return `${BASE_URL}${localizedSegments(locale, pathname)}`;
}

export function createLocaleAlternates(pathname = ''): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    languages[locale] = localizedPath(locale, pathname);
  }

  languages['x-default'] = languages[routing.defaultLocale];

  return { languages };
}
