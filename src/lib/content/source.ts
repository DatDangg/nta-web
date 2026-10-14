// Cờ server-only CONTENT_SOURCE chọn nguồn nội dung cho loader MDX (CR-031 P3-T01):
//   file (mặc định, chưa đặt/rỗng) = đọc src/content như trước · db = đọc PostgreSQL qua store.ts.
// Giá trị khác → ném lỗi (không fallback âm thầm về file: sau cutover, fallback sẽ phục vụ nội dung cũ
// trong khi người sửa đang sửa DB mà không ai biết) — xem .context/decisions.md. Bỏ cờ ở phase 5.
export type ContentSource = 'file' | 'db';

export function parseContentSource(value: string | undefined): ContentSource {
  if (value === undefined || value.trim() === '') return 'file';
  const normalized = value.trim();
  if (normalized === 'file' || normalized === 'db') return normalized;
  throw new Error(`CONTENT_SOURCE không hợp lệ: "${value}" — chỉ nhận "file" hoặc "db"`);
}

// Đọc env lúc gọi (không lúc import). Lưu ý: tới P3-T02 các route vẫn prerender lúc build →
// cờ phải giống nhau ở build và runtime, nếu không nội dung prerender (build) và render động (runtime) sẽ lệch nguồn.
export function getContentSource(): ContentSource {
  return parseContentSource(process.env.CONTENT_SOURCE);
}
