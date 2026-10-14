// Gộp bản đọc từ DB lên bản file seed (CR-031 P3-T04, user chốt sau review round 1 F1): chữ giao diện (ui_messages) và
// company_info dùng ở MỌI trang. File seed (messages JSON, hằng COMPANY_CONTACT) là bản dự phòng + chuẩn cấu trúc lâu dài:
//   - key có trong file mà DB chưa có → lấy giá trị file + trả về danh sách đường dẫn thiếu (caller ghi console.warn).
//     Lý do: phát hành code thêm key mới trước khi DB được bổ sung không được làm toàn site 500.
//   - sai kiểu / chuỗi rỗng (file có chữ) / mảng rỗng (file có phần tử) → NÉM lỗi (dữ liệu hỏng, không đoán thay người sửa).
//   - key thừa trong DB → giữ (không ảnh hưởng render). Không dựa thứ tự key (jsonb không giữ thứ tự).
//   - phần tử mảng: kiểm cấu trúc/kiểu theo phần tử đầu của mảng file, thiếu key trong phần tử → lỗi
//     (giá trị file ở vị trí khác không thay thế được phần tử DB).

const MAX_REPORTED_PATHS = 10;

export interface MergeResult<T> {
  value: T;
  missing: string[];
}

interface MergeState {
  missing: string[];
  problems: string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function displayPath(path: string): string {
  return path || '(gốc)';
}

/** Liệt kê tối đa 10 đường dẫn, phần dư ghi số lượng. */
export function formatPaths(paths: readonly string[]): string {
  const more = paths.length > MAX_REPORTED_PATHS ? ` (+${paths.length - MAX_REPORTED_PATHS} khác)` : '';
  return `${paths.slice(0, MAX_REPORTED_PATHS).join('; ')}${more}`;
}

function mergeObject(fileValue: Record<string, unknown>, dbValue: unknown, path: string, state: MergeState, allowFallback: boolean): unknown {
  if (!isPlainObject(dbValue)) {
    state.problems.push(`${displayPath(path)}: cần object`);
    return fileValue;
  }
  const merged: Record<string, unknown> = { ...dbValue };
  for (const [key, fileChild] of Object.entries(fileValue)) {
    const childPath = path ? `${path}.${key}` : key;
    if (Object.hasOwn(dbValue, key)) merged[key] = mergeValue(fileChild, dbValue[key], childPath, state, allowFallback);
    else if (allowFallback) {
      state.missing.push(childPath);
      merged[key] = fileChild;
    } else state.problems.push(`${childPath}: thiếu`);
  }
  return merged;
}

function checkArray(fileValue: unknown[], dbValue: unknown, path: string, state: MergeState): unknown {
  if (!Array.isArray(dbValue)) {
    state.problems.push(`${path}: cần mảng`);
    return fileValue;
  }
  if (fileValue.length > 0 && dbValue.length === 0) state.problems.push(`${path}: mảng rỗng`);
  if (fileValue.length === 0) return dbValue;
  return dbValue.map((item, index) => mergeValue(fileValue[0], item, `${path}[${index}]`, state, false));
}

function mergeValue(fileValue: unknown, dbValue: unknown, path: string, state: MergeState, allowFallback: boolean): unknown {
  if (isPlainObject(fileValue)) return mergeObject(fileValue, dbValue, path, state, allowFallback);
  if (Array.isArray(fileValue)) return checkArray(fileValue, dbValue, path, state);
  if (typeof dbValue !== typeof fileValue || dbValue === null) {
    state.problems.push(`${displayPath(path)}: cần ${typeof fileValue}`);
    return fileValue;
  }
  if (typeof fileValue === 'string' && fileValue.trim() !== '' && (dbValue as string).trim() === '') {
    state.problems.push(`${displayPath(path)}: rỗng`);
  }
  return dbValue;
}

/**
 * Gộp sâu `dbValue` đè lên `fileValue`. Trả bản gộp + đường dẫn key lấy từ file (DB thiếu).
 * Ném lỗi liệt kê (tối đa 10) đường dẫn sai kiểu/rỗng.
 */
export function mergeOverFile<T>(fileValue: T, dbValue: unknown, label: string): MergeResult<T> {
  const state: MergeState = { missing: [], problems: [] };
  const value = mergeValue(fileValue, dbValue, '', state, true);
  if (state.problems.length > 0) {
    throw new Error(`[content-shape] ${label} trong DB sai cấu trúc so với bản file: ${formatPaths(state.problems)}`);
  }
  // Mọi nhánh của mergeValue giữ đúng cấu trúc của fileValue (key thiếu đã lấy từ file, sai kiểu đã ném lỗi).
  return { value: value as T, missing: state.missing };
}
