/**
 * contact-sheet.mjs — chụp trang web NTA ở nhiều viewport rồi ghép contact sheet.
 *
 * Dùng để user duyệt layout trước khi merge (R2: KHÔNG deploy khi chưa duyệt screenshot).
 *
 * **BẮT BUỘC:** mọi `<img>` phải sẵn sàng trước khi chụp — gọi `assertImagesReady`
 * (xem `images-ready.mjs`). Nếu không, `captureBeyondViewport` sẽ cho ra **ô trống**
 * ở các tile chưa decode, mà DOM vẫn báo ảnh "tải xong" → rất dễ lẫn là ảnh hỏng.
 *
 * Ẩn mọi phần tử `position: sticky/fixed` trước khi chụp: header ghim trên đỉnh sẽ
 * phủ lên phần đầu của từng khối trong ảnh full-page rất dài (> 10000px).
 *
 * Gọi:
 *   node scripts/screenshots/contact-sheet.mjs --port 3002 --locale vi --widths 375,1440
 *   node scripts/screenshots/contact-sheet.mjs --port 3002 --locale en --widths 1440 --sheet
 *
 * Ảnh ra: `scripts/screenshots/.tmp/contact-sheet/<locale>-<width>.png`
 *         (+ `contact-sheet-<locale>.png` nếu có `--sheet`).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CDP, sleep } from "./cdp.mjs";
import { assertImagesReady } from "./images-ready.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const TMP = path.join(HERE, ".tmp");

/* ---------- args ---------- */
function parseArgs(argv) {
  const out = { port: 3002, locale: "vi", widths: [375, 1440], sheet: false, url: null, paths: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--port") out.port = argv[++i];
    else if (a === "--locale") out.locale = argv[++i];
    else if (a === "--widths") out.widths = argv[++i].split(",").map(Number);
    else if (a === "--sheet") out.sheet = true;
    else if (a === "--url") out.url = argv[++i];
    else if (a === "--paths") out.paths = argv[++i].split(",");
    else if (a === "--help" || a === "-h") { usage(); process.exit(0); }
  }
  return out;
}
function usage() {
  console.log(`contact-sheet.mjs — chụp trang NTA ở nhiều viewport + ghép contact sheet

  --port <n>       cổng dev server Next (mặc định 3002)
  --locale <vi|en> locale (mặc định vi)
  --widths <a,b>   các viewport width (mặc định 375,1440)
  --url <path>     ghi đè URL path (mặc định /dev/components)
  --paths <a,b>    chụp THAY /dev/components các path này, mỗi path × mỗi width
  --sheet          ghép các ảnh vừa chụp thành 1 contact sheet`);
}

const args = parseArgs(process.argv.slice(2));
const DEBUG_PORT = 9349;
// Dùng 127.0.0.1 thay vì localhost: trên máy này `localhost` resolve IPv6 ::1 trước,
// còn `next start`/standalone bind IPv4 → kết nối treo (timeout), không phải ECONNREFUSED.
const BASE = `http://127.0.0.1:${args.port}`;
if (!['vi', 'en'].includes(args.locale)) throw new Error(`locale không hợp lệ: ${args.locale}`);

/** Trang preview dev-only — chặn production bằng `notFound()` khi NODE_ENV !== 'development'. */
const DEFAULT_PATH = "/dev/components";
/** 4 trang giải pháp thật — dùng để đối chiếu "render đủ số tính năng như trước" ở T3. */
const SOLUTION_PATHS = ["/solutions/enterprise/crm", "/solutions/enterprise/hrm", "/solutions/enterprise/lms", "/solutions/enterprise/dentgo"];

const targets = args.paths
  ? args.paths.map((p) => ({ path: p, slug: p.replace(/^\//, "").replace(/\//g, "-") }))
  : [{ path: args.url || DEFAULT_PATH, slug: "dev-components" }];

fs.mkdirSync(TMP, { recursive: true });

/* ---------- Edge ---------- */
function findEdge() {
  const cands = [
    process.env.EDGE_PATH,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/microsoft-edge",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ].filter(Boolean);
  for (const p of cands) if (fs.existsSync(p)) return p;
  throw new Error("không tìm thấy Edge — đặt biến môi trường EDGE_PATH");
}

function launchEdge(port, width) {
  const child = spawn(
    findEdge(),
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${path.join(TMP, "profile")}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--ignore-certificate-errors",
      "--hide-scrollbars",
      "--force-color-profile=srgb",
      "--font-render-hinting=none",
      `--window-size=${width},900`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );
  child.on("error", (e) => console.error("[edge]", e.message));
  return child;
}

const log = (...m) => console.log(...m);

/* ---------- chụp ---------- */

/** Ẩn header sticky + mọi phần tử ghim — chúng phủ lên ảnh full-page. */
const HIDE_STICKY = `(() => {
  let n = 0;
  for (const el of document.querySelectorAll('header, [class*="sticky"]')) {
    if (getComputedStyle(el).position === 'sticky') {
      el.style.setProperty('visibility', 'hidden', 'important');
      n++;
    }
  }
  return n;
})()`;

/**
 * Chụp full-page.
 *
 * ⚠ KHÔNG dùng `captureBeyondViewport` — cách này很容易 cho ra **ô trống** ở các tile
 * chưa được compositor raster. Bẫy khó thấy: `img.complete === true` và `img.decode()`
 * đều xong (ảnh đã có pixel thật, canvas đọc được) nhưng tile ngoài viewport đã bị
 * **discard** sau khi scroll → captureBeyondViewport mở rộng viewport ảo rồi re-raster
 * không kịp → khung ảnh có border/shadow nhưng bên trong trống. Lỗi này "chọn ảnh"
 * theo vị trí trên trang (ảnh đầu trống, ảnh cuối OK) nên rất dễ đổ cho lazy-load.
 *
 * Cách đúng: **đặt viewport cao bằng cả trang** rồi chụp bình thường. Khi đó TOÀN BỘ
 * trang nằm trong viewport ngay từ đầu → mọi tile raster một lần, không tile nào bị
 * discard, không cần re-raster. Đổi height xong phải chờ layout + ảnh settle đã.
 */
async function fullPagePng(cdp, sessionId, width) {
  const height = Math.ceil(
    (await cdp.evaluate(sessionId, "Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)")) || 900
  );

  // Mở viewport ra chiều cao trang — toàn bộ trang vào viewport, compositor raster hết.
  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    { width, height, deviceScaleFactor: 1, mobile: width < 700 },
    sessionId
  );
  // Đổi height có thể làm ảnh tiếp tục load/thay đổi layout → chờ settle lại rồi mới đo.
  await sleep(400);
  const settled = Math.ceil(
    (await cdp.evaluate(sessionId, "Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)")) || height
  );
  if (settled !== height) {
    await cdp.send(
      "Emulation.setDeviceMetricsOverride",
      { width, height: settled, deviceScaleFactor: 1, mobile: width < 700 },
      sessionId
    );
    await sleep(300);
  }

  // Chờ 2 frame để compositor raster xong tile mới trước khi chụp.
  await cdp.evaluate(sessionId, "new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))");
  await sleep(200);

  const { data } = await cdp.send(
    "Page.captureScreenshot",
    { format: "png", fromSurface: true },
    sessionId
  );
  return { buf: Buffer.from(data, "base64"), width, height: settled };
}

/**
 * Audit pixel sau khi chụp — bắt ảnh "đã load nhưng ra ô trống".
 *
 * Vì sao cần cả hai tầng (assert DOM + audit pixel):
 *   - `assertImagesReady` chỉ chứng minh ảnh **đã decode trong bộ nhớ**. Không chứng minh
 *     compositor đã **raster ra tile** khi chụp. Trang dài có tile bị discard → ảnh decode
 *     bình thường nhưng pixel vẫn trống (xem ghi chú `fullPagePng`).
 *   - Đo rect **trong cùng phiên** với ảnh chụp. Đo rect ở lần chạy khác rồi áp sang ảnh
 *     chụp là sai — layout lệch vài pixel là cắt nhầm vùng trống, rồi kết luận sai cả trang.
 *
 * Vùng kiểm = ảnh đã upscale ×0.8 rồi lấy max stdev trong 5×5 ô lưới. Dùng `max` chứ
 * không phải `min`: một ô lưới có nội dung là đủ, ô còn lại có thể là nền trong suốt hợp lệ.
 */
async function auditBlankRegions(cdp, sessionId, buf, width, { selector = "img", label = "" } = {}) {
  const sharp = (await import("sharp")).default;
  const rects = await cdp.evaluate(
    sessionId,
    `(() => [...document.querySelectorAll('${selector}')].map(i => {
        const r = i.getBoundingClientRect();
        return { src: i.currentSrc || i.src || '', x: r.x, y: r.y, w: r.width, h: r.height };
      }).filter(r => r.w > 0 && r.h > 0))()`
  );
  if (!rects.length) return { total: 0, blank: [] };

  const upscaled = await sharp(buf).resize({ width, kernel: "nearest" }).png().toBuffer();
  const meta = await sharp(upscaled).metadata();
  const blank = [];

  for (const r of rects) {
    const W = Math.round(r.w), H = Math.round(r.h);
    const L = Math.max(0, Math.round(r.x)), T = Math.max(0, Math.round(r.y));
    if (L + W > meta.width || T + H > meta.height || W < 8 || H < 8) continue;
    try {
      const { data, info } = await sharp(upscaled)
        .extract({ left: L, top: T, width: W, height: H })
        .raw()
        .toBuffer({ resolveWithObject: true });
      const cols = 5, rows = 5;
      const cw = Math.floor(W / cols), ch = Math.floor(H / rows);
      let maxStdev = 0;
      for (let ry = 0; ry < rows; ry++) {
        for (let cx = 0; cx < cols; cx++) {
          let sum = 0, sumSq = 0, n = 0;
          for (let y = ry * ch; y < (ry + 1) * ch; y++) {
            for (let x = cx * cw; x < (cx + 1) * cw; x++) {
              const o = (y * info.width + x) * info.channels;
              const lum = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
              sum += lum; sumSq += lum * lum; n++;
            }
          }
          if (n) { const m = sum / n; maxStdev = Math.max(maxStdev, Math.sqrt(Math.max(0, sumSq / n - m * m))); }
        }
      }
      if (maxStdev < 3) blank.push({ src: decodeURIComponent(r.src).split('/').pop().split('?')[0], maxStdev: +maxStdev.toFixed(2) });
    } catch { /* vùng ngoài ảnh — bỏ qua */ }
  }
  return { total: rects.length, blank };
}

/* ---------- main ---------- */
const edge = launchEdge(DEBUG_PORT, Math.max(...args.widths));
const guard = setTimeout(() => { try { edge.kill(); } catch {} process.exit(1); }, 900_000);

const cdp = await CDP.connect(DEBUG_PORT);
const report = [];

try {
  for (const t of targets) {
    const localePath = args.locale === 'en' ? `/en${t.path}` : t.path;
    const url = `${BASE}${localePath}`;
    for (const width of args.widths) {
      const height = width < 700 ? 812 : 900;
      const { sessionId } = await cdp.newPage("about:blank");
      await cdp.send("Network.enable", {}, sessionId);
      await cdp.send("Network.setCookie", {
        name: "NEXT_LOCALE", value: args.locale, domain: "127.0.0.1", path: "/", secure: false,
      }, sessionId);
      await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 }, sessionId);
      await cdp.navigate(sessionId, url);
      await cdp.waitUntil(sessionId, 'document.readyState === "complete"', { timeout: 45000 }).catch(() => {});
      await sleep(1200);

      const pageInfo = await cdp.evaluate(sessionId, `({ locale: document.documentElement.lang, url: location.href })`);
      const actualLocale = pageInfo.locale;
      if (actualLocale !== args.locale) {
        throw new Error(`Locale mismatch: requested ${args.locale}, page rendered ${actualLocale} at ${pageInfo.url}`);
      }

      // BƯỚC BẮT BUỘC — chặn chụp khi còn ảnh chưa decode.
      const label = `${t.path} @${width} (${args.locale})`;
      const img = await assertImagesReady(cdp, sessionId, label);

      const hidden = await cdp.evaluate(sessionId, HIDE_STICKY);
      await sleep(200);
      const shot = await fullPagePng(cdp, sessionId, width);
      const file = path.join(TMP, `${t.slug}-${args.locale}-${width}.png`);
      fs.writeFileSync(file, shot.buf);

      // AUDIT PIXEL — bắt ảnh "decode xong nhưng tile bị discard → ô trống" (cùng phiên).
      const audit = await auditBlankRegions(cdp, sessionId, shot.buf, shot.width, { label });
      if (audit.blank.length) {
        throw new Error(
          `[audit] ${label}: ${audit.blank.length}/${audit.total} ảnh RA Ô TRỐNG trong ảnh chụp ` +
            `(đã decode nhưng chưa raster). KHÔNG giao ảnh.\n` +
            audit.blank.map((b) => `    ✗ ${b.src}  stdev=${b.maxStdev}`).join("\n")
        );
      }

      report.push({ path: t.path, width, ...img, hidden, file, h: shot.height, audited: audit.total });
      log(`✓ ${label.padEnd(46)} ảnh ${img.ready}/${img.total} OK · pixel audit ${audit.total}/${audit.total} · ẩn ${hidden} sticky · ${shot.width}×${shot.height}`);
      if (img.allowed) log(`  · bỏ qua ${img.allowed} ảnh 404 cố ý`);

      await cdp.send("Target.closeTarget", { targetId: (await cdp.send("Target.getTargets")).targetInfos.find((x) => x.url.startsWith(BASE))?.targetId }, sessionId).catch(() => {});
    }
  }
} finally {
  clearTimeout(guard);
  try { cdp.close(); } catch {}
  try { edge.kill(); } catch {}
}

/* ---------- ghép contact sheet ---------- */
if (args.sheet && report.length) {
  const sharp = (await import("sharp")).default;
  const PAD = 32, LABEL_H = 56, GAP = 32;
  const totalW = report.reduce((s, x) => s + x.width, 0) + PAD * 2 + GAP * (report.length - 1);
  const maxH = Math.max(...report.map((r) => r.h));
  const composites = [];
  let x = PAD;
  for (const r of report) {
    composites.push({ input: await sharp(r.file).png().toBuffer(), left: x, top: PAD + LABEL_H });
    composites.push({
      input: Buffer.from(
        `<svg width="${r.width}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">` +
          `<rect width="100%" height="100%" fill="#1d1d1f"/>` +
          `<text x="16" y="36" fill="#f5f5f7" font-family="Arial, sans-serif" font-size="22" font-weight="700">` +
          `${args.locale.toUpperCase()} · ${r.width}px · ${r.path} · ảnh ${r.ready}/${r.total}</text></svg>`
      ),
      left: x,
      top: PAD,
    });
    x += r.width + GAP;
  }
  const out = path.join(TMP, `contact-sheet-${args.locale}.png`);
  await sharp({ create: { width: totalW, height: maxH + PAD * 2 + LABEL_H, channels: 3, background: "#e8e8ed" } })
    .composite(composites)
    .png()
    .toFile(out);
  log(`\n★ Contact sheet: ${out} (${totalW}×${maxH + PAD * 2 + LABEL_H})`);
}

/* ---------- tóm tắt ---------- */
log("\n--- Tóm tắt ảnh load OK / tổng ---");
for (const r of report) log(`  ${r.path.padEnd(34)} ${String(r.width).padStart(4)}px  ${r.ready}/${r.total}`);
