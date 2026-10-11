/**
 * brand.mjs — sinh logo GIẢ cho app có brand thật nằm trong bundle.
 *
 * CRM demo có `/logo-256.png` (logo Dragon Hotpot) nằm trong file của app; `domPatch` chỉ sửa
 * text node nên không đổi được. Ảnh chụp đã đổi tên chuỗi sang "Hồng Phúc Nướng & Lẩu" — để
 * nguyên logo thật vừa lộ brand khách hàng, vừa nhìn sai.
 *
 * → Sinh logo trung tính vào `.tmp/fake-logo.png`, rồi chặn request `/logo*` trả về file đó.
 * File nằm trong `.tmp/` (gitignored) → không thêm ảnh nhị phân vào repo.
 * Chữ vẽ bằng hình chữ nhật nên KHÔNG phụ thuộc font.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./serve.mjs";

/** Chữ "HP" dựng bằng hình chữ nhật trên nền bo góc. */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="56" fill="#C8102E"/>
  <g fill="#FFFFFF">
    <rect x="34" y="62" width="24" height="132"/>
    <rect x="92" y="62" width="24" height="132"/>
    <rect x="34" y="116" width="82" height="24"/>
    <rect x="140" y="62" width="24" height="132"/>
    <rect x="140" y="62" width="70" height="24"/>
    <rect x="186" y="62" width="24" height="54"/>
    <rect x="140" y="104" width="70" height="24"/>
  </g>
</svg>`;

export const FAKE_LOGO = path.join(ROOT, ".tmp", "fake-logo.png");

/** Sinh logo giả nếu chưa có. Gọi 1 lần trước khi mở Edge. */
export async function ensureFakeLogo() {
  if (!fs.existsSync(FAKE_LOGO)) {
    fs.mkdirSync(path.dirname(FAKE_LOGO), { recursive: true });
    await sharp(Buffer.from(SVG)).png().toFile(FAKE_LOGO);
  }
  return FAKE_LOGO;
}