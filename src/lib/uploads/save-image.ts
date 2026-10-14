// saveImage (CR-031 R-16d): lưu ảnh lên volume UPLOAD_DIR + ghi metadata collection `asset` qua write-path có version (R-16a).
// Dùng cho CLI `db:cli -- upload` và bot CR-030 (không có API upload HTTP). Không import "server-only" (CLI chạy bằng tsx).
// Thứ tự: ghi file (atomic, theo hash) TRƯỚC rồi mới ghi DB → DB lỗi chỉ để lại file mồ côi vô hại (lần sau trùng hash dùng lại).
// Bản ghi asset: slug = sha256, locale cố định ASSET_LOCALE (ảnh không theo ngôn ngữ; alt vi/en nằm trong data.alt).
import path from "node:path";
import type { Database } from "../../db/client";
import { createEntry, getEntryByKey, rollbackEntry } from "../../db/content-repo";
import { ASSET_LOCALE } from "../../db/content-rules";
import type { ContentEntry } from "../../db/schema";
import { storeImageFile, type StoredImage } from "./image-file";

const MAX_ORIGINAL_NAME_LENGTH = 200;

export interface ImageAlt {
  vi?: string;
  en?: string;
}

export interface SaveImageInput {
  bytes: Uint8Array;
  originalName?: string;
  alt?: ImageAlt;
  // `cli:<user>`, `bot:<telegram-id>` — như WriteOptions.actor.
  actor: string;
  // Mặc định process.env.UPLOAD_DIR.
  uploadDir?: string;
}

export interface SaveImageResult {
  asset: ContentEntry;
  image: StoredImage;
  // created = bản ghi mới · reused = trùng hash với asset còn sống · restored = trùng hash với asset đã xoá mềm (khôi phục bằng rollback).
  status: "created" | "reused" | "restored";
}

function assetData(image: StoredImage, input: SaveImageInput): Record<string, unknown> {
  const alt: ImageAlt = {};
  if (input.alt?.vi?.trim()) alt.vi = input.alt.vi.trim();
  if (input.alt?.en?.trim()) alt.en = input.alt.en.trim();
  const data: Record<string, unknown> = {
    path: image.urlPath,
    sha256: image.sha256,
    mime: image.mime,
    bytes: image.bytes,
    width: image.width,
    height: image.height,
    alt,
  };
  // Chỉ giữ tên gốc (không đường dẫn) để tra cứu; không dùng làm tên file.
  const originalName = input.originalName ? path.basename(input.originalName).slice(0, MAX_ORIGINAL_NAME_LENGTH) : "";
  if (originalName) data.originalName = originalName;
  return data;
}

export async function saveImage(db: Database, input: SaveImageInput): Promise<SaveImageResult> {
  const uploadDir = input.uploadDir ?? process.env.UPLOAD_DIR;
  if (!uploadDir) throw new Error("UPLOAD_DIR chưa đặt — không biết lưu ảnh vào đâu");
  const image = await storeImageFile(input.bytes, uploadDir);
  const key = { collection: "asset", locale: ASSET_LOCALE, slug: image.sha256 };
  const existing = await getEntryByKey(db, key, { includeDeleted: true });
  if (existing && !existing.deletedAt) return { asset: existing, image, status: "reused" };
  if (existing) {
    // Xoá mềm không xoá file vật lý → khôi phục bản trước khi xoá (version ngay trước) thay vì báo trùng khoá.
    const restored = await rollbackEntry(db, {
      id: existing.id,
      toVersion: existing.version - 1,
      expectedVersion: existing.version,
      actor: input.actor,
      note: "upload lại ảnh trùng hash",
    });
    return { asset: restored.entry, image, status: "restored" };
  }
  const created = await createEntry(db, { ...key, data: assetData(image, input), actor: input.actor, note: "upload ảnh" });
  return { asset: created.entry, image, status: "created" };
}
