// Phần thuần của nhánh `CONTENT_SOURCE=db` cho chữ giao diện + thông tin công ty (CR-031 P3-T04) — không server-only để test được.
// Đọc DB (store.ts, data cache có tag) nằm ở src/i18n/request.ts và src/lib/contact/company-contact.ts.
import type { StoredEntry } from '@/db/content-read';
import { COMPANY_INFO_SLUG } from '@/db/content-rules';
import type { CompanyContact } from '@/lib/contact/company-info';
import { formatPaths, mergeOverFile } from './shape';

export type Warn = (message: string) => void;

// getRequestConfig chạy mỗi request (trang vi) → chỉ cảnh báo 1 lần / process cho mỗi nội dung, tránh ngập log.
const warnedMessages = new Set<string>();

export function warnOncePerProcess(message: string): void {
  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  console.warn(message);
}

function mergeAndWarn<T>(fileValue: T, dbValue: unknown, label: string, warn: Warn): T {
  const { value, missing } = mergeOverFile(fileValue, dbValue, label);
  if (missing.length > 0) warn(`[content-shape] ${label} trong DB thiếu ${missing.length} key, dùng giá trị file seed: ${formatPaths(missing)}`);
  return value;
}

/** Gộp các bản ghi `ui_messages/<locale>/<namespace>` thành messages next-intl, gộp sâu lên bản file. */
export function buildUiMessages<T extends Record<string, unknown>>(entries: readonly StoredEntry[], fileMessages: T, label: string, warn: Warn): T {
  const dbMessages = Object.fromEntries(entries.map((entry) => [entry.slug, entry.data]));
  return mergeAndWarn(fileMessages, dbMessages, label, warn);
}

/** Lấy bản ghi `company_info/<locale>/contact`, gộp sâu lên hằng file. Không có bản ghi → lỗi rõ. */
export function buildCompanyContact(entries: readonly StoredEntry[], fileContact: CompanyContact, label: string, warn: Warn): CompanyContact {
  const entry = entries.find((candidate) => candidate.slug === COMPANY_INFO_SLUG);
  if (!entry) throw new Error(`[company-contact] Thiếu bản ghi ${label}/${COMPANY_INFO_SLUG} trong DB`);
  return mergeAndWarn(fileContact, entry.data, label, warn);
}
