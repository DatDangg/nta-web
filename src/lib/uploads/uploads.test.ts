// Test lưu/phục vụ ảnh upload (CR-031 P3-T05) — thuần đĩa, không cần DB. Ảnh mẫu là header JPEG/PNG/WebP dựng tay
// (inspectImage chỉ đọc magic bytes + header kích thước).
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { ImageRejectedError, inspectImage, MAX_IMAGE_SIDE, MAX_UPLOAD_BYTES, storeImageFile } from "./image-file";
import { serveUpload } from "./serve-upload";

function png(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(33);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function jpeg(width: number, height: number): Uint8Array {
  // SOI + APP0 (độ dài 16) + SOF0.
  const bytes = new Uint8Array(2 + 18 + 19);
  bytes.set([0xff, 0xd8, 0xff, 0xe0, 0, 16]);
  const sof = 20;
  bytes.set([0xff, 0xc0, 0, 17, 8], sof);
  const view = new DataView(bytes.buffer);
  view.setUint16(sof + 5, height);
  view.setUint16(sof + 7, width);
  return bytes;
}

function webpVp8x(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(30);
  bytes.set([..."RIFF"].map((c) => c.charCodeAt(0)), 0);
  bytes.set([..."WEBPVP8X"].map((c) => c.charCodeAt(0)), 8);
  const setUint24 = (offset: number, value: number) => bytes.set([value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff], offset);
  setUint24(24, width - 1);
  setUint24(27, height - 1);
  return bytes;
}

const SVG = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>');

function rejects(bytes: Uint8Array, pattern: RegExp): void {
  assert.throws(() => inspectImage(bytes), (error: unknown) => error instanceof ImageRejectedError && pattern.test(error.message));
}

describe("inspectImage — magic bytes + giới hạn", () => {
  it("nhận JPEG/PNG/WebP và đọc đúng kích thước", () => {
    assert.deepEqual(inspectImage(png(640, 480)), { extension: "png", mime: "image/png", width: 640, height: 480 });
    assert.deepEqual(inspectImage(jpeg(1200, 800)), { extension: "jpg", mime: "image/jpeg", width: 1200, height: 800 });
    assert.deepEqual(inspectImage(webpVp8x(1920, 1080)), { extension: "webp", mime: "image/webp", width: 1920, height: 1080 });
  });

  it("từ chối SVG, nội dung giả (đuôi .png nhưng là text), file rỗng", () => {
    rejects(SVG, /JPEG\/PNG\/WebP/);
    rejects(new TextEncoder().encode("not really a png"), /JPEG\/PNG\/WebP/);
    rejects(new Uint8Array(0), /rỗng/);
  });

  it("từ chối quá dung lượng và quá kích thước", () => {
    const big = new Uint8Array(MAX_UPLOAD_BYTES + 1);
    big.set(png(10, 10));
    rejects(big, /quá/);
    rejects(png(MAX_IMAGE_SIDE + 1, 10), /vượt/);
    rejects(webpVp8x(10, MAX_IMAGE_SIDE + 1), /vượt/);
    rejects(png(0, 10), /không hợp lệ/);
  });
});

describe("storeImageFile + serveUpload", () => {
  let root: string;
  let uploadDir: string;
  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "nta-uploads-"));
    uploadDir = path.join(root, "uploads");
  });
  after(async () => rm(root, { recursive: true, force: true }));

  it("ghi theo sha256 + đuôi chuẩn theo magic bytes; trùng hash dùng lại; không để file tạm", async () => {
    const first = await storeImageFile(png(32, 16), uploadDir);
    assert.match(first.fileName, /^[0-9a-f]{64}\.png$/);
    assert.equal(first.urlPath, `/uploads/${first.fileName}`);
    assert.equal(first.written, true);
    const again = await storeImageFile(png(32, 16), uploadDir);
    assert.equal(again.written, false);
    assert.equal(again.fileName, first.fileName);
    assert.deepEqual(await readdir(uploadDir), [first.fileName]);
  });

  it("phục vụ 200 với header đúng", async () => {
    const stored = await storeImageFile(jpeg(8, 8), uploadDir);
    const response = await serveUpload([stored.fileName], uploadDir);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/jpeg");
    assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), jpeg(8, 8));
  });

  it("404: không tồn tại, UPLOAD_DIR thiếu, path traversal, tên lạ", async () => {
    const stored = await storeImageFile(png(4, 4), uploadDir);
    await writeFile(path.join(root, "secret.png"), "x");
    const missing = `${"a".repeat(64)}.png`;
    const cases: string[][] = [
      [missing],
      ["..", "secret.png"],
      ["../secret.png"],
      ["%2e%2e", "secret.png"],
      ["%2e%2e%2fsecret.png"],
      ["..%2Fsecret.png"],
      ["..\\secret.png"],
      [`${stored.fileName.toUpperCase()}`],
      [`${stored.sha256}.svg`],
      [`${stored.sha256}.png.txt`],
      ["sub", stored.fileName],
      [],
    ];
    for (const segments of cases) {
      assert.equal((await serveUpload(segments, uploadDir)).status, 404, segments.join("/"));
    }
    assert.equal((await serveUpload([stored.fileName], undefined)).status, 404);
    assert.equal((await serveUpload([stored.fileName], path.join(root, "khong-co"))).status, 404);
  });

  it("404 khi file trong thư mục upload là symlink trỏ ra ngoài", async (t) => {
    const outside = path.join(root, "outside.png");
    await writeFile(outside, png(2, 2));
    const linkName = `${"b".repeat(64)}.png`;
    try {
      await symlink(outside, path.join(uploadDir, linkName));
    } catch {
      t.skip("không tạo được symlink trên máy này (Windows cần quyền)");
      return;
    }
    assert.equal((await serveUpload([linkName], uploadDir)).status, 404);
    assert.ok((await readFile(outside)).length > 0);
  });
});
