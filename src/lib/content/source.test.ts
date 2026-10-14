import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getContentSource, parseContentSource } from './source';

test('CONTENT_SOURCE chưa đặt / rỗng → file (mặc định giữ hành vi cũ)', () => {
  assert.equal(parseContentSource(undefined), 'file');
  assert.equal(parseContentSource(''), 'file');
  assert.equal(parseContentSource('  '), 'file');
});

test('CONTENT_SOURCE file | db (bỏ khoảng trắng thừa)', () => {
  assert.equal(parseContentSource('file'), 'file');
  assert.equal(parseContentSource('db'), 'db');
  assert.equal(parseContentSource(' db\n'), 'db');
});

test('giá trị lạ → lỗi rõ, không fallback âm thầm', () => {
  for (const value of ['DB', 'database', 'files', 'true']) {
    assert.throws(() => parseContentSource(value), /CONTENT_SOURCE không hợp lệ/);
  }
});

test('getContentSource đọc env lúc gọi', () => {
  const previous = process.env.CONTENT_SOURCE;
  try {
    process.env.CONTENT_SOURCE = 'db';
    assert.equal(getContentSource(), 'db');
    delete process.env.CONTENT_SOURCE;
    assert.equal(getContentSource(), 'file');
  } finally {
    if (previous === undefined) delete process.env.CONTENT_SOURCE;
    else process.env.CONTENT_SOURCE = previous;
  }
});
