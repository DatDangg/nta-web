// Fallback en theo bản ghi (R-20a.2) — phần thuần dùng cho store DB (getLocalizedEntries) và loader file. Reader DB được stub.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Locale } from '../../content/types';
import { compareStoredEntries, type StoredEntry } from '../../db/content-read';
import { mergeByKey, pickLocale, readWithFallback } from './locale-fallback';

function entry(slug: string, title: string, sortOrder: number | null = null): StoredEntry {
  return { slug, data: { title }, body: null, sortOrder };
}

// "DB" stub: bản ghi theo locale; ghi lại locale nào được đọc.
function stubReader(rows: Partial<Record<Locale, StoredEntry[]>>) {
  const reads: Locale[] = [];
  return {
    reads,
    read: async (locale: Locale) => {
      reads.push(locale);
      return [...(rows[locale] ?? [])];
    },
  };
}

async function readEntries(locale: Locale, rows: Partial<Record<Locale, StoredEntry[]>>) {
  const reader = stubReader(rows);
  let warnings = 0;
  const items = await readWithFallback(locale, reader.read, (item) => item.slug, compareStoredEntries, () => (warnings += 1));
  return { items, warnings, reads: reader.reads };
}

const EN = [entry('crm', 'CRM en', 1), entry('hrm', 'HRM en', 2), entry('lms', 'LMS en', 3)];

test('db: ja có đủ bản ghi → dùng nguyên bản ja, không cảnh báo', async () => {
  const JA = [entry('crm', 'CRM ja', 1), entry('hrm', 'HRM ja', 2), entry('lms', 'LMS ja', 3)];
  const { items, warnings } = await readEntries('ja', { ja: JA, en: EN });
  assert.deepEqual(items, JA);
  assert.equal(warnings, 0);
});

test('db: ja thiếu 1 phần → từng bản ghi: có ja dùng ja (không trộn field en), thiếu dùng en; theo thứ tự sort_order', async () => {
  const jaCrm = { slug: 'crm', data: { title: 'CRM ja' }, body: null, sortOrder: 1 } satisfies StoredEntry;
  const { items, warnings } = await readEntries('ja', { ja: [jaCrm], en: EN });
  assert.deepEqual(items.map((item) => item.data.title), ['CRM ja', 'HRM en', 'LMS en']);
  assert.deepEqual(items[0], jaCrm);
  assert.equal(warnings, 1);
});

test('db: ja chưa có bản ghi nào → toàn bộ = en (không 500)', async () => {
  const { items, warnings } = await readEntries('ja', { en: EN });
  assert.deepEqual(items, EN);
  assert.equal(warnings, 1);
});

test('db: slug không có ở cả ja lẫn en → không có trong kết quả (trang notFound)', async () => {
  const { items } = await readEntries('ja', { ja: [entry('crm', 'CRM ja', 1)], en: EN });
  assert.equal(items.find((item) => item.slug === 'khong-ton-tai'), undefined);
});

test('db: bản chỉ có ở ja vẫn giữ (vd bài AI news ja)', async () => {
  const { items } = await readEntries('ja', { ja: [entry('ai-news-ja', 'Tin ja', null)], en: EN });
  assert.deepEqual(items.map((item) => item.slug), ['crm', 'hrm', 'lms', 'ai-news-ja']);
});

test('vi/en: đọc thẳng 1 lần, không đọc en kèm, không cảnh báo', async () => {
  const VI = [entry('lms', 'LMS vi', 3), entry('crm', 'CRM vi', 1)];
  for (const locale of ['vi', 'en'] as const) {
    const { items, warnings, reads } = await readEntries(locale, { vi: VI, en: EN });
    assert.deepEqual(reads, [locale]);
    assert.deepEqual(items, locale === 'vi' ? VI : EN);
    assert.equal(warnings, 0);
  }
});

test('mergeByKey: đếm số bản lấy từ fallback', () => {
  const result = mergeByKey([entry('crm', 'ja')], EN, (item) => item.slug);
  assert.equal(result.fallbackCount, 2);
  assert.equal(result.items.length, 3);
});

test('pickLocale: có ja → ja; thiếu ja → en; vi/en giữ nguyên', () => {
  assert.equal(pickLocale({ vi: 'v', en: 'e', ja: 'j' }, 'ja'), 'j');
  assert.equal(pickLocale({ vi: 'v', en: 'e' }, 'ja'), 'e');
  assert.equal(pickLocale({ vi: 'v', en: 'e' }, 'vi'), 'v');
  assert.equal(pickLocale({ vi: 'v', en: 'e' }, 'en'), 'e');
});
