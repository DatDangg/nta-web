// Stub `next/cache` cho test ngoài Next: unstable_cache thật đòi incrementalCache của Next server
// ("Invariant: incrementalCache missing"). Ở đây gọi thẳng hàm đọc — test kiểm dữ liệu + lỗi, không kiểm cache.
export function unstable_cache<Args extends unknown[], Result>(read: (...args: Args) => Promise<Result>): (...args: Args) => Promise<Result> {
  return read;
}
