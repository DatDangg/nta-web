/**
 * serve.mjs — static server cho scripts/screenshots (không dependency).
 *
 * Dùng khi cần xem mock HRM bằng mắt:
 *   node scripts/screenshots/serve.mjs        → http://127.0.0.1:5599/mock-hrm/
 * capture.mjs cũng import server này để tự phục vụ mock + fixture + ảnh tạm.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.dirname(fileURLToPath(import.meta.url));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export function startServer(port = 5599, root = ROOT) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const servesPublicAsset = pathname.startsWith("/public/");
    const publicRoot = path.resolve(root, "..", "..");
    let filePath = servesPublicAsset
      ? path.resolve(root, "..", "..", `.${pathname}`)
      : path.join(root, pathname);
    if (url.pathname.endsWith("/")) filePath = path.join(filePath, "index.html");
    const allowedRoot = servesPublicAsset ? publicRoot : root;
    if (!path.resolve(filePath).startsWith(path.resolve(allowedRoot))) {
      res.writeHead(403, { "content-type": "text/plain" }).end("forbidden");
      return;
    }
    fs.readFile(filePath, (err, buf) => {
      if (err) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end(`not found: ${url.pathname}`);
        return;
      }
      res.writeHead(200, { "content-type": MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream" });
      res.end(buf);
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const port = Number(process.env.PORT || 5599);
  await startServer(port);
  console.log(`mock HRM:  http://127.0.0.1:${port}/mock-hrm/?screen=overview`);
  console.log(`fixtures:  http://127.0.0.1:${port}/fixtures/hrm.json`);
}
