#!/usr/bin/env node
// Tái tạo bộ font Noto Sans JP self-host ở public/fonts/noto-sans-jp/ (chỉ trang ja dùng — CR-044 P2-T04).
//
// Vì sao không dùng thẳng next/font: CSS @font-face của next/font luôn nằm trong CSS chung của layout
// (kể cả khi import có điều kiện), nên mọi trang vi/en phải tải ~95KB CSS JP render-blocking.
//
// Nguồn: output của chính next/font/google (Google Fonts, Noto Sans JP variable wght 100–900, license SIL OFL 1.1),
// KHÔNG tải từ nguồn ngoài nào khác. Cách chạy lại:
//   1. Tạm thêm vào 1 module được layout import:
//      `Noto_Sans_JP({ display: 'swap', variable: '--font-noto-jp', preload: false })` từ 'next/font/google'.
//   2. `npm run build` (next/font tải font lúc build vào .next/static/media).
//   3. `node tools/fonts/build-noto-jp.mjs [đường dẫn CSS chunk]` — không truyền thì tự tìm chunk chứa "Noto Sans JP".
//   4. Gỡ import tạm ở bước 1, build lại.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const NEXT_STATIC = path.join(ROOT, '.next', 'static');
const OUT_DIR = path.join(ROOT, 'public', 'fonts', 'noto-sans-jp');
const PUBLIC_PREFIX = '/fonts/noto-sans-jp/';
const FAMILY = 'Noto Sans JP';

function findSourceCss() {
  const cssDir = path.join(NEXT_STATIC, 'css');
  const match = readdirSync(cssDir).find((name) => readFileSync(path.join(cssDir, name), 'utf8').includes(`font-family:${FAMILY};`));
  if (!match) throw new Error(`Không thấy CSS chunk chứa @font-face "${FAMILY}" trong ${cssDir} — xem hướng dẫn đầu file.`);
  return path.join(cssDir, match);
}

const sourceCss = process.argv[2] ? path.resolve(process.argv[2]) : findSourceCss();
const fontFaces = (readFileSync(sourceCss, 'utf8').match(/@font-face\{[^}]*\}/g) ?? [])
  .filter((rule) => rule.includes(`font-family:${FAMILY};`));
if (fontFaces.length === 0) throw new Error(`${sourceCss} không có @font-face "${FAMILY}".`);

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const rewrittenFaces = fontFaces.map((rule) => rule.replace(/url\(\/_next\/static\/media\/([^)]+)\)/g, (_, fileName) => {
  const sourceFile = path.join(NEXT_STATIC, 'media', fileName);
  if (!existsSync(sourceFile)) throw new Error(`Thiếu file font ${sourceFile}`);
  const outName = fileName.replace(/-s(\.p)?\.woff2$/, '.woff2');
  copyFileSync(sourceFile, path.join(OUT_DIR, outName));
  return `url(${PUBLIC_PREFIX}${outName})`;
}));

const header = [
  `/* Noto Sans JP (Google Fonts, SIL Open Font License 1.1 — https://openfontlicense.org). */`,
  `/* Sinh bởi tools/fonts/build-noto-jp.mjs từ output next/font — không sửa tay. Chỉ trang ja link file này. */`,
  `:root{--font-noto-jp:"${FAMILY}"}`,
];
writeFileSync(path.join(OUT_DIR, 'noto-sans-jp.css'), `${[...header, ...rewrittenFaces].join('\n')}\n`);
console.log(`Đã ghi ${rewrittenFaces.length} @font-face + font vào ${path.relative(ROOT, OUT_DIR)} (nguồn ${path.relative(ROOT, sourceCss)}).`);
