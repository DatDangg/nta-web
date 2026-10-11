/**
 * capture.mjs — chụp ảnh 4 trang giải pháp (HRM mock + 3 app thật).
 *
 * Chạy:
 *   node scripts/screenshots/capture.mjs hrm              # chỉ HRM (mock, không cần mạng/creds)
 *   node scripts/screenshots/capture.mjs all              # cả 4 (3 app cần .env.local + mạng)
 *   node scripts/screenshots/capture.mjs crm --only=03    # chụp lại 1 màn
 *   node scripts/screenshots/capture.mjs lms --probe      # chỉ ghi lại request/response thật, không chụp
 *
 * Luồng mỗi ảnh: mở app @1328 CSS px (dsf 2) → chụp dài hết trang →
 *               render wrapper.html (khung macOS, xem design-tokens.md) → chụp wrapper → ra ảnh 2880px.
 * Crop (nếu shot có `crop`) cắt từ ảnh đã đóng khung theo toạ độ DOM đã đo trên trang app.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";
import { startServer, ROOT } from "./serve.mjs";
import { CDP, sleep } from "./cdp.mjs";
import { SHOTS, ORDER } from "./shots.mjs";
import { prepareLive, enableProbe, login, ENV, LIVE } from "./live.mjs";
import { ensureFakeLogo } from "./brand.mjs";

/* ---------- cấu hình cố định (đo từ ảnh cũ — design-tokens.md) ---------- */
const APP_WIDTH = 1328;      // bề rộng nội dung cửa sổ
const FRAME_WIDTH = 1440;    // khung: padding 56×2 + 1328
const PADDING = 56;          // padding quanh cửa sổ (CSS px)
const TITLEBAR = 51;         // cao thanh tiêu đề macOS (CSS px)
const DSF = 2;               // deviceScaleFactor → ảnh cuối 2880 px
const CROP_PAD = 12;         // viền thêm quanh vùng crop (CSS px)
const CROP_MAX_H = 620;      // trần chiều cao ảnh crop (CSS px)
const VIEWPORT_H = 900;      // chiều cao 1 "màn hình" — ảnh chụp giới hạn theo đây (xem `capHeight`)

const TMP = path.join(ROOT, ".tmp");
const PROFILE = path.join(TMP, "profile");

/* ---------- tham số dòng lệnh ---------- */
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--") && !a.includes("=")));
const opts = Object.fromEntries(
  args.filter((a) => a.includes("=")).map((a) => {
    const i = a.indexOf("=");
    return [a.slice(2, i), a.slice(i + 1)];
  })
);
const slugs = args.filter((a) => !a.startsWith("-"));
const targets = slugs.length ? (slugs[0] === "all" ? ORDER : slugs) : ORDER;
const only = opts.only ? opts.only.split(",").map((s) => s.trim()) : null;
const probe = flags.has("--probe");
const noCrops = flags.has("--no-crops");
const debug = flags.has("--debug");
const dump = flags.has("--dump");
const log = (...a) => console.log(...a);

/* ---------- Edge ---------- */
function findEdge() {
  const candidates = [
    process.env.EDGE_PATH,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/microsoft-edge",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ].filter(Boolean);
  for (const p of candidates) if (fs.existsSync(p)) return p;
  throw new Error("không tìm thấy Edge — đặt biến môi trường EDGE_PATH");
}

async function launchEdge(port) {
  const child = spawn(
    findEdge(),
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${PROFILE}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-features=Translate,MediaRouter,OptimizationHints,HttpsUpgrades,HttpsFirstModeV2,HttpsFirstBalancedModeAutoEnable",
      "--ignore-certificate-errors",
      "--hide-scrollbars",
      "--force-color-profile=srgb",
      "--font-render-hinting=none",
      `--window-size=${FRAME_WIDTH},900`,
      "about:blank",
    ],
    { stdio: "ignore", detached: false }
  );
  child.on("error", (e) => log("[edge] lỗi:", e.message));
  return child;
}

/* ---------- mở khóa chiều cao: sidebar/app shell bị ghim theo viewport ---------- */
/**
 * 3 app demo đều là "app ghim khung": sidebar `fixed`/`sticky` + `h-screen`, hoặc cả shell
 * `position: fixed` + cuộn nội bộ. Chụp full-page thì sidebar bị cụt (LMS/CRM) hoặc nội dung
 * bị cắt mất (DentGo — chỉ chụp đúng 1 viewport).
 * → Trước khi chụp, bỏ ràng buộc `height = 100vh` và `overflow: hidden/auto` bên trong app,
 *   rồi chuyển sidebar về `position: static` cho nó kéo dài hết trang.
 */
const unlockHeight = () => `(() => {
  const vh = window.innerHeight;
  // Duyệt TOÀN BỘ phần tử trong body: với DentGo, shell "position: fixed" nằm NGOÀI
  // .internal-shell-grid nên chỉ duyệt bên trong một root sẽ không mở khoá được.
  const kill = [];
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (/(hidden|auto|scroll)/.test(cs.overflowY) || /(hidden|auto|scroll)/.test(cs.overflowX)) kill.push(el);
    if (cs.height === vh + "px" || cs.minHeight === vh + "px") kill.push(el);
  }
  for (const el of new Set(kill)) {
    el.style.overflow = "visible";
    el.style.height = "auto";
    el.style.minHeight = "0px";
    // Quan trọng: phần tử position:fixed dù đổi height vẫn KHÔNG tham gia chiều cao trang
    // → phải bỏ position luôn (DentGo ghim cả app shell bằng fixed + inset-0).
    if (getComputedStyle(el).position === "fixed") el.style.position = "static";
  }
  document.querySelectorAll("html, body").forEach((el) => { el.style.height = "auto"; el.style.overflow = "visible"; });
  for (const sel of [".dashboard-sidebar", "aside.internal-sidebar", "aside.sticky", "aside"]) {
    for (const el of document.querySelectorAll(sel)) {
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") continue;
      el.style.position = "static";
      el.style.height = "auto";
      el.style.minHeight = "100%";
      el.style.alignSelf = "stretch";
    }
  }
  return document.documentElement.scrollHeight;
})()`;

/* ---------- kéo sidebar dài đều trang (ảnh full-page bị sidebar ngắn hơn nội dung) ---------- */
/**
 * LMS/CRM ghim sidebar theo viewport (`position: fixed`/`sticky` + `height: 900px`). Chụp full-page
 * (cao hơn viewport) thì sidebar dừng ở 900px còn vùng nội dung kéo dài tiếp → ảnh xấu, sidebar
 * bị "cụt". Khối tài khoản + nút đăng xuất trong app đẩy xuống đáy sidebar (`mt-auto`), nên khi
 * sidebar cao bằng cả trang thì khối đó rơi đúng đáy — đúng như mở app trong trình duyệt.
 *
 * KHÔNG đổi `position` của sidebar: app ghim nó ngoài luồng, ép `static` sẽ phá layout
 * (LMS mất chiều cao trang, rớt về trang đăng nhập). Chỉ nới `min-height` + thả `height` cứng,
 * giữ nguyên cấu trúc con: khối menu `flex: 1` tự giãn theo, chân sidebar (tài khoản + đăng
 * xuất) vẫn nằm sát đáy — đúng như lúc mở app trong trình duyệt.
 */
const stretchSidebar = () => `(() => {
  const pageY = window.scrollY;
  const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  const SEL = "aside, [class*=sidebar], [class*=sidenav]";
  const done = [];
  const cands = [...document.querySelectorAll(SEL)]
    // Bỏ phần tử nằm BÊN TRONG sidebar (nav, panel…) — nới chiều cao chúng sẽ phá layout sidebar.
    .filter((el) => !el.parentElement?.closest(SEL))
    .map((el) => ({ el, r: el.getBoundingClientRect(), cs: getComputedStyle(el) }))
    .filter(({ r }) => r.width >= 100 && r.width <= 460 && r.height >= 200);
  for (const { el, r, cs } of cands) {
    const top = Math.round(r.top + pageY);
    const target = Math.round(docH - top);
    if (target <= r.height + 2) continue;
    if (cs.position === "fixed") { el.style.top = top + "px"; el.style.bottom = "auto"; }
    el.style.height = "auto";
    el.style.minHeight = target + "px";
    done.push((el.tagName + "." + String(el.className).split(" ")[0]) + "=" + target);
  }
  return done.join(" | ") || "0";
})()`;

/* ---------- ẩn widget nổi (nút chat/support ghim đáy màn) ---------- */
/**
 * DentGo có nút tròn (headset) mở chat hỗ trợ, ghim `position: fixed` ở góc phải.
 * `unlockHeight` ép mọi `fixed` → `static` nên nút RƠI vào giữa luồng → ảnh có nút tròn
 * lơ lửng đè lên bảng dữ liệu. Đây là UI phụ của app, không thuộc nội dung minh hoạ.
 *
 * Nhận diện: phần tử `fixed`/`absolute` trong container `fixed`, nhỏ & vuông (≤ 140px),
 * bo tròn (≥ 40%), sát mép phải. Bỏ qua nút trong sidebar/nav (chúng kế thừa layout).
 * Gán cờ `__shotHidden` để không ẩn trùng khi chạy lại lượt hai.
 */
const hideFloatingWidgets = () => `(() => {
  const hidden = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.dataset.__shotHidden) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24 || r.width > 140 || r.height > 140) continue;
    const ratio = r.width / r.height;
    if (ratio < 0.75 || ratio > 1.35) continue;
    if (window.innerWidth - (r.right + window.scrollX) > 140) continue;
    if (el.closest("aside, nav")) continue;
    const cs = getComputedStyle(el);
    if (parseFloat(cs.borderRadius) < Math.min(r.width, r.height) * 0.4) continue;
    // dán nhãn truyện thống của nút hỗ trợ/chat
    const label = ((el.getAttribute("aria-label") || "") + " " + (el.className || "")).toLowerCase();
    if (!/hỗ trợ|hotro|ho tro|support|chat|zalo|help/.test(label)) continue;
    // ẩn từ container ra ngoài vào (vùng bọc fixed) để không sót vỏ ngoài
    let box = el, hid = [];
    for (let i = 0; i < 3 && box && box !== document.body; i++) {
      const bcs = getComputedStyle(box);
      if (bcs.position === "fixed" || bcs.position === "absolute") { hid.push(box); box = box.parentElement; continue; }
      if (bcs.position === "static" && box.parentElement && getComputedStyle(box.parentElement).position !== "static") { hid.push(box); box = box.parentElement; continue; }
      break;
    }
    if (!hid.length) hid = [el];
    for (const n of hid) { n.dataset.__shotHidden = "1"; n.style.display = "none"; }
    hidden.push((el.tagName + "[" + (el.getAttribute("aria-label") || "?") + "]") + " ẩn " + hid.length + " node");
  }
  return hidden.join(" | ") || "0";
})()`;

/* ---------- thu nhỏ trang quá rộng để không bị cắt mép phải ---------- */
/**
 * Bảng của app demo rộng hơn khung 1328px (DentGo: lịch hẹn 1510px, kho vật tư 1665px)
 * → cột cuối bị cắt, ảnh trông "chọc" UI. Dùng `zoom` trên `<html>`: Chrome co lại CẢ
 * cây layout (kể cả cách tính px của app) nên nội dung vừa khít khung thật, không cần
 * hack chiều cao bù như `transform: scale()`.
 *
 * Lặp tới khi vừa (tối đa 4 lần) vì `zoom` làm đổi `scrollWidth` → cần đo lại sau mỗi vòng.
 */
const fitPageWidth = () => `(() => {
  // Trang rộng hơn khung 1328px vì bảng có nhiều cột → nội dung bị cắt mép phải.
  // CÁCH ĐÚNG: chụp ở viewport rộng hơn (shot.appWidth) rồi để wrapper co ảnh về 1328.
  // Không dùng zoom: co nội dung tạo vùng trống lệch mép phải, ảnh trông vỡ khung.
  const widest = Math.max(
    window.innerWidth,
    ...[...document.querySelectorAll("body *")].map((el) => {
      const r = el.getBoundingClientRect();
      return r.width ? r.right + window.scrollX : 0;
    })
  );
  return widest > ${APP_WIDTH} + 8
    ? "⚠ tràn " + Math.round(widest) + "px — cần tăng appWidth cho shot này"
    : "0 (vừa khít " + Math.round(widest) + "px)";
})()`;

/* ---------- chẩn đoán (--dump): in cấu trúc phần tử tròn sát mép phải ---------- */
const dumpFloating = () => `(() => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.width > 140 || r.height < 24 || r.height > 140) continue;
    const ratio = r.width / r.height;
    if (ratio < 0.75 || ratio > 1.35) continue;
    if (window.innerWidth - (r.right + window.scrollX) > 140) continue;
    const cs = getComputedStyle(el);
    out.push([
      el.tagName,
      (String(el.className) || "").slice(0, 40),
      "pos=" + cs.position,
      "br=" + cs.borderRadius,
      "z=" + cs.zIndex,
      Math.round(r.width) + "x" + Math.round(r.height),
      "@" + Math.round(r.left) + "," + Math.round(r.top),
      "inAside=" + !!el.closest("aside, nav"),
      "txt=" + JSON.stringify((el.textContent || "").trim().slice(0, 20)),
      "html=" + el.outerHTML.slice(0, 90),
    ].join(" "));
  }
  return out.slice(0, 12);
})()`;

/* ---------- thay chữ trên DOM (chỉ để chụp ảnh: xoá brand/email thật của khách hàng) ---------- */
const patchTextNodes = (pairs) => `(() => {
  const pairs = ${JSON.stringify(pairs)};
  const walk = (node) => {
    if (node.nodeType === 3) {
      let t = node.nodeValue;
      for (const [re, rep] of pairs) t = t.replace(new RegExp(re, "gi"), rep);
      if (t !== node.nodeValue) node.nodeValue = t;
      return;
    }
    if (node.nodeType !== 1 || ["SCRIPT", "STYLE", "TEXTAREA", "NOSCRIPT"].includes(node.tagName)) return;
    for (const child of [...node.childNodes]) walk(child);
  };
  walk(document.body);
  return true;
})()`;

/* ---------- chụp ---------- */
async function setViewport(cdp, sessionId, width, height = 900) {
  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    { width, height, deviceScaleFactor: DSF, mobile: false, screenWidth: width, screenHeight: height },
    sessionId
  );
  // Cố định múi giờ: giờ trong fixtures ghi theo UTC → ảnh hiển thị đúng giờ đã soạn,
  // không bị lệch ngày do múi giờ máy chạy (VN +07).
  await cdp.send("Emulation.setTimezoneOverride", { timezoneId: "UTC" }, sessionId);
}

async function fullPagePng(cdp, sessionId, width, maxHeight = Infinity) {
  const raw = Math.ceil(
    (await cdp.evaluate(sessionId, "Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)")) || 900
  );
  // Ảnh cao lê thê (vd bảng lịch hẹn 2500 CSS px) trông như "cuộn trang" chứ không
  // phải ảnh sản phẩm — nhất là khi sidebar đã bị kéo dài, phần dưới là nền trắng.
  // Cắt ở `maxHeight`: giữ đúng phần đầu người xem thấy, tỉ lệ ảnh đồng nhất 4 sản phẩm.
  const height = Math.min(raw, maxHeight);
  const { data } = await cdp.send(
    "Page.captureScreenshot",
    { format: "png", captureBeyondViewport: true, fromSurface: true, clip: { x: 0, y: 0, width, height, scale: 1 } },
    sessionId
  );
  return { buf: Buffer.from(data, "base64"), width: width * DSF, height: height * DSF, truncated: raw > maxHeight, rawHeight: raw };
}

async function selectorRect(cdp, sessionId, selector) {
  if (!selector) return null;
  return cdp.evaluate(
    sessionId,
    `(() => { const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null; const r = el.getBoundingClientRect();
      return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height }; })()`
  );
}

/**
 * Tìm vùng theo chữ hiển thị: bỏ qua tiêu đề/span quá nhỏ, lấy hộp nhỏ nhất còn đủ lớn.
 * (Nhãn "TRỢ LÝ NHẬN XÉT" nằm trong span 194×15 — hộp cần crop là khối gradient 587×118.)
 */
async function textRect(cdp, sessionId, needle, minW = 300, minH = 60) {
  return cdp.evaluate(
    sessionId,
    `(() => { const needle = ${JSON.stringify(needle)}, minW = ${minW}, minH = ${minH};
      const box = (el) => { const r = el.getBoundingClientRect();
        return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height }; };
      const hits = [...document.querySelectorAll("body *")].filter((el) => (el.textContent || "").includes(needle));
      if (!hits.length) return null;
      const big = hits.filter((el) => { const b = box(el); return b.width >= minW && b.height >= minH; });
      const pool = big.length ? big : hits.filter((el) => !hits.some((o) => o !== el && el.contains(o)));
      if (!pool.length) return null;
      return box(pool.sort((a, b) => box(a).width * box(a).height - box(b).width * box(b).height)[0]);
    })()`
  );
}

/**
 * Vùng crop của 1 ảnh. `crop` (1 vùng) + `crops` (nhiều vùng có nhãn) →
 * file `<tên>-crop.png` và `<tên>-<nhãn>-crop.png`.
 * Mỗi vùng là CSS selector (`sel`) HOẶC chuỗi hiển thị (`text`).
 */
function cropTargets(shot) {
  const list = [];
  if (shot.crop) list.push({ as: "", spec: typeof shot.crop === "string" ? { sel: shot.crop } : shot.crop });
  for (const c of shot.crops ?? []) list.push({ as: typeof c === "string" ? "" : (c.as ?? ""), spec: typeof c === "string" ? { sel: c } : c });
  return list;
}
const resolveRect = (cdp, sessionId, spec) =>
  spec.text ? textRect(cdp, sessionId, spec.text) : selectorRect(cdp, sessionId, spec.sel);

/**
 * Cắt vùng từ ảnh đã đóng khung.
 *
 * `k` là hệ số co: khi shot chụp ở viewport rộng hơn 1328 (shot.appWidth), wrapper co
 * ảnh về đúng 1328 → toạ độ DOM của app phải nhân k mới khớp vị trí trong ảnh cuối.
 */
async function cropFromFramed(framedBuf, framedH, rect, k = 1) {
  const pad = CROP_PAD;
  const w = Math.round((rect.width * k + pad * 2) * DSF);
  const h = Math.round((Math.min(rect.height * k, CROP_MAX_H) + pad * 2) * DSF);
  const left = Math.max(0, Math.round((PADDING + rect.x * k - pad) * DSF));
  const top = Math.max(0, Math.round((PADDING + TITLEBAR + rect.y * k - pad) * DSF));
  const width = Math.min(w, FRAME_WIDTH * DSF - left);
  const height = Math.min(h, framedH - top);
  if (width < 40 || height < 40) return null;
  return sharp(framedBuf).extract({ left, top, width, height }).png().toBuffer();
}

async function frameShot(cdp, sessionId, { tmpRel, title }) {
  // Thêm "t=" để wrapper KHÔNG dùng ảnh cached của lần chạy trước (URL .tmp/app-*.png không đổi,
  // nên Edge trả ảnh cũ → khung ra ngắn hơn trang thật).
  const url = `${BASE}/wrapper.html?t=${Date.now()}&title=${encodeURIComponent(title)}&src=${encodeURIComponent(tmpRel)}`;
  await setViewport(cdp, sessionId, FRAME_WIDTH);
  await cdp.navigate(sessionId, url);
  await cdp.waitUntil(sessionId, 'window.__READY__ === true && document.fonts.status === "loaded"', { label: "wrapper sẵn sàng" });
  await sleep(150);
  return fullPagePng(cdp, sessionId, FRAME_WIDTH);
}

/* ---------- main ---------- */
fs.mkdirSync(TMP, { recursive: true });

const PORT = Number(process.env.SHOTS_PORT || 5599);
let server;
try {
  server = await startServer(PORT);
} catch (e) {
  if (e.code !== "EADDRINUSE") throw e;
  server = await startServer(PORT + 1);
}
const BASE = `http://127.0.0.1:${server.address().port}`;

// Logo giả cho app có brand thật trong bundle (CRM) — phải có TRƯỚC khi Edge tải trang.
await ensureFakeLogo();

const DEBUG_PORT = Number(process.env.SHOTS_DEBUG_PORT || 9333);
log(`▶ Edge (headless) · debug:${DEBUG_PORT} · server:${BASE}`);
const edge = await launchEdge(DEBUG_PORT);
const cdp = await CDP.connect(DEBUG_PORT);
// Profile Edge được giữ giữa các lần chạy → logo/JS cũ có thể đến từ cache và né rule chặn.
await cdp.send("Network.enable", {}).catch(() => {});
await cdp.send("Network.clearBrowserCache", {}).catch(() => {});
log("▶ CDP đã kết nối (đã xoá cache)");

const results = [];
let failures = 0;

for (const slug of targets) {
  const conf = SHOTS[slug];
  if (!conf) { log(`✖ không có cấu hình cho "${slug}"`); failures++; continue; }
  const fixture = JSON.parse(fs.readFileSync(path.join(ROOT, "fixtures", conf.fixture), "utf8"));
  const liveCfg = conf.mode === "live" ? LIVE[conf.product] : null;

  const { targetId, sessionId } = await cdp.newPage("about:blank");
  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);

  try {
    if (conf.mode === "live") {
      if (probe) {
        await enableProbe(cdp, sessionId, slug);
      } else {
        await prepareLive(cdp, sessionId, conf, fixture, { debug });
      }
      if (debug) {
        await cdp.send("Log.enable", {}, sessionId);
        cdp.on(sessionId, "Runtime.exceptionThrown", (p) =>
          log(`    [exc] ${String(p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text).split("\n")[0].slice(0, 300)}`)
        );
        cdp.on(sessionId, "Runtime.consoleAPICalled", (p) => {
          if (p.type !== "error" && p.type !== "warning") return;
          log(`    [console.${p.type}] ${p.args.map((a) => a.value ?? a.description ?? a.type).join(" ").replace(/\s+/g, " ").slice(0, 300)}`);
        });
        cdp.on(sessionId, "Log.entryAdded", (p) => {
          if (p.entry.level !== "error" && p.entry.level !== "warning") return;
          log(`    [log.${p.entry.level}] ${String(p.entry.text).replace(/\s+/g, " ").slice(0, 300)}`);
        });
      }
      const ok = await login(cdp, sessionId, conf);
      log(`  ${ok ? "✓" : "✖"} ${slug}: đăng nhập${ok ? "" : " THẤT BẠI"}`);
      if (!ok) { failures++; continue; }
      if (liveCfg?.afterLogin) {
        const step = await liveCfg.afterLogin(cdp, sessionId);
        log(`    → sau đăng nhập: ${step}`);
      }
    }

    const shots = only ? conf.shots.filter((s) => only.includes(s.name.split("-")[0])) : conf.shots;
    for (const shot of shots) {
      const route = typeof shot.route === "function" ? shot.route(fixture) : shot.route;
      const url = conf.mode === "mock" ? `${BASE}/mock-hrm/?screen=${shot.screen}` : joinUrl(conf, route);
      // Bề rộng chụp: mặc định 1328 (khung chuẩn). Shot bảng nhiều cột đặt `appWidth` rộng
      // hơn để không cắt cột — wrapper tự co ảnh về đúng 1328 nên khung vẫn đồng nhất.
      const appW = shot.appWidth ?? APP_WIDTH;
      await setViewport(cdp, sessionId, appW);
      await cdp.navigate(sessionId, url);
      if (debug) log(`  · [${shot.name}]`);

      if (conf.mode === "mock") {
        await cdp.waitUntil(sessionId, 'window.__READY__ === true && document.fonts.status === "loaded"');
      } else {
        await cdp.waitUntil(sessionId, 'document.readyState === "complete"');
        if (shot.wait) {
          try { await cdp.waitUntil(sessionId, `!!document.querySelector(${JSON.stringify(shot.wait)})`, { timeout: 20000 }); }
          catch { log(`    (cảnh báo) không thấy ${shot.wait} trên ${route}`); }
        }
        await sleep(shot.settle ?? 2000);
        // App ghim cứng theo viewport (cuộn nội bộ) → mở khóa chiều cao TRƯỚC khi chụp,
        // nếu không sẽ mất nội dung dưới 1 viewport. Chỉ bật cho sản phẩm có `unlockHeight`.
        // Riêng sidebar thì xử lý bằng `stretchSidebar` bên dưới — KHÔNG dùng `unlockHeight` cho nó
        // (ép `position: static` phá layout app).
        if (liveCfg?.unlockHeight) {
          const hUnlocked = await cdp.evaluate(sessionId, unlockHeight());
          if (debug) log(`    (mở khoá chiều cao → trang cao ${hUnlocked}px)`);
          await sleep(400);
        }
        // Sidebar ghim theo viewport → ảnh full-page bị sidebar ngắn hơn vùng nội dung.
        // Kéo sidebar dài đều trang (không đổi `position`) để ảnh không bị sidebar "cụt".
        if (liveCfg?.stretchSidebar) {
          const stretched = await cdp.evaluate(sessionId, stretchSidebar());
          if (debug) log(`    (kéo sidebar dài trang: ${stretched})`);
          await sleep(300);
        }
        // Bảng rộng hơn khung → cột cuối bị cắt mép phải (ảnh trông "chọc").
      // Ở đây chỉ CẢNH BÁO: cách đúng là chụp rộng hơn (shot.appWidth), không co nội dung.
      if (liveCfg?.fitTables !== false) {
        const fit = await cdp.evaluate(sessionId, fitPageWidth());
        if (debug) log(`    (đo bề rộng: ${fit})`);
      }
        // Chạy 2 lượt: React có thể re-render lại (component chưa tải xong) sau lượt đầu.
        if (liveCfg?.domPatch) {
          await cdp.evaluate(sessionId, patchTextNodes(liveCfg.domPatch));
          await sleep(400);
          await cdp.evaluate(sessionId, patchTextNodes(liveCfg.domPatch));
          if (debug) {
            log(`    (dom patch: còn "Dragon Hotpot"? ${await cdp.evaluate(sessionId, 'document.body.innerText.includes("Dragon Hotpot")')})`);
          }
        }
      }
      await sleep(200);

      const overflow = await cdp.evaluate(
        sessionId,
        `(() => { const bad = [];
          for (const el of document.querySelectorAll(".table-wrap, .att-wrap, .main")) {
            const d = el.scrollWidth - el.clientWidth;
            if (d > 1) bad.push((el.className || el.tagName) + " +" + d + "px");
          }
          return bad.join(" | "); })()`
      );
      if (overflow) log(`    ⚠ tràn ngang (sẽ bị cắt bên phải): ${overflow}`);

      // Key i18n chưa dịch lọt ra UI (vd "order.channelLabel.TAKEAWAY") = fixture dùng enum lạ.
      const rawKeys = await cdp.evaluate(
        sessionId,
        `(() => { const hit = [];
          for (const el of document.querySelectorAll("body *")) {
            if (el.children.length) continue;
            const t = (el.textContent || "").trim();
            if (t.length < 60 && /^[a-z][a-zA-Z]*\\.[a-zA-Z]+\\.[A-Za-z_]+$/.test(t)) hit.push(t);
          }
          return [...new Set(hit)].slice(0, 5).join(" | "); })()`
      );
      if (rawKeys) log(`    ⚠ i18n key chưa dịch (enum fixture lạ): ${rawKeys}`);

      if (probe) { log(`    · ${shot.name} → ${route}`); await sleep(1200); continue; }

      if (liveCfg?.domPatch) await cdp.evaluate(sessionId, patchTextNodes(liveCfg.domPatch));
      // Ẩn widget nổi (nút chat/support) — chạy SAU CÙNG, sau mọi thao tác DOM khác:
      // `unlockHeight` đã đổi `fixed` → `static`, nếu ẩn sớm thì React render lại sẽ khôi
      // phục nút, và lúc này nó nằm giữa luồng nên phải nhận diện theo cả `absolute`.
      if (liveCfg?.hideWidgets !== false) {
        if (dump) {
          const found = await cdp.evaluate(sessionId, dumpFloating());
          log(`    [dump] ${found.length} phần tử tròn sát mép phải:`);
          for (const row of found) log(`      - ${row}`);
        }
        const hid = await cdp.evaluate(sessionId, hideFloatingWidgets());
        if (hid !== "0") log(`    · ẩn widget nổi: ${hid}`);
        await sleep(250);
      }
      const cropSpecs = noCrops ? [] : cropTargets(shot);
      const cropRects = [];
      for (const t of cropSpecs) cropRects.push({ as: t.as, spec: t.spec, rect: await resolveRect(cdp, sessionId, t.spec) });
      // Trần chiều cao ảnh: giữ phần đầu người xem thấy thật, bỏ đuôi dài lê thê
      // (bảng lịch hẹn DentGo dài 2500 CSS px → ảnh 5030px, sidebar trắng 2/3 ảnh).
      const maxH = shot.maxHeight ?? VIEWPORT_H * 2;
      const app = await fullPagePng(cdp, sessionId, appW, maxH);
      if (app.truncated) log(`    · cắt chiều cao ${app.rawHeight} → ${maxH}px (bỏ đuôi dài)`);
      const tmpRel = `/.tmp/app-${slug}-${shot.name}.png`;
      fs.writeFileSync(path.join(TMP, `app-${slug}-${shot.name}.png`), app.buf);

      const framed = await frameShot(cdp, sessionId, { tmpRel, title: conf.title });
      const outDir = path.join(ROOT, "..", "..", conf.outDir);
      fs.mkdirSync(outDir, { recursive: true });
      const mainPath = path.join(outDir, `${shot.name}.png`);
      fs.writeFileSync(mainPath, framed.buf);

      let cropNote = "";
      for (const { as, spec, rect } of cropRects) {
        const label = as ? `${shot.name}-${as}` : shot.name;
        if (!rect) { cropNote += ` · bỏ crop ${as || "chính"} (không thấy "${spec.sel || spec.text}")`; continue; }
        const cropBuf = await cropFromFramed(framed.buf, framed.height, rect, APP_WIDTH / appW);
        if (!cropBuf) { cropNote += ` · bỏ crop ${as || "chính"} (vùng quá nhỏ)`; continue; }
        fs.writeFileSync(path.join(outDir, `${label}-crop.png`), cropBuf);
        cropNote += ` + crop ${as ? as + " " : ""}${Math.round(rect.width)}×${Math.round(Math.min(rect.height, CROP_MAX_H))}`;
      }
      log(`  ✓ ${slug}/${shot.name}.png  ${app.width}px${appW !== APP_WIDTH ? ` (chụp ${appW}px, co về ${APP_WIDTH})` : ""}→${framed.width}px${cropNote}`);
      results.push({ slug, name: shot.name, app: `${app.width}×${app.height}`, framed: `${framed.width}×${framed.height}`, crop: shot.crop ?? "" });
    }
  } catch (e) {
    failures++;
    log(`  ✖ ${slug}: ${e.message}`);
  } finally {
    try { await cdp.send("Target.closeTarget", { targetId }); } catch { /* đóng cùng tiến trình Edge */ }
  }
}

log("");
log(`Xong: ${results.length} ảnh, ${failures} lỗi.`);
server.close();
cdp.close();
edge.kill();
process.exit(failures ? 1 : 0);

function joinUrl(conf, route) {
  const key = { lms: "LMS_URL", crm: "CRM_URL", dentgo: "DENTGO_URL" }[conf.product];
  const base = ENV[key];
  if (!base) throw new Error(`thiếu ${key} trong .env.local`);
  return `${base.replace(/\/$/, "")}${route.startsWith("/") ? route : `/${route}`}`;
}
