// Import ĐẦU TIÊN trong test cần gọi loader web (src/lib/content/*) bằng node --test + tsx:
// trỏ `server-only` và `next/cache` sang stub cùng thư mục (module.registerHooks — Node >= 22.15, áp cho cả require lẫn import).
import { registerHooks } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const STUBS = new Map<string, string>([
  ["server-only", path.join(__dirname, "server-only.ts")],
  ["next/cache", path.join(__dirname, "next-cache.ts")],
]);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const stub = STUBS.get(specifier);
    if (stub) return { url: pathToFileURL(stub).href, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
