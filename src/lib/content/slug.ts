import type { Locale } from '@/content/types';

export const enterpriseSlugs = ['crm', 'hrm', 'lms', 'dentgo'] as const;
export const aiSlugs = ['boxai', 'flycam', 'custom-ai', 'fridayai', 'ai-operations-brain'] as const;
export const productSlugs = ['music-app', 'hair-style-ai'] as const;

export function isLocale(value: string): value is Locale {
  return value === 'vi' || value === 'en';
}

export function isEnterpriseSlug(value: string): value is (typeof enterpriseSlugs)[number] {
  return enterpriseSlugs.some((slug) => slug === value);
}

export function isAiSlug(value: string): value is (typeof aiSlugs)[number] {
  return aiSlugs.some((slug) => slug === value);
}

export function getEnterpriseStaticParams() {
  return enterpriseSlugs.map((slug) => ({ slug }));
}

export function getAiStaticParams() {
  return aiSlugs.map((slug) => ({ slug }));
}

export function isProductSlug(value: string): value is (typeof productSlugs)[number] {
  return productSlugs.some((slug) => slug === value);
}

export function getProductStaticParams() {
  return productSlugs.map((slug) => ({ slug }));
}
