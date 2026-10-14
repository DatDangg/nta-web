import 'server-only';

import type { Locale } from '@/content/types';
import { getContentSource } from '@/lib/content/source';
import { getEntries } from '@/lib/content/store';
import { buildCompanyContact, warnOncePerProcess } from '@/lib/content/ui-data';
import { COMPANY_CONTACT, type CompanyContact } from './company-info';

/**
 * Thông tin liên hệ công ty theo cờ CONTENT_SOURCE (CR-031 P3-T04, quyết định #9):
 * file = hằng `COMPANY_CONTACT` · db = bản ghi `company_info/<locale>/contact` qua data cache có tag `content:company_info`,
 * gộp sâu lên hằng (key thiếu lấy từ hằng + cảnh báo; sai kiểu/rỗng → lỗi) — xem src/lib/content/shape.ts.
 * Gọi ở server (layout, trang Liên hệ) rồi truyền xuống component qua props.
 */
export async function getCompanyContact(locale: Locale): Promise<CompanyContact> {
  if (getContentSource() === 'file') return COMPANY_CONTACT;
  return buildCompanyContact(await getEntries('company_info', locale), COMPANY_CONTACT, `company_info/${locale}`, warnOncePerProcess);
}
