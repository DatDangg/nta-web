import type { Locale } from '@/content/types';

// Dữ liệu registry slug chế độ CONTENT_SOURCE=file (và nguồn seed tools/db). Web đọc qua getRegistrySlugs (registry.ts), không import thẳng.
export const enterpriseSlugs = ['crm', 'hrm', 'lms', 'dentgo'] as const;
export const aiSlugs = ['boxai', 'flycam', 'custom-ai', 'fridayai', 'ai-operations-brain'] as const;
export const productSlugs = ['music-app', 'hair-style-ai'] as const;

export function isLocale(value: string): value is Locale {
  return value === 'vi' || value === 'en';
}
