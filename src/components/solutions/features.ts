import type { Feature, LegacyFeature } from '@/content/types';

/**
 * Tỉ lệ bên dưới được coi là "dọc" → ảnh bị khung `max-height` cắt đáy → cần fade.
 *
 * Ảnh v2 có tỉ lệ 0.735 (HRM `08`) đến 1.60 (DentGo `05`). Ngưỡng 1.0 là ranh giới
 * giữa "co vừa khung, không cắt" và "cao hơn khung, phải cắt".
 */
export const RATIO_CROPPED = 1.0;

/**
 * Cơ chế hiển thị ảnh khung macOS — **không cắt theo bất kỳ hướng nào** (spec §3.1).
 *
 * Ảnh v2 có khung cửa sổ vẽ sẵn (3 chấm + viền + thanh tiêu đề). `object-cover` cắt 2 bên
 * là mất 3 chấm; cắt đáy là mất viền dưới. Nên chỉ **thu nhỏ giữ nguyên tỉ lệ**.
 *
 * Chia 2 nhánh theo `ratio`:
 *
 * | | Ảnh ngang (ratio ≥ 1.0) | Ảnh dọc (ratio < 1.0) |
 * |---|---|---|
 * | Ảnh | `max-w-full max-h-*` + `mx-auto` | `w-full` — rộng đúng bằng cột |
 * | Khung bọc | không cần | `max-h-* overflow-hidden` |
 * | Fade đáy | **không** (không có phần bị cắt) | `.shot-fade-bottom` |
 *
 * Không có `object-cover`, không có `aspect-*` cứng ở cả hai nhánh.
 */
export type ShotLayout = {
  /** Class cho phần tử `<img>`. */
  imageClass: string;
  /** Class cho khung bọc quanh ảnh. Rỗng = không cần khung. */
  frameClass: string;
  /** Có nên fade đáy không — chỉ khi ảnh thực sự bị cắt. */
  fade: boolean;
};

/**
 * @param ratio  tỉ lệ rộng/cao, đo sẵn từ `docs/screenshots-mapping.md`
 * @param maxH   chiều cao tối đa (chuỗi class Tailwind), ví dụ `max-h-[420px]`
 */
export function shotLayout(ratio: number | undefined, maxH: string): ShotLayout {
  // Không đo được tỉ lệ → coi như ngang (an toàn: không cắt, không fade).
  if (ratio === undefined || ratio >= RATIO_CROPPED) {
    return {
      imageClass: `h-auto w-auto max-w-full ${maxH} mx-auto`,
      frameClass: '',
      fade: false,
    };
  }

  // Ảnh dọc: rộng hết cột, khung cắt đáy + fade cho mép cắt mềm.
  // Khung KHÔNG có `rounded-lg` — component thêm vào cùng `border`/`shadow` để không lặp.
  return {
    imageClass: 'h-auto w-full',
    frameClass: `${maxH} overflow-hidden`,
    fade: true,
  };
}

/**
 * Đổi `Feature[] | string[]` về `Feature[]`.
 *
 * `string` (dữ liệu cũ chưa migrate) → `{ title: s }`. Cho phép render trang cũ
 * ngay với component mới mà không ép migrate toàn bộ 8 file cùng lúc.
 */
export function normalizeFeatures(features: Feature[] | LegacyFeature[] | undefined): Feature[] {
  if (!features) return [];
  return features.map((feature) => (typeof feature === 'string' ? { title: feature } : feature));
}