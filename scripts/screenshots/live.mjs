/**
 * live.mjs — đăng nhập + chặn API cho 3 app thật (LMS / CRM / DentGo).
 *
 * Nguyên tắc: app thật, dữ liệu giả. Mọi phản hồi API được trả bằng
 * `fixtures/<slug>.json` (đã sinh bởi build-*-fixture.mjs) → ảnh chụp không lộ
 * tên/SĐT/URL hệ thống của khách hàng thật.
 *
 * `--probe` (xem capture.mjs) chỉ ghi lại request/response thật để đối chiếu,
 * KHÔNG thay dữ liệu và KHÔNG chụp — dùng khi app đổi API.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./serve.mjs";
import { sleep } from "./cdp.mjs";
import { FAKE_LOGO } from "./brand.mjs";

export const ENV = readEnvLocal();

function readEnvLocal() {
  const file = path.join(ROOT, "..", "..", ".env.local");
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const creds = (product) => {
  const U = product.toUpperCase();
  return { base: (ENV[`${U}_URL`] ?? "").replace(/\/$/, ""), username: ENV[`${U}_USERNAME`], password: ENV[`${U}_PASSWORD`] };
};

/* ---------- bảng chặn API: regex URL → payload từ fixture ---------- */
const env = (data) => ({ success: true, data, meta: { page: 1, pageSize: 100, total: Array.isArray(data) ? data.length : 1 } });

/* ---------- helper cho rule cần đọc query của URL ---------- */
const qOf = (url) => {
  try { return new URL(url).searchParams; } catch { return new URLSearchParams(); }
};
const dayOf = (isoStr) => String(isoStr || "").slice(0, 10);
/** Lịch hẹn: `?date=` lọc 1 ngày, `?fromDate&toDate` lọc theo khoảng (màn lịch tháng). */
const pickAppointments = (list, url) => {
  const q = qOf(url);
  const date = q.get("date");
  const from = q.get("fromDate");
  const to = q.get("toDate");
  return list.filter((a) => {
    const d = dayOf(a.startsAt);
    if (date) return d === date;
    if (from && to) return d >= from && d <= to;
    return true;
  });
};
/** Ca khám: `?date=` lọc theo ngày của appointment gắn kèm. */
const pickVisits = (list, url) => {
  const date = qOf(url).get("date");
  return date ? list.filter((v) => dayOf(v.appointment?.startsAt) === date) : list;
};
/** `/patients/{id}/visits` → trả hồ sơ + lịch sử khám của đúng bệnh nhân đó. */
const patientVisits = (F, url) => {
  const m = /\/patients\/([^/?]+)\/visits/.exec(url);
  const p = F.patients.find((x) => x.id === (m ? m[1] : null)) || F.patients[0];
  return {
    patientProfile: p,
    visits: F.visits.filter((v) => v.appointment?.patientProfileId === p.id),
    appointments: F.appointments.filter((a) => a.patientProfileId === p.id),
  };
};

export const LIVE = {
  lms: {
    loginPath: "/login",
    loggedIn: 'document.querySelector("a[href*=workspace], nav, aside")',
    apiTest: /\/v1\//,
    // Sidebar `position: fixed` + `height: 900px` → ảnh full-page bị sidebar ngắn hơn nội dung.
    stretchSidebar: true,
    domPatch: [
      ["Trường Tiểu học Phương Nam", "Trường Tiểu học Minh Châu"],
      ["Trường Tiểu học Hoàng Văn Thụ", "Trường Tiểu học Hoa Phượng"],
      ["Trường Tiểu học Nguyễn Bỉnh Khiêm", "Trường Tiểu học Bình Minh"],
      ["TH_PN", "TH_MC"],
      ["TH_HVT", "TH_HP"],
      ["TH_NBK", "TH_BM"],
      ["Nguyễn Thanh Hà", "Phạm Quang Vinh"],
    ],
    // App đa trường: sau khi đăng nhập phải chọn 1 trường thì API mới trả dữ liệu (không thì 403).
    afterLogin: async (cdp, sessionId) => {
      const base = ENV.LMS_URL.replace(/\/$/, "");
      await cdp.navigate(sessionId, `${base}/select-tenant`);
      await cdp.waitUntil(sessionId, 'document.body.innerText.includes("chọn trường")', { timeout: 30000, label: "trang chọn trường" });
      const picked = await cdp.evaluate(
        sessionId,
        `(() => { const b = [...document.querySelectorAll("button,a,[role=button]")]
            .find((e) => /Minh Châu|Phương Nam/i.test(e.innerText || ""));
          if (!b) return null; b.click(); return (b.innerText || "").replace(/\\s+/g, " ").slice(0, 60); })()`
      );
      if (!picked) throw new Error("không thấy nút chọn trường");
      await cdp.waitUntil(sessionId, "location.pathname !== '/select-tenant'", { timeout: 30000, label: "vào được trường" });
      await cdp.waitUntil(sessionId, 'document.readyState === "complete"', { timeout: 60000 }).catch(() => {});
      // App xếp thao tác đăng nhập vào hàng đợi ngoại tuyến → hiện banner "Đã có mạng trở lại"
      // trên mọi ảnh. Xoá hàng đợi này (dữ liệu chỉ nằm trong profile chụp ảnh).
      await cdp.evaluate(
        sessionId,
        '(() => { const m = Object.keys(localStorage).filter((k) => /offline_queue/i.test(k)); m.forEach((k) => localStorage.removeItem(k)); return m.length; })()'
      );
      return picked;
    },
    rules: [
      { test: /\/workspace\/scope/, body: (F) => F.workspace.scope },
      { test: /\/workspace\/dashboard/, body: (F) => F.workspace },
      { test: /\/tasks\/dashboard/, body: (F) => env(F.taskStats) },
      { test: /\/notifications\/my/, body: (F) => env(F.notifications) },
      { test: /\/system-config\/branding/, body: () => env([]) },
      { test: /\/academic-years\/[^/?]+\/semesters/, body: (F) => env([F.meta.semester]) },
      { test: /\/academic-years/, body: (F) => env([F.meta.academicYearRow]) },
      { test: /\/campuses/, body: (F) => env([F.meta.campusRow]) },
      { test: /\/rooms/, body: (F) => env(F.rooms) },
      // API thật trả envelope {success, data: <số>} — trả thẳng số sẽ khiến app render
      // String({...}) = "[object Object]" (app lấy `data` rồi String() thẳng).
      { test: /\/students\/count/, body: (F) => env(F.students.length) },
      { test: /\/grade-blocks/, body: (F) => env(F.gradeBlocks) },
      { test: /\/subjects/, body: (F) => env(F.subjects) },
      { test: /\/comment-templates/, body: (F) => env(F.commentTemplates) },
      { test: /\/tt27\/regular-comments/, body: (F) => env(F.tt27Comments) },
      { test: /\/lesson-plans/, body: (F) => env(F.lessonPlans) },
      { test: /\/academic-records/, body: (F) => env(F.academicRecords) },
      { test: /\/timetables/, body: (F) => env(F.timetables) },
      { test: /\/parents/, body: (F) => env(F.parents) },
      { test: /\/staff/, body: (F) => env(F.staff) },
      { test: /\/classes/, body: (F) => env(F.classes) },
      { test: /\/students/, body: (F) => env(F.students) },
    ],
  },

  crm: {
    loginPath: "/login",
    loggedIn: 'document.querySelector("nav, aside, [class*=sidebar]")',
    apiTest: /\/api\//,
    // Sidebar `position: sticky` + `h-screen` → ảnh full-page bị sidebar ngắn hơn nội dung.
    stretchSidebar: true,
    // Logo nằm trong bundle app (`/logo-256.png`) — domPatch không sửa được ảnh → trả logo giả.
    staticRules: [{ test: /\/logo[^/]*\.(png|jpe?g|svg|webp|ico)$/i, file: () => FAKE_LOGO }],
    domPatch: [
      // thứ tự quan trọng: email trước, rồi mới tới tên chuỗi (tránh ăn vào trong email)
      ["[\\w.+-]+@dragonhotpot[\\w.-]*", "owner@example.com"],
      ["Sichuan\\s*·\\s*Riverside", "Nướng & Lẩu · Quận 3 · TP.HCM"],
      ["Dragon\\s*Hot\\s*Pot[^·]*", "Hồng Phúc Nướng & Lẩu"],
      ["Owner\\s*Admin", "Trần Quốc Khánh"],
      // "CukCuk" là tên hệ POS mà khách hàng thật đang dùng → ghi chung cho trung tính
      ["CukCuk", "POS"],
    ],
    rules: [
      { test: /\/dashboard\/summary/, body: (F) => F.dashboard },
      { test: /\/customers\/[^/?]+/, body: (F) => F.customerDetail },
      { test: /\/customers/, body: (F) => ({ data: F.customers, page: 1, pageSize: F.customers.length, total: F.customers.length, totalPages: 1 }) },
      { test: /\/visits/, body: (F) => ({ data: F.reservations, page: 1, pageSize: F.reservations.length, total: F.reservations.length, totalPages: 1 }) },
      { test: /\/orders/, body: (F) => ({ data: F.orders, page: 1, pageSize: F.orders.length, total: F.orders.length, totalPages: 1 }) },
      { test: /\/branches/, body: (F) => F.branches },
      { test: /\/loyalty\/tiers/, body: () => [{ code: "MEMBER", nameVi: "Thành Viên" }, { code: "GOLD", nameVi: "Vàng" }, { code: "PLATINUM", nameVi: "Bạch Kim" }] },
    ],
  },

  dentgo: {
    loginPath: "/login",
    loggedIn: '!document.querySelector("input[type=password]") && !/\\/login/.test(location.pathname)',
    apiTest: /\/api\//,
    // Cả app ghim bằng `position: fixed` + cuộn nội bộ → chụp full-page chỉ lấy 1 viewport,
    // mất nội dung bên dưới. Bật unlock chiều cao cho riêng sản phẩm này (xem capture.mjs).
    // KHÔNG bật cho LMS/CRM: sidebar `fixed`/`sticky` của chúng nằm ngoài luồng, ép `static`
    // sẽ phá layout (LMS mất chiều cao trang, thậm chí rớt về trang đăng nhập).
    unlockHeight: true,
    // Thứ tự quan trọng: rule cụ thể (clinical/…/dental-record, patients/{id}/visits, appointments/options)
    // phải đứng TRƯỚC rule tổng quát cùng tiền tố (patients, appointments).
    rules: [
      { test: /\/auth\/me/, body: (F) => F.authMe },
      { test: /\/subscription\/current/, body: (F) => F.subscription },
      { test: /\/zalo\/conversations/, body: (F) => F.zaloConversations },
      { test: /\/support\/conversation\/unread-count/, body: (F) => F.unread },
      { test: /\/admin\/branches/, body: (F) => ({ branches: F.branches }) },
      { test: /\/appointments\/options/, body: (F) => F.appointmentsOptions },
      { test: /\/dashboard\/financial-summary/, body: (F) => F.financialSummary },
      { test: /\/clinical\/patients\/[^/?]+\/dental-records/, body: () => ({ records: [] }) },
      { test: /\/clinical\/patients\/[^/?]+\/dental-record/, body: (F) => ({ record: F.dentalRecord }) },
      { test: /\/patients\/[^/?]+\/visits/, body: (F, url) => patientVisits(F, url) },
      { test: /\/patients/, body: (F) => ({ patients: F.patients, pagination: { page: 1, pageSize: 30, total: F.patients.length, totalPages: 1 } }) },
      { test: /\/appointments/, body: (F, url) => ({ appointments: pickAppointments(F.appointments, url) }) },
      { test: /\/visits/, body: (F, url) => ({ visits: pickVisits(F.visits, url) }) },
      { test: /\/inventory\/items/, body: (F) => ({ items: F.inventory }) },
    ],
  },
};

/* ---------- chặn API ---------- */
export async function prepareLive(cdp, sessionId, conf, fixture, { debug = false } = {}) {
  const cfg = LIVE[conf.product];
  await cdp.send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] }, sessionId);
  cdp.on(sessionId, "Fetch.requestPaused", async (p) => {
    // Tài nguyên tĩnh cần thay (logo brand nằm trong bundle app) — kiểm tra TRƯỚC apiTest.
    const stat = cfg.staticRules?.find((r) => r.test.test(p.request.url));
    if (stat) {
      try {
        const buf = fs.readFileSync(stat.file());
        if (debug) console.log(`    [logo giả] ${p.request.url.replace(/^https?:\/\/[^/]+/, "")}`);
        await cdp.send("Fetch.fulfillRequest", {
          requestId: p.requestId,
          responseCode: 200,
          responseHeaders: [
            { name: "content-type", value: "image/png" },
            { name: "cache-control", value: "no-store" },
            { name: "access-control-allow-origin", value: "*" },
          ],
          body: buf.toString("base64"),
        }, sessionId);
      } catch { /* file chưa sinh — để request đi tiếp */ }
      return;
    }
    const isApi = cfg.apiTest.test(p.request.url);
    const rule = isApi ? cfg.rules.find((r) => r.test.test(p.request.url)) : null;
    try {
      // Preflight (CORS) phải để server thật trả lời — tự bịa response sẽ làm browser chặn request.
      if (rule && p.request.method === "OPTIONS") {
        await cdp.send("Fetch.continueRequest", { requestId: p.requestId }, sessionId);
        return;
      }
      if (rule) {
        const payload = rule.body(fixture, p.request.url);
        if (debug) {
          const kind = Array.isArray(payload) ? `array(${payload.length})` : typeof payload === "object" ? `object{${Object.keys(payload).slice(0, 6).join(",")}}` : typeof payload;
          console.log(`    [fulfill] ${p.request.method} ${p.request.url.replace(/^https?:\/\/[^/]+/, "")} → ${kind}`);
        }
        const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
        await cdp.send("Fetch.fulfillRequest", { requestId: p.requestId, responseCode: 200, responseHeaders: corsHeaders(p.request), body }, sessionId);
      } else {
        await cdp.send("Fetch.continueRequest", { requestId: p.requestId }, sessionId);
      }
    } catch { /* request có thể đã bị huỷ khi trang điều hướng */ }
  });
}

/** Header CORS cho response tự trả (app và API khác origin — không có sẽ bị browser chặn). */
function corsHeaders(request) {
  const h = request.headers ?? {};
  const origin = h.Origin ?? h.origin ?? "*";
  const headers = [
    { name: "content-type", value: "application/json; charset=utf-8" },
    { name: "access-control-allow-origin", value: origin },
    { name: "access-control-allow-methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
    { name: "access-control-allow-headers", value: h["Access-Control-Request-Headers"] ?? "authorization,content-type" },
    { name: "vary", value: "Origin" },
  ];
  if (origin !== "*") headers.push({ name: "access-control-allow-credentials", value: "true" });
  return headers;
}

/* ---------- đăng nhập ---------- */
const SET_VALUE = (sel, value) => `(() => {
  const el = document.querySelector(${JSON.stringify(sel)});
  if (!el) return false;
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
})()`;

const FIRST_MATCH = (selectors) =>
  `(() => { const list = ${JSON.stringify(selectors)};
    for (const s of list) { const el = document.querySelector(s); if (el) return s; }
    return null; })()`;

export async function login(cdp, sessionId, conf) {
  const cfg = LIVE[conf.product];
  const c = creds(conf.product);
  if (!c.base) throw new Error(`thiếu ${conf.product.toUpperCase()}_URL trong .env.local`);
  if (!c.username || !c.password) throw new Error(`thiếu user/password trong .env.local cho ${conf.product}`);

  const loginUrl = `${c.base}${cfg.loginPath}`;
  // Xoá storage của origin app trước khi đăng nhập: profile Edge được giữ lại giữa các lần chạy,
  // token/offline-queue cũ làm app tự đăng xuất (`?expired=1`).
  await cdp.send("Storage.clearDataForOrigin", { origin: new URL(c.base).origin, storageTypes: "all" }).catch(() => {});
  await cdp.navigate(sessionId, loginUrl);
  const hasForm = () => cdp.evaluate(sessionId, '!!document.querySelector("input[type=password]")').catch(() => false);
  const here = () => cdp.evaluate(sessionId, "location.href").catch(() => "");

  // Chờ form đăng nhập — nếu profile còn session thì app đã vào trong, không cần đăng nhập lại.
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (await hasForm()) break;
    const url = await here();
    if (url && !/login/i.test(url) && (await cdp.evaluate(sessionId, cfg.loggedIn).catch(() => false))) return true;
    await sleep(300);
  }
  if (!(await hasForm())) {
    const text = await cdp.evaluate(sessionId, "document.body.innerText.slice(0,300)").catch(() => "");
    console.log(`    (login) không thấy form đăng nhập · ${await here()} · "${String(text).replace(/\s+/g, " ")}"`);
    return false;
  }

  const userSel = await cdp.evaluate(
    sessionId,
    FIRST_MATCH([
      'input[type=email]',
      'input[placeholder*="Tên đăng nhập" i]',
      'input[placeholder*="tài khoản" i]',
      'input[placeholder*="email" i]',
      'input[placeholder*="SĐT" i]',
      'input[placeholder*="điện thoại" i]',
      'input[name*=user i]',
      'input[name*=email i]',
      'input[name*=phone i]',
      'input[id*=user i]',
      'form input:not([type=password]):not([type=hidden]):not([type=checkbox]):not([type=submit]):not([type=radio])',
      'input:not([type=password]):not([type=hidden]):not([type=checkbox]):not([type=submit]):not([type=radio])',
    ])
  );
  const passSel = await cdp.evaluate(sessionId, FIRST_MATCH(['input[type=password]']));
  if (!userSel || !passSel) {
    console.log("    (login) thiếu ô nhập — user:", userSel, "pass:", passSel);
    return false;
  }
  await cdp.evaluate(sessionId, SET_VALUE(userSel, c.username));
  await cdp.evaluate(sessionId, SET_VALUE(passSel, c.password));
  const clicked = await cdp.evaluate(
    sessionId,
    `(() => {
      const cands = [...document.querySelectorAll("button, input[type=submit], a[role=button]")];
      const pick = cands.find((b) => /đăng\\s*nhập|login|sign\\s*in/i.test(b.innerText || b.value || ""));
      if (pick) { pick.click(); return "button:" + (pick.innerText || pick.value || "").trim(); }
      const form = document.querySelector("form");
      if (form) { form.requestSubmit ? form.requestSubmit() : form.submit(); return "form"; }
      return null;
    })()`
  );
  console.log(`    (login) submit qua ${clicked}`);
  try {
    await cdp.waitUntil(sessionId, `!document.querySelector("input[type=password]")`, { timeout: 30000, label: "đăng nhập xong" });
  } catch {
    const text = await cdp.evaluate(sessionId, "document.body.innerText.slice(0,200)").catch(() => "");
    console.log(`    (login) vẫn còn form sau khi submit · ${await here()} · "${String(text).replace(/\s+/g, " ")}"`);
    return false;
  }
  await cdp.waitUntil(sessionId, 'document.readyState === "complete"', { timeout: 60000 }).catch(() => {});
  return true;
}

/* ---------- probe: chỉ ghi lại cấu trúc traffic thật (KHÔNG ghi giá trị → không lộ dữ liệu) ---------- */
function shape(v, depth = 0) {
  if (Array.isArray(v)) return `[${v.length}${v.length && depth < 2 ? ` of ${shape(v[0], depth + 1)}` : ""}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).slice(0, 26).join(",")}}`;
  return v === null ? "null" : typeof v;
}

export async function enableProbe(cdp, sessionId, slug) {
  const file = path.join(ROOT, ".tmp", `probe-${slug}.log`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `===== probe ${slug} · ${new Date().toISOString()} (chỉ ghi cấu trúc) =====\n`);

  await cdp.send("Network.enable", {}, sessionId);
  cdp.on(sessionId, "Network.requestWillBeSent", (p) => {
    if (p.type !== "XHR" && p.type !== "Fetch") return;
    fs.appendFileSync(file, `→ [${p.request.method}] ${p.request.url}\n`);
  });
  cdp.on(sessionId, "Network.responseReceived", async (p) => {
    if (p.type !== "XHR" && p.type !== "Fetch") return;
    if (!(p.response.mimeType ?? "").includes("json")) {
      fs.appendFileSync(file, `← ${p.response.status} ${p.response.mimeType} ${p.response.url}\n`);
      return;
    }
    try {
      const { body } = await cdp.send("Network.getResponseBody", { requestId: p.requestId }, sessionId);
      const json = JSON.parse(body);
      const inner = json && typeof json === "object" && "data" in json ? `\n      data: ${shape(json.data)}` : "";
      fs.appendFileSync(file, `← ${p.response.status} JSON ${p.response.url}\n    ${shape(json)}${inner}\n`);
    } catch {
      fs.appendFileSync(file, `← ${p.response.status} JSON (không đọc được body) ${p.response.url}\n`);
    }
  });
}
