/**
 * images-ready.mjs — **bước bắt buộc** trước mọi `Page.captureScreenshot`.
 *
 * ## Vì sao cần
 *
 * `captureBeyondViewport: true` chụp cả trang bằng cách raster từng tile theo lưới
 * compositor. Tile nào chưa có frame ảnh decode xong thì kết quả là **ô trống** —
 * trong khi DOM vẫn báo `<img>` đã "tải xong".
 *
 * Bẫy ở đây: **`img.complete === true` KHÔNG có nghĩa ảnh đã decode.**
 * `complete` chỉ nói "quá trình tải kết thúc" (kể cả khi tải lỗi). Việc biến bytes
 * thành bitmap (decode) do compositor làm **defer** — và ảnh bị **scroll ra khỏi
 * viewport bị hoãn decode**, trong khi ảnh đang ở trong viewport được raster sẵn.
 *
 * Nên lỗi rất dễ lẫn: ảnh **ở đầu trang ra ô trống**, ảnh ở cuối trang lại bình thường —
 * ngược lại mọi suy luận về lazy-load. Ảnh to (hero 2656px → `w=1920`) decode lâu nên
 * hay trúng nhất. Viewport nhỏ thì tỉ lệ thắng cuộc đua cao hơn nên "trang mobile
 * bình thường, trang desktop trống" — đúng kiểu lỗi khó reproduce.
 *
 * ## Cách làm
 *
 * 1. Ép mọi `<img loading="lazy">` sang `eager` rồi cuộn hết trang → mọi ảnh bắt đầu tải.
 * 2. Chờ tới khi **không còn** `<img>` nào `complete === false` (giới hạn thời gian).
 * 3. Gọi `img.decode()` **từng ảnh** — đây là bước thực sự buộc decode trước khi chụp.
 * 4. **Assert**: mọi `<img>` phải `complete && naturalWidth > 0`. Ảnh nào hỏng →
 *    **FAIL** và in `src` thật để lần ra file.
 *
 * @module images-ready
 */
import { sleep } from "./cdp.mjs";

/** Chờ tối đa (ms) cho tới khi mọi `<img>` báo `complete`. */
const SETTLE_TIMEOUT_MS = 60_000;

/**
 * Ép ảnh load + decode, rồi trả về danh sách ảnh kèm trạng thái.
 *
 * Không ném lỗi — để caller tự quyết định FAIL hay chỉ cảnh báo
 * (trang preview có ảnh 404 cố ý thì không nên chặn cả lần chụp).
 *
 * @returns {Promise<{total:number, ready:number, broken:Array<{src:string,complete:boolean,naturalWidth:number,alt:string}>, settled:boolean}>}
 */
export async function loadAndDecodeImages(cdp, sessionId, { selector = "img", settleMs = SETTLE_TIMEOUT_MS } = {}) {
  // 1. Ép eager + cuộn hết trang. Cuộn theo bước chứ không nhảy một lần: trình duyệt
  //    chỉ gắn lazy-load cho ảnh thật sự tới gần viewport.
  await cdp.evaluate(
    sessionId,
    `(async () => {
      for (const i of document.querySelectorAll('${selector}[loading="lazy"]')) i.loading = 'eager';
      const H = document.documentElement.scrollHeight;
      for (let y = 0; y < H; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 100));
      return true;
    })()`
  );

  // 2. Chờ hết `complete === false`. Có ảnh to encode lâu (2656px → w=3840 AVIF).
  const deadline = Date.now() + settleMs;
  let settled = false;
  while (Date.now() < deadline) {
    const pending = await cdp.evaluate(
      sessionId,
      `[...document.querySelectorAll('${selector}')].filter(i => !i.complete).length`
    );
    if (!pending) { settled = true; break; }
    await sleep(300);
  }

  // 3+4. Decode từng ảnh rồi assert. `decode()` là bước quyết định: sau nó thì
  //      `captureScreenshot` mới có frame để raster.
  const result = await cdp.evaluate(
    sessionId,
    `(async () => {
      const imgs = [...document.querySelectorAll('${selector}')];
      for (const i of imgs) {
        try { await i.decode(); } catch { /* tải lỗi — bắt ở assert bên dưới */ }
      }
      const rows = imgs.map(i => {
        const raw = i.currentSrc || i.getAttribute('src') || '';
        let label = raw;
        const m = raw.match(/[?&]url=([^&]+)/);
        if (m) label = decodeURIComponent(m[1]);
        return {
          src: label,
          complete: i.complete,
          naturalWidth: i.naturalWidth,
          alt: i.alt || '',
        };
      });
      return {
        settled: ${"true"},
        total: rows.length,
        broken: rows.filter(r => !r.complete || r.naturalWidth === 0),
      };
    })()`
  );

  return { ...result, settled, ready: result.total - result.broken.length };
}

/**
 * **Bắt buộc trước khi chụp.** Mọi `<img>` phải `complete && naturalWidth > 0`.
 *
 * Ảnh nào hỏng → ném lỗi kèm `src` thật (không nuốt, không "chụp đại").
 * Trang có ảnh 404 cố ý (preview) → truyền `allowBroken` để bỏ qua ảnh đúng ý định.
 *
 * @param {string} label  tên trang/việc chụp — in ra khi FAIL để biết đang ở đâu.
 * @param {RegExp|string[]} [allowBrokenPattern]  src khớp mẫu này thì KHÔNG tính là hỏng.
 */
export async function assertImagesReady(cdp, sessionId, label, { selector = "img", allowBrokenPattern, settleMs = SETTLE_TIMEOUT_MS } = {}) {
  const res = await loadAndDecodeImages(cdp, sessionId, { selector, settleMs });

  const isAllowed = (src) => {
    if (!allowBrokenPattern) return false;
    const list = Array.isArray(allowBrokenPattern) ? allowBrokenPattern : [allowBrokenPattern];
    return list.some((p) => (typeof p === "string" ? src.includes(p) : p.test(src)));
  };

  const broken = res.broken.filter((b) => !isAllowed(b.src));

  if (!res.settled) {
    throw new Error(
      `[images-ready] ${label}: quá thời gian chờ ${settleMs}ms mà vẫn còn ảnh ` +
        `chưa complete — không chụp (ảnh sẽ ra ô trống).`
    );
  }

  if (broken.length) {
    const detail = broken
      .map((b) => `    ✗ ${b.src}  (complete=${b.complete}, naturalWidth=${b.naturalWidth}, alt="${b.alt}")`)
      .join("\n");
    throw new Error(
      `[images-ready] ${label}: ${broken.length}/${res.total} ảnh KHÔNG sẵn sàng ` +
        `(complete=false hoặc naturalWidth=0). KHÔNG chụp — sửa ảnh/route trước.\n${detail}`
    );
  }

  return { total: res.total, ready: res.ready, allowed: res.broken.length };
}
