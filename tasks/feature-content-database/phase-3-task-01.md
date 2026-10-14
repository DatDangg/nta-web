# feature-content-database · phase-3-task-01 — Data-access đọc DB có cache tag; loader MDX đọc DB

- **CR:** CR-031 · spec R-16 (4.2.0)
- **Classification / Risk:** MODIFY (kiến trúc nguồn dữ liệu) · HIGH
  - Expected review level: **STRICT** (shared loaders, mọi trang chi tiết)
  - Blast radius: `src/lib/content/{load-mdx,posts,solutions,products,case-studies,about}.ts` + module đọc mới; mọi trang blog/giải pháp/sản phẩm/case/about.
  - Doc impact: DESIGN (phase 5).

## Scope
1. `src/lib/content/store.ts` (server-only): `getEntries(collection, locale)`, `getEntry(collection, slug, locale)` — lọc `deleted_at IS NULL`,
   bọc `unstable_cache` với tag `content`, `content:<collection>`, `content:<collection>:<slug>`.
2. Cờ `CONTENT_SOURCE=file|db` (mặc định `file`, server-only): `file` = hành vi hiện tại y nguyên; `db` = đọc DB.
   Giữ **nguyên chữ ký hàm export** (`getAllPosts`, `getPostBySlug`, `getAllSolutions`…) → trang không phải sửa; đổi nguồn file → DB.
   Validate + sort giữ như cũ. `render-mdx.tsx` render `body` MDX từ DB.
3. Đường đọc file chỉ còn sau cờ; bỏ hẳn ở phase 5. Thêm `src/content/README.md`: "seed, không phải nguồn sự thật (sau cutover)".
4. DB lỗi: trang đã cache vẫn phục vụ (R-16); trang chưa cache báo lỗi rõ (error boundary/500), không âm thầm trả rỗng (tránh cache trang trống).
   Kiểm: tắt Postgres local sau khi đã mở trang → trang đã cache vẫn 200, trang chưa cache lỗi rõ.

## Acceptance
- Local DB đã import: các trang chi tiết + listing render giống trước (so HTML trang mẫu; parity toàn site ở task 8). typecheck/lint/build PASS.
