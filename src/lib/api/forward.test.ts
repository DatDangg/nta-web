import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, test } from 'node:test';
import type { ContactForm } from './contact-schema';
import { forwardContactForm } from './forward';

const TARGET = 'https://script.google.com/macros/s/SECRET-DEPLOY-ID/exec';
const TOKEN = 'tok-super-secret-123';
const FIXED_NOW = new Date('2026-10-15T08:00:00.000Z');
const ENV_KEYS = ['CONTACT_FORM_TARGET', 'CONTACT_FORM_TOKEN', 'NEXT_PUBLIC_CONTACT_FORM_TARGET', 'NEXT_PUBLIC_CONTACT_FORM_TOKEN'] as const;

const CONTACT: ContactForm = {
  name: 'Nguyễn An',
  email: 'an@example.com',
  phone: '',
  company: 'NTA',
  need: undefined,
  message: 'Cần tư vấn hệ thống CRM',
  honeypot: '',
  locale: 'en',
};

type FetchCall = { url: string; init: RequestInit };
const realFetch = globalThis.fetch;
const savedEnv = new Map<string, string | undefined>();
let calls: FetchCall[] = [];

function stubFetch(respond: () => Promise<Response>) {
  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} });
    return respond();
  };
}

/** Lỗi phải ném ra, và message không được lộ URL Web App / token. */
async function assertRejectsWithoutSecrets(promise: Promise<void>) {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.ok(!error.message.includes(TARGET) && !error.message.includes('SECRET-DEPLOY-ID'), 'lộ URL target');
    assert.ok(!error.message.includes(TOKEN), 'lộ token');
    return true;
  });
}

beforeEach(() => {
  for (const key of ENV_KEYS) savedEnv.set(key, process.env[key]);
  for (const key of ENV_KEYS) delete process.env[key];
  process.env.CONTACT_FORM_TARGET = TARGET;
  process.env.CONTACT_FORM_TOKEN = TOKEN;
  calls = [];
});

afterEach(() => {
  globalThis.fetch = realFetch;
  for (const key of ENV_KEYS) {
    const value = savedEnv.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('forward: thiếu target / thiếu token / có NEXT_PUBLIC_* → throw, không gọi fetch', async () => {
  stubFetch(async () => Response.json({ status: 'ok' }));
  const misconfigs: Array<() => void> = [
    () => delete process.env.CONTACT_FORM_TARGET,
    () => delete process.env.CONTACT_FORM_TOKEN,
    () => { process.env.NEXT_PUBLIC_CONTACT_FORM_TARGET = TARGET; },
    () => { process.env.NEXT_PUBLIC_CONTACT_FORM_TOKEN = TOKEN; },
  ];
  for (const misconfigure of misconfigs) {
    process.env.CONTACT_FORM_TARGET = TARGET;
    process.env.CONTACT_FORM_TOKEN = TOKEN;
    delete process.env.NEXT_PUBLIC_CONTACT_FORM_TARGET;
    delete process.env.NEXT_PUBLIC_CONTACT_FORM_TOKEN;
    misconfigure();
    await assertRejectsWithoutSecrets(forwardContactForm(CONTACT, () => FIXED_NOW));
  }
  assert.equal(calls.length, 0);
});

test('forward: body đúng hợp đồng (token, submittedAt ISO, locale, null cho field trống), JSON, redirect follow', async () => {
  stubFetch(async () => Response.json({ status: 'ok' }));
  await forwardContactForm(CONTACT, () => FIXED_NOW);

  assert.equal(calls.length, 1);
  const { url, init } = calls[0];
  assert.equal(url, TARGET);
  assert.equal(init.method, 'POST');
  assert.deepEqual(init.headers, { 'Content-Type': 'application/json' });
  assert.equal(init.redirect, 'follow');
  assert.ok(init.signal instanceof AbortSignal);
  assert.deepEqual(JSON.parse(String(init.body)), {
    token: TOKEN,
    submittedAt: '2026-10-15T08:00:00.000Z',
    locale: 'en',
    name: 'Nguyễn An',
    email: 'an@example.com',
    phone: null,
    company: 'NTA',
    need: null,
    message: 'Cần tư vấn hệ thống CRM',
  });
});

test('forward: submittedAt mặc định là thời điểm hiện tại dạng ISO', async () => {
  stubFetch(async () => Response.json({ status: 'ok' }));
  const before = Date.now();
  await forwardContactForm(CONTACT);
  const submittedAt = JSON.parse(String(calls[0].init.body)).submittedAt as string;
  assert.match(submittedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.ok(Date.parse(submittedAt) >= before && Date.parse(submittedAt) <= Date.now());
});

test('forward: chỉ {status:"ok"} mới thành công; JSON lỗi / HTML / 500 / timeout → throw không lộ secret', async () => {
  const failures: Array<() => Promise<Response>> = [
    async () => Response.json({ status: 'error', code: 'unauthorized' }),
    async () => Response.json({}),
    async () => Response.json(['ok']),
    async () => new Response('<!DOCTYPE html><html><body>Google Drive - Page Not Found</body></html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }),
    async () => Response.json({ status: 'ok' }, { status: 500 }),
    async () => { throw new DOMException('The operation was aborted due to timeout', 'TimeoutError'); },
    async () => { throw new TypeError(`fetch failed: ${TARGET}`); },
  ];
  for (const respond of failures) {
    stubFetch(respond);
    await assertRejectsWithoutSecrets(forwardContactForm(CONTACT, () => FIXED_NOW));
  }
});

test('forward: theo redirect 302 thật của Node fetch (POST → GET kết quả như Apps Script)', async () => {
  const seen: string[] = [];
  const server = createServer((request, response) => {
    seen.push(`${request.method} ${request.url}`);
    if (request.method === 'POST' && request.url === '/exec') {
      response.writeHead(302, { Location: '/echo?user_content_key=abc' }).end();
      return;
    }
    response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ status: 'ok' }));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const { port } = server.address() as AddressInfo;
    process.env.CONTACT_FORM_TARGET = `http://127.0.0.1:${port}/exec`;
    await forwardContactForm(CONTACT, () => FIXED_NOW);
    assert.deepEqual(seen, ['POST /exec', 'GET /echo?user_content_key=abc']);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
