import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateContactForm } from './contact-schema';

const VALID_INPUT = { name: 'Nguyễn An', email: 'an@example.com', message: 'Cần tư vấn hệ thống CRM', honeypot: '' };

function errorsOf(input: unknown): Record<string, string> {
  const result = validateContactForm(input);
  assert.equal(result.success, false);
  return result.success ? {} : result.errors;
}

test('contact-schema locale: thiếu hoặc rỗng → vi', () => {
  for (const input of [VALID_INPUT, { ...VALID_INPUT, locale: '' }]) {
    const result = validateContactForm(input);
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.locale, 'vi');
  }
});

test('contact-schema locale: en giữ nguyên, vi giữ nguyên', () => {
  for (const locale of ['en', 'vi'] as const) {
    const result = validateContactForm({ ...VALID_INPUT, locale });
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.locale, locale);
  }
});

test('contact-schema locale: giá trị lạ / không phải chuỗi → errors.locale', () => {
  for (const locale of ['fr', 'EN', 1, null, true]) {
    assert.ok(errorsOf({ ...VALID_INPUT, locale }).locale, `locale=${String(locale)} phải lỗi`);
  }
});

test('contact-schema regression: rule cũ không đổi', () => {
  assert.deepEqual(Object.keys(errorsOf({ ...VALID_INPUT, name: 'A' })), ['name']);
  assert.deepEqual(Object.keys(errorsOf({ ...VALID_INPUT, email: 'sai' })), ['email']);
  assert.deepEqual(Object.keys(errorsOf({ ...VALID_INPUT, phone: '12ab' })), ['phone']);
  assert.deepEqual(Object.keys(errorsOf({ ...VALID_INPUT, company: 'x'.repeat(1000) })), ['company']);
  assert.deepEqual(Object.keys(errorsOf({ ...VALID_INPUT, need: 'khong-co' })), ['need']);
  assert.deepEqual(Object.keys(errorsOf({ ...VALID_INPUT, message: 'ngắn' })), ['message']);
  const { honeypot: _omit, ...withoutHoneypot } = VALID_INPUT;
  assert.deepEqual(Object.keys(errorsOf(withoutHoneypot)), ['honeypot']);
  assert.deepEqual(errorsOf(null), { form: 'Dữ liệu không hợp lệ' });

  const ok = validateContactForm({ ...VALID_INPUT, phone: '0912345678', company: '  NTA  ', honeypot: 'bot' });
  assert.equal(ok.success, true);
  if (ok.success) {
    assert.equal(ok.data.phone, '0912345678');
    assert.equal(ok.data.company, 'NTA');
    assert.equal(ok.data.honeypot, 'bot');
  }
});
