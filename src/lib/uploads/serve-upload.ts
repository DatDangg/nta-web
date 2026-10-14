// Phục vụ ảnh upload từ UPLOAD_DIR cho route GET /uploads/[...path] (CR-031 R-16d, quyết định #10).
// Next standalone chỉ phục vụ public/ có lúc build → ảnh upload sau build phải đi qua route handler đọc volume.
// Chỉ đọc trong thư mục upload: đúng 1 segment dạng <sha256>.<jpg|png|webp> (chặn ../, %2e%2e, %2F, tên lạ),
// rồi realpath phải nằm ngay trong realpath(UPLOAD_DIR) (chặn symlink trỏ ra ngoài).
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { IMAGE_MIME_BY_EXTENSION, MAX_UPLOAD_BYTES, UPLOAD_FILE_NAME_PATTERN, type ImageExtension } from "./image-file";

const NOT_FOUND_CODES = new Set(["ENOENT", "ENOTDIR", "ELOOP", "EACCES"]);

function notFound(): Response {
  return new Response("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Error && NOT_FOUND_CODES.has((error as NodeJS.ErrnoException).code ?? "");
}

async function resolveInsideRoot(uploadDir: string, fileName: string): Promise<string | null> {
  const root = await realpath(uploadDir);
  const file = await realpath(path.join(root, fileName));
  if (path.dirname(file) !== root) return null;
  const info = await stat(file);
  // File ngoài giới hạn upload (không do saveImage ghi) → không nạp vào RAM.
  return info.isFile() && info.size <= MAX_UPLOAD_BYTES ? file : null;
}

export async function serveUpload(segments: readonly string[], uploadDir: string | undefined): Promise<Response> {
  if (!uploadDir || segments.length !== 1) return notFound();
  const match = UPLOAD_FILE_NAME_PATTERN.exec(segments[0]);
  if (!match) return notFound();
  try {
    const file = await resolveInsideRoot(uploadDir, segments[0]);
    if (!file) return notFound();
    const body = new Uint8Array(await readFile(file));
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": IMAGE_MIME_BY_EXTENSION[match[2] as ImageExtension],
        "Content-Length": String(body.byteLength),
        // Tên = hash nội dung → nội dung không bao giờ đổi dưới cùng URL.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) return notFound();
    throw error;
  }
}
