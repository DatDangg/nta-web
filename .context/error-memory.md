# Error Memory

## Purpose
Log errors encountered during development to prevent repeating the same mistakes.

## Format

```markdown
### Error {N}
- **Date:** YYYY-MM-DD
- **Task:** layer-{N}/task-{NN}
- **Error:** {Error message or description}
- **Root Cause:** {Why it happened}
- **Fix:** {How it was resolved}
- **Pattern:** {General lesson — applies to future tasks}
- **Prevention:** {How to avoid this in the future}
```

## Standing Rules (Pre-loaded)

These rules were learned from real bugs. Apply them to every task, not just when an error occurs.

### Rule 001 — Assert on shared contract, not implementation format
- **Pattern:** Tests that assert on backend response format (e.g. `expect(res.body.token)`) will pass even when the frontend can't parse the response — because they're locked to the current implementation, not the actual contract the client consumes.
- **Prevention:** Tests MUST assert on the shared contract: the same shape that the client-side `parse()` / type definition expects. If the client reads `body.data.token`, the test must assert `body.data.token`, not `body.token`.
- **Example fix:**
  ```js
  // ❌ Wrong — asserts implementation detail
  expect(res.body.token).toBeDefined();

  // ✅ Correct — asserts client contract
  expect(res.body.data.token).toBeDefined();
  expect(res.body.success).toBe(true);
  ```

### Rule 002 — All responses MUST go through shared helper (ok()/fail())
- **Pattern:** If one endpoint writes `res.json({token, user})` manually while all others use `ok({token, user})`, the format diverges silently. Tests pass, frontend breaks.
- **Prevention:** Never use `res.json()` directly for API responses. Always use the shared response helper (`ok()` / `fail()`). If the helper doesn't support a case, extend the helper — don't bypass it.
- **Enforcement:** Add a lint rule or grep check in CI: `res.json(` in route files should be flagged for review.

### Rule 003 — Write contract tests that simulate client parsing
- **Pattern:** Unit/integration tests only cover the server side. The client-side `parse()` function is never tested against real API responses, so format mismatches only surface in the browser.
- **Prevention:** For every auth/critical endpoint, write a contract test that:
  1. Calls the real endpoint
  2. Passes the raw response body through the client `parse()` function
  3. Asserts the parsed result matches expected shape
  ```js
  // Contract test example
  const res = await request(app).post('/auth/login').send(credentials);
  const parsed = parseLoginResponse(res.body); // actual client parser
  expect(parsed.token).toBeDefined();
  expect(parsed.user.id).toBeDefined();
  ```

## Entries

### Error 1 — layer-1-task-04: Reveal SSR flash + FilterBar i18n regression
- **Date:** 2026-10-08
- **Task:** layer-1/task-04 (Interactive components: Reveal, FilterBar, Pagination, Skeleton, EmptyState)
- **Error:** Reviewer round 2 FAIL. (a) MAJOR: `Reveal` vẫn flash `visible → hidden → fade in` trên initial SSR load — `useState(true)` render nội dung visible ở server HTML, browser paint trước hydrate, `useLayoutEffect` chỉ ẩn *sau hydration*. (b) MAJOR: `FilterBar.tsx:20` hardcode `aria-label="Lọc theo mảng"` (bỏ `t('filter.label')`) → screen reader đọc tiếng Việt trên locale EN, dead i18n key.
- **Root Cause:** (a) Fix round-1 chỉ chuyển `useEffect` → `useLayoutEffect` (đề xuất option #1), nhưng không giải quyết việc server HTML đã paint visible trước hydration. (b) Cố khớp copy design Screen 8 bằng hardcode thay vì thêm key i18n.
- **Fix:** Chưa áp dụng (đang chờ human decision). Đề xuất: (a) render hidden mặc định + gate class `js`/CSS `.reveal{opacity:0}` chỉ khi JS bật, giữ no-JS/SEO fallback; (b) thêm key `interactive.filter.groupLabel` vi/en và dùng `t('filter.groupLabel')`.
- **Pattern:** Với animation reveal trong Next App Router, `useLayoutEffect` **không đủ** để tránh flash vì SSR HTML được paint trước hydration — phải gate trạng thái ẩn bằng CSS/class ở server render, không flip state sau mount.
- **Prevention:** Mọi fix gây flash/animation phải xét chuỗi *server render → paint → hydrate*; a11y label/text hiển thị phải đi qua i18n, không hardcode copy design.

### Error 2 — layer-2-task-01: shared card fork + dependency inversion
- **Date:** 2026-10-09
- **Task:** layer-2/task-01 (Trang chủ `/` Screen 1)
- **Error:** Reviewer r1 FAIL (MAJOR): `SolutionGridHome`/`ProductStrip` tự dựng lại markup card thay vì dùng shared `SolutionCard`/`ProductCard` → style drift + duplicate. Fix1 chuyển sang dùng shared card nhưng reviewer r2 FAIL (MAJOR): để card hỗ trợ ảnh home, `src/components/cards/{SolutionCard,ProductCard}.tsx` (Layer 1) lại `import` `@/components/home/HomeImage` (Layer 2) → **dependency inversion** (shared phụ thuộc page module).
- **Root Cause:** (1) Không tái dùng component shared đã có (vi phạm YAGNI/DRY, tạo style drift). (2) Khi cần custom hoá, kéo page-level module vào shared thay vì đưa phần dùng chung xuống đúng tầng.
- **Fix:** Move `HomeImage` → `src/components/shared/HomeImage.tsx`; cards import từ `shared/`; xoá file cũ. r3 PASS.
- **Pattern:** Hướng phụ thuộc component phải đi **từ tầng dưới lên** (page → shared/ui → lib), không bao giờ ngược lại. Shared/UI component KHÔNG được import từ `components/<page>/`.
- **Prevention:** Trước khi tái dùng component shared, kiểm tầng phụ thuộc; nếu cần custom, mở rộng bằng props optional hoặc hạ helper xuống `shared/`/`ui/`, không hạ page module lên shared.
