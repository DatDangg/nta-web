import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { StoredEntry } from '../../db/content-read';
import viMessages from '../../i18n/messages/vi.json';
import { COMPANY_CONTACT } from '../contact/company-info';
import { buildCompanyContact, buildUiMessages } from './ui-data';

function entry(slug: string, data: unknown): StoredEntry {
  return { slug, data: data as Record<string, unknown>, body: null, sortOrder: null };
}

function collectWarnings(): { warn: (message: string) => void; messages: string[] } {
  const messages: string[] = [];
  return { warn: (message) => messages.push(message), messages };
}

const seedEntries = (): StoredEntry[] => Object.entries(structuredClone(viMessages)).map(([namespace, data]) => entry(namespace, data));

test('ui_messages: gộp bản ghi theo namespace = messages file, không cảnh báo', () => {
  const { warn, messages } = collectWarnings();
  assert.deepEqual(buildUiMessages(seedEntries(), viMessages, 'ui_messages/vi', warn), viMessages);
  assert.deepEqual(messages, []);
});

test('ui_messages: giá trị DB đè file', () => {
  const entries = seedEntries().map((item) => (item.slug === 'footer' ? entry('footer', { ...item.data, tagline: 'Chữ mới' }) : item));
  const { warn } = collectWarnings();
  assert.equal(buildUiMessages(entries, viMessages, 'ui_messages/vi', warn).footer.tagline, 'Chữ mới');
});

test('ui_messages: thiếu key (vd footer.copyright) / thiếu cả namespace → dùng giá trị file + warn liệt kê đường dẫn', () => {
  const { copyright: _removed, ...footerWithoutCopyright } = structuredClone(viMessages.footer);
  const entries = seedEntries()
    .filter((item) => item.slug !== 'nav')
    .map((item) => (item.slug === 'footer' ? entry('footer', footerWithoutCopyright) : item));
  const { warn, messages } = collectWarnings();
  const result = buildUiMessages(entries, viMessages, 'ui_messages/vi', warn);
  assert.equal(result.footer.copyright, viMessages.footer.copyright);
  assert.deepEqual(result.nav, viMessages.nav);
  assert.equal(messages.length, 1);
  assert.match(messages[0], /ui_messages\/vi trong DB thiếu 2 key, dùng giá trị file seed: nav; footer\.copyright/);
});

test('ui_messages: sai kiểu / rỗng → ném lỗi, không warn', () => {
  const entries = seedEntries().map((item) => (item.slug === 'footer' ? entry('footer', { ...item.data, copyright: '' }) : item));
  const { warn, messages } = collectWarnings();
  assert.throws(() => buildUiMessages(entries, viMessages, 'ui_messages/vi', warn), /ui_messages\/vi trong DB sai cấu trúc .*footer\.copyright: rỗng/);
  assert.deepEqual(messages, []);
});

test('company_info: lấy bản ghi slug contact, DB đè hằng; thiếu trường → hằng + warn', () => {
  const { phone, ...withoutPhone } = structuredClone(COMPANY_CONTACT);
  const data = { ...withoutPhone, email: { ...withoutPhone.email, display: 'moi@ntasolution.vn' } };
  const { warn, messages } = collectWarnings();
  const contact = buildCompanyContact([entry('other', {}), entry('contact', data)], COMPANY_CONTACT, 'company_info/vi', warn);
  assert.equal(contact.email.display, 'moi@ntasolution.vn');
  assert.deepEqual(contact.phone, phone);
  assert.match(messages[0], /company_info\/vi trong DB thiếu 1 key, dùng giá trị file seed: phone/);
});

test('company_info: không có bản ghi → lỗi rõ; sai kiểu → lỗi', () => {
  const { warn } = collectWarnings();
  assert.throws(() => buildCompanyContact([], COMPANY_CONTACT, 'company_info/vi', warn), /Thiếu bản ghi company_info\/vi\/contact/);
  const broken = { ...structuredClone(COMPANY_CONTACT), map: 'x' };
  assert.throws(() => buildCompanyContact([entry('contact', broken)], COMPANY_CONTACT, 'company_info/vi', warn), /map: cần object/);
});
