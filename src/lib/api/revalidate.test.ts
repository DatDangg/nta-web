import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleRevalidateRequest, parseRevalidateTarget, type RevalidateDeps } from './revalidate';

const SECRET = 'test-secret-0123456789abcdef';

function fakeDeps(overrides: Partial<RevalidateDeps> = {}) {
  const revalidated: string[] = [];
  const errors: string[] = [];
  const deps: RevalidateDeps = {
    expectedSecret: SECRET,
    clientKey: '203.0.113.7',
    isRateLimited: () => false,
    revalidateTag: (tag) => revalidated.push(tag),
    log: { error: (message: string) => errors.push(message), info: () => undefined },
    ...overrides,
  };
  return { deps, revalidated, errors };
}

function post(body: string, secret?: string): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (secret !== undefined) headers['x-revalidate-secret'] = secret;
  return new Request('http://localhost/api/revalidate', { method: 'POST', headers, body });
}

const validBody = JSON.stringify({ collection: 'post', slug: 'first-steps' });

test('thiếu hoặc sai secret → 401, không revalidate, no-store', async () => {
  for (const secret of [undefined, '', 'wrong', `${SECRET}x`, SECRET.slice(0, -1)]) {
    const { deps, revalidated } = fakeDeps();
    const response = await handleRevalidateRequest(post(validBody, secret), deps);
    assert.equal(response.status, 401, `secret=${String(secret)}`);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { status: 'error', message: 'unauthorized' });
    assert.deepEqual(revalidated, []);
  }
});

test('REVALIDATE_SECRET chưa đặt/rỗng → 503 + log, kể cả request gửi secret rỗng', async () => {
  for (const expectedSecret of [undefined, '', '   ']) {
    const { deps, revalidated, errors } = fakeDeps({ expectedSecret });
    const response = await handleRevalidateRequest(post(validBody, ''), deps);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { status: 'error', message: 'unavailable' });
    assert.deepEqual(revalidated, []);
    assert.match(errors.join('\n'), /REVALIDATE_SECRET chưa đặt/);
  }
});

test('body không phải JSON / sai shape → 400', async () => {
  const bodies = ['not json', '', '[]', 'null', '"post"', '{}', '{"all":false}', '{"all":"true"}', '{"all":true,"collection":"post"}',
    '{"collection":1}', '{"collection":"post","slug":""}', '{"collection":"post","slug":"../x"}', '{"collection":"post","slug":"a b"}',
    '{"collection":"post","slug":5}', '{"collection":"post","extra":1}', `{"collection":"post","slug":"${'a'.repeat(129)}"}`];
  for (const body of bodies) {
    const { deps, revalidated } = fakeDeps();
    const response = await handleRevalidateRequest(post(body, SECRET), deps);
    assert.equal(response.status, 400, body);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(revalidated, []);
  }
});

test('collection ngoài whitelist → 400 unknown_collection', async () => {
  for (const collection of ['users', 'Post', 'content', '__proto__']) {
    const { deps, revalidated } = fakeDeps();
    const response = await handleRevalidateRequest(post(JSON.stringify({ collection }), SECRET), deps);
    assert.equal(response.status, 400, collection);
    assert.deepEqual(await response.json(), { status: 'error', message: 'unknown_collection' });
    assert.deepEqual(revalidated, []);
  }
});

test('200 + đúng tag: collection, collection+slug, all', async () => {
  const cases: [object, string[]][] = [
    [{ collection: 'home' }, ['content:home']],
    [{ collection: 'post', slug: 'first-steps' }, ['content:post', 'content:post:first-steps']],
    [{ all: true }, ['content']],
  ];
  for (const [body, expected] of cases) {
    const { deps, revalidated } = fakeDeps();
    const response = await handleRevalidateRequest(post(JSON.stringify(body), SECRET), deps);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { status: 'ok', revalidated: expected });
    assert.deepEqual(revalidated, expected);
  }
});

test('rate-limit → 429 trước cả kiểm secret', async () => {
  const { deps, revalidated } = fakeDeps({ isRateLimited: () => true });
  const response = await handleRevalidateRequest(post(validBody, SECRET), deps);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(revalidated, []);
});

test('parseRevalidateTarget nhận đúng 2 dạng', () => {
  assert.deepEqual(parseRevalidateTarget({ all: true }), { all: true });
  assert.deepEqual(parseRevalidateTarget({ collection: 'listing_page', slug: 'ai' }), { collection: 'listing_page', slug: 'ai' });
  assert.equal(parseRevalidateTarget({ collection: 'nope' }), 'unknown_collection');
  assert.equal(parseRevalidateTarget({ slug: 'x' }), null);
});
