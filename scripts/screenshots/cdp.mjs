/**
 * cdp.mjs — client CDP tối giản (Edge/Chromium qua WebSocket có sẵn trong Node ≥ 22).
 * Không dùng playwright/puppeteer: repo không cài 2 thư viện này và không cần thêm dependency.
 */

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class CDP {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(typeof ev.data === "string" ? ev.data : ev.data.toString());
      if (msg.id !== undefined) {
        const slot = this.pending.get(msg.id);
        if (!slot) return;
        this.pending.delete(msg.id);
        if (msg.error) slot.reject(new Error(`${slot.method}: ${msg.error.message}`));
        else slot.resolve(msg.result ?? {});
        return;
      }
      const key = `${msg.sessionId ?? ""}|${msg.method}`;
      for (const fn of this.listeners.get(key) ?? []) fn(msg.params, msg.sessionId);
    });
  }

  static async connect(port, { timeout = 20000 } = {}) {
    const deadline = Date.now() + timeout;
    let info = null;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (res.ok) { info = await res.json(); break; }
      } catch {
        /* Edge chưa mở cổng debug — thử lại */
      }
      await sleep(250);
    }
    if (!info) throw new Error(`không kết nối được cổng debug ${port} — Edge có mở không?`);
    const ws = new WebSocket(info.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    return new CDP(ws);
  }

  send(method, params = {}, sessionId) {
    const id = ++this.seq;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify(payload));
    });
  }

  on(sessionId, event, handler) {
    const key = `${sessionId ?? ""}|${event}`;
    const list = this.listeners.get(key) ?? [];
    list.push(handler);
    this.listeners.set(key, list);
    return () => this.listeners.set(key, (this.listeners.get(key) ?? []).filter((f) => f !== handler));
  }

  waitFor(sessionId, event, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const off = this.on(sessionId, event, (params) => { off(); resolve(params); });
      setTimeout(() => { off(); reject(new Error(`timeout chờ ${event}`)); }, timeout);
    });
  }

  async newPage(url = "about:blank") {
    const { targetId } = await this.send("Target.createTarget", { url });
    const { sessionId } = await this.send("Target.attachToTarget", { targetId, flatten: true });
    return { targetId, sessionId };
  }

  /** Điều hướng và chờ load xong (Page.loadEventFired) — bỏ qua nếu trang đã load trước đó. */
  async navigate(sessionId, url, timeout = 60000) {
    await this.send("Page.enable", {}, sessionId);
    const loaded = this.waitFor(sessionId, "Page.loadEventFired", timeout);
    await this.send("Page.navigate", { url }, sessionId);
    try { await loaded; } catch { /* SPA có thể đổi history mà không bắn loadEventFired */ }
  }

  async evaluate(sessionId, expression) {
    const { result, exceptionDetails } = await this.send(
      "Runtime.evaluate",
      { expression, returnByValue: true, awaitPromise: true },
      sessionId
    );
    if (exceptionDetails) throw new Error(`evaluate lỗi: ${exceptionDetails.text} ${expression}`);
    return result?.value;
  }

  async waitUntil(sessionId, expression, { timeout = 45000, label = expression } = {}) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      try {
        if (await this.evaluate(sessionId, expression)) return true;
      } catch { /* trang đang chuyển — thử lại */ }
      await sleep(200);
    }
    throw new Error(`timeout chờ điều kiện: ${label}`);
  }

  close() {
    try { this.ws.close(); } catch { /* ignore */ }
  }
}
