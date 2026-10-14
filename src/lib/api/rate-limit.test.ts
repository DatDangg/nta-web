import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isRevalidateRateLimited } from './rate-limit';

test('revalidate rate-limit: 30 request/phút/khoá, hết cửa sổ thì mở lại', () => {
  const start = 1_000_000;
  for (let index = 0; index < 30; index += 1) assert.equal(isRevalidateRateLimited('rl-test', start + index), false);
  assert.equal(isRevalidateRateLimited('rl-test', start + 30), true);
  assert.equal(isRevalidateRateLimited('rl-other', start + 30), false);
  assert.equal(isRevalidateRateLimited('rl-test', start + 60_000), false);
});
