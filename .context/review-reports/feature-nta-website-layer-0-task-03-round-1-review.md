# Review — feature/nta-website · layer-0 · task-03 · round-1

- **Review level:** `STRICT`
- **Reason:** `src/lib/content/*` là **shared foundation module** (types + loader là contract nội bộ tiêu thụ bởi mọi page Layer 2) → thuộc risk đỏ "shared service/component"; cộng thêm bề mặt MDX remote rendering. Không có auth/DB/API nên phạm vi vẫn hẹp, nhưng đủ để bắt buộc STRICT theo Reviewer rules.
- **Blast radius:** `src/content/types.ts` + `src/lib/content/{load-mdx,posts,case-studies,solutions,products,about,slug,render-mdx}` (contract cho mọi page Layer 2: solutions/products/case-studies/blog/about); `package.json`/`package-lock.json` (2 dependency MDX mới); `src/content/**` fixture.
- **Verify commands + result:** `npm install` / `npm run lint` / `npm run typecheck` / `npm run build` → **NOT RUN** — `shell` bị permission deny ("Permission denied: shell"), không được retry. Check theo đúng hướng dẫn: static review + builder evidence. Bằng chứng củng cố: `.next/` build artifacts tồn tại (`BUILD_ID`, `prerender-manifest.json`...); builder khai PASS trong task. **Residual risk: chưa tự tái lập được lint/typecheck/build.**
- **Responsive Checklist Gate:** **N/A** — diff không đụng UI (route/component/CSS); chỉ types/loader/content fixture.
- **Skill gates:**
  - aislop: `skip` — CLI không có (`node_modules/.bin/aislop` không tồn tại).
  - oxlint (anti-slop): `skip, oxlint not configured` — không có `.oxlintrc*`/`oxlint.json`/binary.
  - ocr (open-code-review): `skip, ocr not installed`.
  - AI-readable: `OK` — file nhỏ (≤54 dòng), tên self-descriptive, một file một trách nhiệm; không đủ ≥3 AI-chaos indicators.
  - ai-friendly-web: `N/A` — task nội bộ/không tạo web surface public (robots/llms/sitemap ở bước deploy).
  - blitzstrike: `skip` — task không phải auth/API public, không môi trường pentest.

## Findings

### [MINOR] load-mdx.ts:17 — inject `body` vào mọi entity
`records.push({ ...data, body: content.trim() } as T)` thêm `body` vào cả Solution/Product/CaseStudy/AboutData dù type không có field này (cast `as T` che mất). Runtime prop thừa, dễ gây nhầm khi đọc code sau. Đề xuất: tách loader body (chỉ Post/MDX document) hoặc kiểu trả về tường minh.

### [MINOR] load-mdx.ts:28 + posts.ts:8 — validate "bắt buộc" chỉ check null/undefined; sort phụ thuộc type date
`assertRequiredFields` không check empty-string và không check type. `getAllPosts` sort bằng `second.date.localeCompare(first.date)` giả định `date` là string. Nếu file content task-04 dùng YAML date không quote, gray-matter trả `Date` → `localeCompare` không tồn tại → throw lúc build với message khó hiểu. Đề xuất: validate non-empty string + normalize/guard date.

### [MINOR] about.ts:6 — `items[0]` không deterministic
Lấy phần tử đầu theo thứ tự `readdir` (không đảm bảo), và im lặng bỏ qua file thừa. Đề xuất: lookup tường minh (vd `about.mdx`) hoặc assert đúng 1 file.

### [MINOR] posts.ts:11-12 (+ mọi `getBySlug`) — đọc lại toàn bộ thư mục mỗi lần gọi
Mỗi `getBySlug` gọi `getAll*` → re-read dir; trong `generateStaticParams` × per-slug page = N+1 file reads. Nhỏ ở v1 nhưng nên cache theo locale.

### [MINOR] types.ts:12 (Product) — nguy cơ thiếu field cho task-04/Layer 2
`Product` không có field optional kiểu `downloadUrl`/trạng thái "Sắp ra mắt"; task-04 (scope content-only) và MetaBar task-06 có thể cần thêm meta (client/lĩnh vực). Không chặn task-03, nhưng cần xác nhận để tránh phải sửa type ở task content-only.

**Positive (đã kiểm chứng tĩnh):**
- Types phủ đủ entity ERD khái niệm (Solution/Product/CaseStudy/Post/AboutData); ContactSubmission ghi chú L3 (`types.ts:54`).
- Slug list khớp R-05/R-06 chính xác: `crm|hrm|lms|dentgo`, `boxai|flycam|custom-ai` (`slug.ts:3-4`).
- `server-only` có ở `load-mdx.ts:1` và `render-mdx.tsx:1`; **grep 0 match `use client`**, không có client component import `lib/content` → AC "không import server-only vào client" đạt.
- Không leak scope task-04: chỉ 1 fixture/blog VI+EN; solutions/products/case-studies/about mới có `.gitkeep` (loader trả `[]`, build vẫn sạch).
- MDX deps hợp lý (`gray-matter ^4.0.3`, `next-mdx-remote ^6.0.0`); xác nhận `MDXRemote` export từ `next-mdx-remote/rsc` trong `node_modules/next-mdx-remote/dist/rsc.d.ts`.
- `server-only` không nằm trong `package-lock.json` **không phải defect** — Next cung cấp module + type declaration ở `node_modules/next/types/global.d.ts:50`.

## Verdict: ✅ PASS

- 0 CRITICAL · 0 MAJOR · 5 MINOR (không blocking).
- Với feature task, không có CRITICAL/MAJOR → PASS. **Residual risk bắt buộc ghi nhận:** chưa tự chạy lại được `lint`/`typecheck`/`build` do shell bị deny; primary/CI (`.github/workflows`) cần xác nhận pass thật trước khi commit.
