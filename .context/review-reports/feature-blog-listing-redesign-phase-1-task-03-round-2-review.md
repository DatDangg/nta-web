Agent: reviewer

# Review: feature-blog-listing-redesign — phase-1-task-03 (round 2)

## Review level: NORMAL
## Reason
Re-review sau FAIL round 1 (`...-task-03-round-1-review.md`). Diff round 2 chỉ ở `src/components/blog/BlogListing.tsx`
(cách ghi URL + timer debounce + padding hàng chip). Không đụng shared/API/schema.

## Blast radius
`/blog`, `/en/blog` — thanh lọc/tìm kiếm. Bỏ `useRouter`/`usePathname` khỏi `BlogListing`; `Pagination` (shared) không đổi
và vẫn dùng `router.push` + `useSearchParams` (Next 15 đồng bộ `history.replaceState` vào router state → Pagination đọc params đúng).

## Verify commands + result
| Lệnh | Nơi | Kết quả |
|---|---|---|
| md5 `BlogListing.tsx` device vs container | cả hai | khớp (`8ec40256…`) |
| `npm run typecheck` | device | PASS (exit 0) |
| `npm run lint` | device | PASS — 0 error, 1 warning có sẵn ngoài scope (`mdx/index.tsx` `<img>`) |
| `next build` | container (builder rebuild, BUILD_ID 05:59) | PASS (evidence builder; không chạy build trên device) |
| Playwright race/behavior `race2.mjs` (reviewer, 10 kịch bản, có trễ RSC 600ms) | container `:3100` | **PASS 10/10**, 0 console/page error |
| Playwright focus ring + scroll ngang 375/768/1280 (`kb2/kb3.mjs`) | container | PASS |

Kết quả `race2.mjs`:
- A gõ "ai" → 50ms bấm "Hướng dẫn" (mạng nhanh) → `/blog?category=guides&q=ai`, chip Hướng dẫn, input "ai" ✔
- B như A, RSC +600ms → `/blog?category=guides&q=ai` ✔ (r1: `/blog?q=ai` ✘); 0 request RSC phát sinh từ thao tác lọc
- C `?category=trends&q=zzzz` → "Xóa bộ lọc", RSC +600ms → `/blog`, chip Tất cả, input "" ✔ (r1: `?category=trends` ✘)
- D gõ chậm "quy trinh so" (RSC +600ms) → input giữ đủ chữ, URL `?q=quy+trinh+so` ✔
- E gõ "ab" rồi xoá hết trong <300ms → URL `/blog`, không ghi thừa ✔
- F chip "AI & Công nghệ" rồi gõ "du lieu" → `?category=ai-tech&q=du+lieu` (timer lấy category mới nhất) ✔
- G đang lọc, bấm link header "Tin tức" (URL đổi từ ngoài) → `/blog`, input reset "", chip Tất cả ✔
- H tìm "du lieu" → mở bài → Back → `?q=du+lieu`, input "du lieu", 1 kết quả ✔
- I `/en/blog?category=guides&q=organiz` → chip Guides, "1 post" ✔
- `history.length` không tăng khi lọc/tìm (replace, không thêm history) ✔; "dữ liệu" và "du lieu" cùng 1 kết quả ở 375/768/1280 ✔

## Responsive Checklist Gate
Không đổi so với round 1 (OK toàn bộ). Kiểm lại sau `-my-1 py-1`: `scrollWidth == innerWidth` ở 375/768/1280 ✔.

## Skill gates
aislop / oxlint / ocr / semgrep: skip (không cài; oxlint not configured). Karpathy surgical: OK — round 2 chỉ sửa đúng
MAJOR-1 + MINOR-2, import thừa (`useRouter`, `usePathname`) đã bỏ. AI-readable: OK — comment nêu lý do (WHY), ref tên rõ (`lastWritten`, `searchTimer`).
Security: không đổi — `buildBlogQueryString` encode bằng `URLSearchParams`, path lấy `window.location.pathname` (same-origin, không open-redirect).

## Trạng thái finding round 1
| Finding | Trạng thái | Bằng chứng |
|---|---|---|
| MAJOR-1 timer debounce cũ ghi đè chip / xoá lọc | ✅ FIXED | `BlogListing.tsx:62-89`: `navigate()` `clearTimeout(searchTimer)`; timer đọc `lastWritten.current.category`; bỏ qua khi draft == query đã ghi; ghi URL bằng `history.replaceState` (không round-trip RSC). Race B/C PASS ở RSC +600ms. |
| MINOR-1 `motion-safe:ease-out-expo` không sinh CSS | ⏸ Defer (ngoài scope, lỗi pattern toàn repo) | Đề xuất task riêng: đổi key token `transitionTimingFunction` thành `out-expo`. |
| MINOR-2 vòng focus chip bị cắt | ✅ FIXED | `BlogListing.tsx:122` `-my-1 py-1`; ảnh zoom chip "Xu hướng" ring tròn đủ trên/dưới. |
| MINOR-3 Pagination `router.push` vs spec "replace" | ⏸ Defer — cần user xác nhận | Component shared không đổi trong task. |

## Findings mới (round 2)
- **[MINOR-4]** Focus chip *đang active* khó thấy — style global `globals.css:90-94` (`outline 2px var(--color-surface)` offset 2px
  + `box-shadow 0 0 0 4px var(--color-focus)`): outline trắng phủ gần hết shadow 4px, phần còn lại cùng màu teal với nền chip active
  → trên nền toolbar trắng chỉ thấy chip "to ra" ~2px. Chip không active thì ring rõ. Cùng pattern với chip `ListingExplorer` có sẵn,
  nên không chặn. Đề xuất: chip thêm `focus-visible:outline-focus focus-visible:outline-offset-2` (hoặc task riêng chỉnh focus ring global cho nút nền primary).

## Verdict: ✅ PASS
0 CRITICAL / 0 MAJOR. MAJOR-1 đã sửa và tái kiểm bằng kịch bản tái hiện gốc (có trễ mạng); MINOR-2 đã sửa.
MINOR-1/3/4 là follow-up ngoài scope / không chặn — báo user quyết.

## Residual risk
- `npm run build` chỉ xác minh ở container (next/font Inter bị stub).
- Pagination (>12 kết quả) chưa test runtime vì nội dung hiện chỉ 4 bài; logic sync `replaceState` → `useSearchParams` → `Pagination.push` dựa trên hành vi Next 15 đã được kịch bản H/G gián tiếp xác nhận (router state đúng sau replaceState).
