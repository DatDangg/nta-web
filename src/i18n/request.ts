import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import type { Locale } from '@/content/types';
import { getContentSource } from '@/lib/content/source';
import { getEntries } from '@/lib/content/store';
import { buildUiMessages, warnOncePerProcess } from '@/lib/content/ui-data';
import { routing } from './routing';

type Messages = Record<string, unknown>;

async function readFileMessages(locale: Locale): Promise<Messages> {
  return (await import(`./messages/${locale}.json`)).default;
}

// Chế độ db (CR-031 P3-T04): mỗi namespace cấp 1 là 1 bản ghi `ui_messages/<locale>/<namespace>` → gộp sâu lên file JSON
// (bản dự phòng + chuẩn cấu trúc lâu dài: key thiếu lấy từ file + cảnh báo; sai kiểu/rỗng → lỗi, trang không render).
// getEntries đi qua data cache có tag `content:ui_messages` → cache hit không truy vấn DB (getRequestConfig chạy mỗi request).
async function readDbMessages(locale: Locale): Promise<Messages> {
  return buildUiMessages(await getEntries('ui_messages', locale), await readFileMessages(locale), `ui_messages/${locale}`, warnOncePerProcess);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(routing.locales, requestedLocale) ? requestedLocale : routing.defaultLocale;

  return {
    locale,
    messages: getContentSource() === 'db' ? await readDbMessages(locale) : await readFileMessages(locale),
  };
});
