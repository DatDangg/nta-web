import type { Locale } from '@/content/types';
// Đường dẫn tương đối (không alias @/): tools/db import file này qua tsx/vitest ngoài Next.
import { routing } from '../../i18n/routing';

// Dữ liệu registry slug chế độ CONTENT_SOURCE=file (và nguồn seed tools/db). Web đọc qua getRegistrySlugs (registry.ts), không import thẳng.
export const enterpriseSlugs = ['crm', 'hrm', 'lms', 'dentgo'] as const;
export const aiSlugs = ['boxai', 'flycam', 'custom-ai', 'fridayai', 'ai-operations-brain'] as const;
export const productSlugs = ['music-app', 'hair-style-ai'] as const;

export function isLocale(value: string): value is Locale {
  // Suy từ routing.locales (1 nguồn) — thêm locale ở routing là page tự nhận, không sửa guard từng trang (CR-044).
  return (routing.locales as readonly string[]).includes(value);
}
