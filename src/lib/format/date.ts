import type { Locale } from '@/content/types';

const localeTag: Record<Locale, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

const dateOptions: Record<Locale, Intl.DateTimeFormatOptions> = {
  vi: { day: '2-digit', month: '2-digit', year: 'numeric' },
  en: { month: 'short', day: 'numeric', year: 'numeric' },
};

/**
 * Single source of truth for blog post date display (design S11).
 * VI → "08/10/2026", EN → "Oct 8, 2026".
 */
export function formatPostDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag[locale], dateOptions[locale]).format(new Date(isoDate));
}
