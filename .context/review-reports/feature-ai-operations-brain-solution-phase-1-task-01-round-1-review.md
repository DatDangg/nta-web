Agent: reviewer

# Review — feature-ai-operations-brain-solution · phase-1-task-01 · round 1 (CR-028)

- **Review level:** NORMAL
- **Reason:** thay đổi content (MDX + SVG) + thêm 1 slug vào whitelist `aiSlugs` + 1 danh mục lọc trong `listings.ts`. Không đụng component, API, schema, auth, DB. `aiSlugs` là danh sách dùng chung (SSG, mega menu, listing, sitemap) nhưng chỉ thêm phần tử, không đổi kiểu/logic → không cần STRICT.
- **Blast radius:** `/solutions/ai` (+ `/en`, listing + filter), `/solutions/ai/[slug]` (SSG params), mega menu Header (`src/lib/content/solutions-menu.ts` đọc `aiSlugs`), `sitemap.ts` (đọc `getAllSolutions`). Danh mục `operations` chỉ nằm trong `listingPages[locale].ai` → không ảnh hưởng `/solutions/enterprise` hay trang khác.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn (`src/components/mdx/index.tsx:25` `<img>`, ngoài scope) |
| `npm run build` | Không chạy lại theo chỉ đạo. Ghi nhận: build Windows fail do môi trường (cache root `@swc/core`, HEAD cũng fail); builder báo Docker build PASS 61/61 trang (task file dòng 40-41). Reviewer không tự kiểm chứng → Residual risk thấp (typecheck PASS, frontmatter khớp type). |

## Kiểm tra chính
1. **Trung thành nguồn / tiếng Việt:** vi + en bám đủ các mục của `source-content.md` (vấn đề, giải pháp, 4 lớp, vòng lặp 6 bước, 6 nhóm quy tắc, quản trị, ví dụ đề xuất, cơ chế bảo vệ, 7 agent, nguồn dữ liệu, KPI, lộ trình 5 giai đoạn, ngành, CTA). Tiếng Việt tự nhiên, đúng dấu; bỏ emoji của bản nguồn cho phù hợp khung. OK.
2. **Khối "LƯU Ý CHO NGƯỜI DUYỆT" / tên người / khách hàng:** Grep `src/` không có "Tuấn Anh", "NGƯỜI DUYỆT", "xóa trước khi publish". `relatedCases: []`. OK.
3. **KPI là mục tiêu:** group "Mục tiêu kỳ vọng khi triển khai" / "Target impact (when deployed)" có intro nói rõ "không phải kết quả đã đạt" và mỗi dòng đều có chữ "mục tiêu"/"target". OK. Stats/highlights: "7" agent và "4" lớp là thông số kiến trúc, không phải KPI. "100%" có trùng KPI — xem finding MINOR-1.
4. **Danh mục lọc `operations` (icon `workflow`):** change doc không nêu, nhưng task file (Scope dòng 17-18) có ghi và tiền lệ FridayAI (R-06e) cũng tạo danh mục mới `gateway`. Icon `workflow` có trong `src/components/listing/icons.tsx:12,54`, theme `amber` có trong `themes.ts:5`. Mỗi danh mục hiện có đúng 1 thẻ → nhất quán. Thanh tab lọc `overflow-x-auto` trên mobile, `flex-wrap` từ `lg` (`ListingExplorer.tsx:68`) → thêm 1 tab không tràn. Không ảnh hưởng trang/megamenu khác (mega menu đọc `aiSlugs`, không đọc categories). Hợp lý.
5. **Slug / metadata / sitemap / hreflang / i18n:** `aiSlugs` thêm `ai-operations-brain` (`slug.ts:4`) → `generateStaticParams`, `isAiSlug`, mega menu, listing đều tự có. Metadata trang chi tiết dùng `brandName` + `description` + canonical + `createLocaleAlternates` (`[slug]/page.tsx:19-30`). Sitemap đọc `getAllSolutions`. Có đủ 2 file vi/en cùng slug. OK.
6. **Frontmatter khớp schema:** các field (`slug, brandName, image, title, description, category, features, benefits, useCases, highlights, relatedCases, showcase{hero, stats, pillars, features, details.groups{title,intro?,items?}, faq, cta}`) khớp `src/content/types.ts` (`details.groups` cho phép chỉ có `intro`, dòng 239). Icon showcase dùng lại các giá trị đã có ở trang khác. Typecheck PASS. OK.
7. **SVG:** `public/images/solutions/ai-operations-brain.svg` chỉ có `rect/path/circle/g`, không `<script>`, không `on*`, không `href` ngoài, không `foreignObject`. viewBox 1200×750 khớp `width/height` khai báo. Alt vi/en mô tả đúng hình (nút trung tâm + 6 nút xung quanh). OK.

## Responsive Checklist Gate
Diff không đổi component/CSS, chỉ thêm dữ liệu vào khung đã review trước đó (R-08c).
- Layout: OK — tab lọc có scroll ngang mobile / wrap desktop; lưới listing không đổi.
- Typography/Spacing: N/A (không đổi CSS).
- Media: OK — SVG vector, kích thước khai báo đúng tỉ lệ.
- Touch/Interaction: N/A (không thêm control mới ngoài 1 tab cùng component).
- Viewport/A11y: N/A.
- Residual: chip "Đa tác vụ (Multi-Agent)" là chip dài nhất trong các thẻ AI (`whitespace-nowrap`, danh sách chip `flex-wrap`) — ở 375px vẫn xuống dòng theo chip, không kiểm bằng browser.

## Skill gates
- aislop: N/A — không có code logic mới (chỉ data/content).
- oxlint (anti-slop): skip, oxlint not configured; eslint PASS.
- ocr: skip, ocr not installed.
- AI-readable: OK — 0 indicator (chỉ thêm phần tử mảng/record).
- ai-friendly-web: OK — trang mới tự vào sitemap; robots/llms.txt không đổi.
- blitzstrike: N/A (không phải STRICT).

## Findings
- **[MINOR-1]** `src/content/solutions/vi/ai-operations-brain.mdx:52-54` (+ `:25-26` highlights; en `:53-54`, `:25-26`): stat "100% — đề xuất đi qua kiểm tra AI Hiến pháp trước khi tới người duyệt" không có chữ "mục tiêu", trong khi section KPI (vi `:151`, en `:151`) ghi đúng con số này là "mục tiêu 100%". Nội dung stat mô tả thiết kế (mọi đề xuất qua Constitution Guardian, khớp bản nguồn dòng 114) nên không sai sự thật, nhưng hai chỗ mâu thuẫn nhau và người đọc có thể hiểu là KPI đã đạt. Đề xuất: đổi value thành chữ không phải phần trăm (vd "Mọi đề xuất" / "Every proposal") hoặc bỏ chữ "mục tiêu" ở dòng KPI tuân thủ. Không chặn PASS.
- **[MINOR-2]** `SPECIFICATIONS.md` R-06f không nhắc danh mục lọc mới `operations` ("Vận hành doanh nghiệp" / "Business operations"), trong khi R-06e (FridayAI) có ghi danh mục `gateway`, và `spec/test-scope/current.json` có kiểm danh mục này. Đề xuất: thêm 1 câu vào R-06f để spec khớp code và test-scope.
- **[INFO]** Task file ghi builder subagent BLOCKED, agent change-request tự làm. Ghi nhận về quy trình, không ảnh hưởng chất lượng diff.

## Residual risk
- Build chưa được reviewer chạy lại (theo chỉ đạo); dựa vào báo cáo Docker build của builder.
- Responsive chưa kiểm bằng browser; chỉ xác minh qua class/CSS.

## Verdict
✅ **PASS** — không có CRITICAL/MAJOR. 2 MINOR nên sửa trước commit nếu tiện (không bắt buộc).
