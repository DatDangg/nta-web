import assert from 'node:assert/strict';
import { test } from 'node:test';
import viMessages from '../../i18n/messages/vi.json';
import { COMPANY_CONTACT } from '../contact/company-info';
import { formatPaths, mergeOverFile } from './shape';

const file = { nav: { home: 'Trang chủ', contact: 'Liên hệ' }, footer: { tagline: 'NTA', items: ['a', 'b'] }, count: 1 };

test('bản DB đủ key (thứ tự khác, key thừa) → giá trị DB, không thiếu', () => {
  const db = { count: 2, footer: { items: ['x'], tagline: 'X', extra: 'y' }, nav: { contact: 'C', home: 'H' }, extraNs: {} };
  const { value, missing } = mergeOverFile(file, db, 'ui_messages/vi');
  assert.deepEqual(missing, []);
  assert.deepEqual(value, db);
});

test('thiếu namespace / key lồng → lấy giá trị file + trả đường dẫn thiếu', () => {
  const { value, missing } = mergeOverFile(file, { nav: { home: 'H' }, count: 1 }, 'ui_messages/vi');
  assert.deepEqual(missing, ['nav.contact', 'footer']);
  assert.deepEqual(value, { nav: { home: 'H', contact: 'Liên hệ' }, footer: file.footer, count: 1 });
});

test('sai kiểu / chuỗi rỗng / null → ném lỗi nêu rõ đường dẫn (không fallback)', () => {
  assert.throws(() => mergeOverFile(file, { nav: { home: '  ', contact: 1 }, footer: { tagline: null, items: 'a' }, count: 1 }, 'x'), (error: Error) => {
    assert.match(error.message, /nav\.home: rỗng/);
    assert.match(error.message, /nav\.contact: cần string/);
    assert.match(error.message, /footer\.tagline: cần string/);
    assert.match(error.message, /footer\.items: cần mảng/);
    return true;
  });
  assert.throws(() => mergeOverFile(file, null, 'x'), /\(gốc\): cần object/);
  assert.throws(() => mergeOverFile(file, { nav: 'x' }, 'x'), /nav: cần object/);
});

test('phần tử mảng: rỗng / sai kiểu / thiếu key trong phần tử → lỗi', () => {
  assert.throws(() => mergeOverFile(file, { ...file, footer: { tagline: 'x', items: [] } }, 'x'), /footer\.items: mảng rỗng/);
  assert.throws(() => mergeOverFile(file, { ...file, footer: { tagline: 'x', items: ['ok', 2, ''] } }, 'x'), (error: Error) => {
    assert.match(error.message, /footer\.items\[1\]: cần string/);
    assert.match(error.message, /footer\.items\[2\]: rỗng/);
    return true;
  });
  const withObjects = { list: [{ title: 'A', note: 'n' }] };
  assert.throws(() => mergeOverFile(withObjects, { list: [{ title: 'B' }] }, 'x'), /list\[0\]\.note: thiếu/);
  assert.deepEqual(mergeOverFile(withObjects, { list: [{ title: 'B', note: 'm' }, { title: 'C', note: 'k' }] }, 'x').value.list.length, 2);
});

test('formatPaths báo tối đa 10 đường dẫn', () => {
  const paths = Array.from({ length: 15 }, (_, index) => `k${index}`);
  assert.match(formatPaths(paths), /^k0; .*k9 \(\+5 khác\)$/);
  const big = Object.fromEntries(paths.map((path) => [path, 'v']));
  assert.throws(() => mergeOverFile(big, Object.fromEntries(paths.map((path) => [path, ''])), 'x'), /\(\+5 khác\)/);
});

test('bản seed (chính dữ liệu file) khớp chính nó — messages + company_info', () => {
  assert.deepEqual(mergeOverFile(viMessages, structuredClone(viMessages), 'ui_messages/vi'), { value: viMessages, missing: [] });
  assert.deepEqual(mergeOverFile(COMPANY_CONTACT, structuredClone(COMPANY_CONTACT), 'company_info/vi'), { value: COMPANY_CONTACT, missing: [] });
});
