// CR-035 task-03: ảnh tin trong MDX bản tin AI đi qua next/image, render thật qua compileMDX
// (next-mdx-remote/rsc — cùng pipeline RenderMdx/MDXRemote dùng ở trang blog).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mdxComponents } from './index';
import { NewsImage } from './news-image';

// tsconfig jsx=preserve → tsx (esbuild) biên dịch .tsx theo JSX classic (React.createElement); Next tự lo khi build.
Object.assign(globalThis, { React });

const SHA = 'a'.repeat(64);

// Import động: next-mdx-remote kéo dependency ESM-only (estree-walker) mà require() của test runner (CJS) không nạp được.
async function renderMdx(source: string): Promise<string> {
  const { compileMDX } = await import('next-mdx-remote/rsc');
  const { content } = await compileMDX({ source, components: mdxComponents });
  return renderToStaticMarkup(content);
}

function newsImageTag(attrs: string): string {
  return `Trước\n\n<NewsImage ${attrs} />\n\nSau`;
}

test('NewsImage hợp lệ (như generate.py sinh) → next/image qua /_next/image, giữ width/height/alt/lazy', async () => {
  const html = await renderMdx(
    `<NewsImage src="/uploads/${SHA}.webp" alt="OpenAI ra mắt &quot;GPT&quot;" width="800" height="450" />\n\n*Ảnh: example.com*`,
  );
  assert.match(html, new RegExp(`/_next/image\\?url=%2Fuploads%2F${SHA}\\.webp`));
  assert.match(html, /width="800"/);
  assert.match(html, /height="450"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /sizes="100vw"/);
  assert.match(html, /alt="OpenAI ra mắt &quot;GPT&quot;"/);
  assert.match(html, /<em>Ảnh: example\.com<\/em>/);
});

test('NewsImage chấp nhận jpg/png, cạnh tối đa 8192', async () => {
  for (const ext of ['jpg', 'png']) {
    const html = await renderMdx(newsImageTag(`src="/uploads/${SHA}.${ext}" alt="Tin" width="1" height="8192"`));
    assert.match(html, new RegExp(`url=%2Fuploads%2F${SHA}\\.${ext}`), ext);
  }
});

// MDX của next-mdx-remote v6 chặn biểu thức JS (width={800}) → number chỉ đến khi gọi component trực tiếp.
test('NewsImage nhận width/height dạng number hợp lệ', () => {
  const src = `/uploads/${SHA}.png`;
  const html = renderToStaticMarkup(React.createElement(NewsImage, { src, alt: 'Tin', width: 640, height: 360 }));
  assert.match(html, /_next\/image\?url=%2Fuploads/);
  assert.match(html, /width="640"/);
  assert.equal(renderToStaticMarkup(React.createElement(NewsImage, { src, alt: 'Tin', width: 1.5, height: 360 })), '');
});

const INVALID_CASES: Array<[string, string]> = [
  ['src http ngoài', `src="https://evil.example/${SHA}.webp" alt="Tin" width="800" height="450"`],
  ['src protocol-relative', `src="//evil.example/uploads/${SHA}.webp" alt="Tin" width="800" height="450"`],
  ['src không phải sha256', `src="/uploads/abc.webp" alt="Tin" width="800" height="450"`],
  ['src sha256 hoa', `src="/uploads/${'A'.repeat(64)}.webp" alt="Tin" width="800" height="450"`],
  ['src đuôi gif', `src="/uploads/${SHA}.gif" alt="Tin" width="800" height="450"`],
  ['src có ..', `src="/uploads/../${SHA}.webp" alt="Tin" width="800" height="450"`],
  ['src có query', `src="/uploads/${SHA}.webp?x=1" alt="Tin" width="800" height="450"`],
  ['width 0', `src="/uploads/${SHA}.webp" alt="Tin" width="0" height="450"`],
  ['width > 8192', `src="/uploads/${SHA}.webp" alt="Tin" width="8193" height="450"`],
  ['width thập phân', `src="/uploads/${SHA}.webp" alt="Tin" width="800.5" height="450"`],
  ['height âm', `src="/uploads/${SHA}.webp" alt="Tin" width="800" height="-1"`],
  ['height chữ', `src="/uploads/${SHA}.webp" alt="Tin" width="800" height="abc"`],
  ['thiếu height', `src="/uploads/${SHA}.webp" alt="Tin" width="800"`],
  ['thiếu alt', `src="/uploads/${SHA}.webp" width="800" height="450"`],
  ['alt rỗng', `src="/uploads/${SHA}.webp" alt="  " width="800" height="450"`],
];

for (const [name, attrs] of INVALID_CASES) {
  test(`NewsImage sai dạng (${name}) → không ra ảnh`, async () => {
    const html = await renderMdx(newsImageTag(attrs));
    assert.doesNotMatch(html, /<img/);
    assert.match(html, /<p class="my-5 leading-relaxed">Trước<\/p>/);
    assert.match(html, /Sau<\/p>/);
  });
}

test('Regression: ảnh markdown thường vẫn qua ArticleImage (<img> trần, không next/image)', async () => {
  const html = await renderMdx('![Mô tả](/images/a.png)');
  assert.match(html, /<img[^>]*src="\/images\/a\.png"/);
  assert.match(html, /decoding="async"/);
  assert.doesNotMatch(html, /_next\/image/);
});
