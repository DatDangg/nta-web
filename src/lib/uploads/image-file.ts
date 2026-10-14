// Nhận diện + lưu file ảnh upload trên volume (CR-031 R-16d, quyết định #10). Thuần node:fs — dùng chung cho
// saveImage (src/lib/uploads/save-image.ts, CLI + bot CR-030) và route phục vụ /uploads. Không thêm lib ảnh:
// kích thước đọc thẳng từ header JPEG/PNG/WebP (sharp chỉ dùng ở next/image lúc phục vụ).
import { createHash, randomBytes } from "node:crypto";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
// Mỗi cạnh ≤ 8192 px → tối đa ~67 MP, dưới ngưỡng limitInputPixels của sharp (next/image) và đủ cho ảnh web.
export const MAX_IMAGE_SIDE = 8192;
export const UPLOAD_URL_PREFIX = "/uploads/";

export type ImageExtension = "jpg" | "png" | "webp";

export const IMAGE_MIME_BY_EXTENSION: Record<ImageExtension, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// Tên file trên volume = sha256 (hex thường) + đuôi chuẩn. Route phục vụ chỉ chấp nhận đúng dạng này.
export const UPLOAD_FILE_NAME_PATTERN = /^([0-9a-f]{64})\.(jpg|png|webp)$/;

export interface ImageInfo {
  extension: ImageExtension;
  mime: string;
  width: number;
  height: number;
}

export class ImageRejectedError extends Error {
  constructor(reason: string) {
    super(`ảnh bị từ chối: ${reason}`);
    this.name = "ImageRejectedError";
  }
}

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function pngSize(view: DataView, bytes: Uint8Array): [number, number] | null {
  // IHDR luôn là chunk đầu: độ dài(4) "IHDR"(4) rồi width/height big-endian.
  if (view.byteLength < 24 || ascii(bytes, 12, 4) !== "IHDR") return null;
  return [view.getUint32(16), view.getUint32(20)];
}

// SOF0..SOF15 trừ DHT(C4), JPG(C8), DAC(CC) mang kích thước khung ảnh.
function isStartOfFrame(marker: number): boolean {
  return marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
}

function jpegSize(view: DataView): [number, number] | null {
  let offset = 2;
  while (offset + 9 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) return null;
    const marker = view.getUint8(offset + 1);
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (isStartOfFrame(marker)) return [view.getUint16(offset + 7), view.getUint16(offset + 5)];
    if (marker === 0xd9 || marker === 0xda) return null;
    offset += 2 + view.getUint16(offset + 2);
  }
  return null;
}

function webpSize(view: DataView, bytes: Uint8Array): [number, number] | null {
  if (view.byteLength < 30) return null;
  const chunk = ascii(bytes, 12, 4);
  if (chunk === "VP8 ") return [view.getUint16(26, true) & 0x3fff, view.getUint16(28, true) & 0x3fff];
  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  if (chunk === "VP8X") {
    const uint24 = (offset: number) => view.getUint8(offset) | (view.getUint8(offset + 1) << 8) | (view.getUint8(offset + 2) << 16);
    return [uint24(24) + 1, uint24(27) + 1];
  }
  return null;
}

function detectFormat(bytes: Uint8Array): { extension: ImageExtension; size: [number, number] | null } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { extension: "png", size: pngSize(view, bytes) };
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { extension: "jpg", size: jpegSize(view) };
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return { extension: "webp", size: webpSize(view, bytes) };
  }
  return null;
}

// Kiểm theo NỘI DUNG (magic bytes), không tin đuôi/tên file gốc. SVG/GIF/HEIC/... → không khớp → từ chối.
export function inspectImage(bytes: Uint8Array): ImageInfo {
  if (bytes.length === 0) throw new ImageRejectedError("file rỗng");
  if (bytes.length > MAX_UPLOAD_BYTES) throw new ImageRejectedError(`quá ${MAX_UPLOAD_BYTES} byte (${bytes.length})`);
  const format = detectFormat(bytes);
  if (!format) throw new ImageRejectedError("chỉ nhận JPEG/PNG/WebP (kiểm magic bytes; SVG không được nhận)");
  if (!format.size) throw new ImageRejectedError(`không đọc được kích thước ảnh ${format.extension}`);
  const [width, height] = format.size;
  if (width < 1 || height < 1) throw new ImageRejectedError("kích thước ảnh không hợp lệ");
  if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE) {
    throw new ImageRejectedError(`kích thước ${width}x${height} vượt ${MAX_IMAGE_SIDE}px mỗi cạnh`);
  }
  return { extension: format.extension, mime: IMAGE_MIME_BY_EXTENSION[format.extension], width, height };
}

export interface StoredImage extends ImageInfo {
  sha256: string;
  bytes: number;
  fileName: string;
  // URL công khai ổn định: /uploads/<sha256>.<ext>
  urlPath: string;
  // false = file cùng hash đã có sẵn trên volume (không ghi lại).
  written: boolean;
}

// Ghi atomic: file tạm cùng thư mục (cùng filesystem) → rename. Trùng hash → giữ file cũ nếu đủ byte
// (file cụt do mất điện giữa chừng → ghi lại, tránh phục vụ bản hỏng với cache immutable).
export async function storeImageFile(bytes: Uint8Array, uploadDir: string): Promise<StoredImage> {
  const info = inspectImage(bytes);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const fileName = `${sha256}.${info.extension}`;
  const target = path.join(uploadDir, fileName);
  const stored: StoredImage = { ...info, sha256, bytes: bytes.length, fileName, urlPath: `${UPLOAD_URL_PREFIX}${fileName}`, written: false };
  const existingSize = await stat(target).then((info) => info.size, () => -1);
  if (existingSize === bytes.length) return stored;
  await mkdir(uploadDir, { recursive: true });
  const temp = path.join(uploadDir, `.tmp-${randomBytes(8).toString("hex")}`);
  try {
    await writeFile(temp, bytes, { flag: "wx", mode: 0o644 });
    await rename(temp, target);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
  return { ...stored, written: true };
}
