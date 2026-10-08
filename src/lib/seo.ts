import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

export function createLocaleAlternates(pathname = ''): NonNullable<Metadata['alternates']> {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
  const localizedPath = normalizedPath ? `/${normalizedPath}` : '';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ntasolution.vn';
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    languages[locale] = `${baseUrl}${prefix}${localizedPath}`;
  }

  languages['x-default'] = languages[routing.defaultLocale];

  return { languages };
}
