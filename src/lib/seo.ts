import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

// ntavietnam.tech là canonical cho cả ntasolution.vn (quyết định 13/10/2026).
export const CANONICAL_SITE_URL = 'https://ntavietnam.tech';

// `||` thay vì `??`: Docker ENV từ build-arg không truyền là "" chứ không phải undefined,
// và `new URL("")` (metadataBase ở [locale]/layout) làm hỏng prerender.
export function resolveSiteUrl(raw: string | undefined): string {
  return raw?.trim() || CANONICAL_SITE_URL;
}

// Giữ nguyên `process.env.NEXT_PUBLIC_SITE_URL` dạng literal để Next.js inline lúc build.
export const BASE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

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
