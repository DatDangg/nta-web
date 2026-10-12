import type { Locale } from '@/content/types';

const englishDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/**
 * Single source of truth for blog post date display (R-09, list + detail).
 * VI → "08 Th10, 2026" (built by hand: Intl vi-VN prints "thg"), EN → "Oct 8, 2026".
 * Reads the ISO `YYYY-MM-DD` parts directly so the shown day never shifts with the server/browser timezone.
 */
export function formatPostDate(isoDate: string, locale: Locale): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  if (locale === 'vi') return `${String(day).padStart(2, '0')} Th${month}, ${year}`;
  return englishDateFormat.format(new Date(Date.UTC(year, month - 1, day)));
}
