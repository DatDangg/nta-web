/**
 * inspect.mjs — soi cấu trúc 1 trang (URL/title/input/button/text).
 *
 * Dùng khi trang đăng nhập hoặc route của app thật đổi:
 *   node scripts/screenshots/inspect.mjs https://example.com/login
 *   node scripts/screenshots/inspect.mjs            # mặc định LMS_URL trong .env.local
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CDP, sleep } from "./cdp.mjs";
import { ENV } from "./live.mjs";
import { ROOT } from "./serve.mjs";

const url = process.argv[2] || ENV.LMS_URL || ENV.CRM_URL || ENV.DENTGO_URL;
if (!url) throw new Error("thiếu URL — truyền tham số hoặc khai *_URL trong .env.local");

const DEBUG_PORT = 9334;
const TMP = path.join(ROOT, ".tmp");
fs.mkdirSync(TMP, { recursive: true });

const edgePath = [
  process.env.EDGE_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean).find((p) => fs.existsSync(p));

const edge = spawn(
  edgePath,
  [
    "--headless=new",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${path.join(TMP, "profile")}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--ignore-certificate-errors",
    "--disable-features=HttpsUpgrades,HttpsFirstModeV2,HttpsFirstBalancedModeAutoEnable",
    "--window-size=1440,900",
    "about:blank",
  ],
  { stdio: "ignore" }
);

const cdp = await CDP.connect(DEBUG_PORT);
const { sessionId } = await cdp.newPage("about:blank");
await cdp.navigate(sessionId, url);
try {
  await cdp.waitUntil(sessionId, 'document.readyState === "complete"', { timeout: 30000 });
} catch { /* trang chậm */ }
await sleep(2500);

const info = await cdp.evaluate(
  sessionId,
  `(() => ({
    url: location.href,
    title: document.title,
    inputs: [...document.querySelectorAll("input, textarea, select")].map((i) => [i.tagName.toLowerCase(), i.type || "", i.name || i.id || "", i.placeholder || ""].join(" | ")),
    buttons: [...document.querySelectorAll("button, a[role=button], input[type=submit]")].map((b) => (b.innerText || b.value || "").trim().slice(0, 40)).filter(Boolean).slice(0, 25),
    links: [...document.querySelectorAll("a")].map((a) => a.getAttribute("href")).filter(Boolean).slice(0, 25),
    text: (document.body.innerText || "").replace(/\\s+/g, " ").slice(0, 800),
  }))()`
);

console.log("URL      :", info.url);
console.log("TITLE    :", info.title);
console.log("TEXT     :", info.text);
console.log("INPUTS   :");
for (const i of info.inputs) console.log("   ", i);
console.log("BUTTONS  :", info.buttons.join(" · "));
console.log("LINKS    :", info.links.join(" · "));

cdp.close();
edge.kill();
process.exit(0);
