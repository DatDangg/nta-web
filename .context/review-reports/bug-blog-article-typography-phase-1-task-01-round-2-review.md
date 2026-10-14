# Review — bug-blog-article-typography · phase-1-task-01 · round 2

Agent: reviewer

- Change: CR-023 (BUG UI) — `tasks/bug-blog-article-typography/phase-1-task-01.md`
- Round 1: `.context/review-reports/bug-blog-article-typography-phase-1-task-01-round-1-review.md` — FAIL (unverifiable) chỉ vì B1 (thiếu repro trình duyệt) + B2 (build Blocked); 0 CRITICAL/MAJOR.
- Date: 2026-10-14

## Review level
**NORMAL** (giữ như round 1)

## Reason
UI public thân bài trang chi tiết Tin tức; không auth/API/schema/data/tenant; `mdxComponents` chỉ có 1 consumer (`src/app/[locale]/blog/[slug]/page.tsx`). Round 2 chỉ đánh giá lại điều kiện chặn B1/B2, code không đổi.

## Blast radius
- Thân bài MDX `/[locale]/blog/[slug]` (vi + en) — 5 bài × 2 locale + bài pipeline tương lai.
- Không đổi API/schema/route/dependency/nội dung `.mdx`/`generate.py`.

## Diff so với round 1
`git diff --stat -- src/` → đúng 2 file: `src/app/[locale]/blog/[slug]/page.tsx` (1 dòng: `prose …` → `text-base text-text-primary`) và `src/components/mdx/index.tsx` (+38/−12: `articleHeadingClass`, `withClass`, className theo token cho h1→h2/h2/h3/p/a/ul/ol/li/blockquote/hr/code/pre). Nội dung diff trùng khớp mô tả và phân tích round 1 → **không đổi**. Mọi kết luận code-level của round 1 (token mapping, specificity `[&_code]`, className merge, a11y heading/focus, responsive tĩnh) giữ nguyên.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` (reviewer, round 2) | **PASS** — `tsc --noEmit`, exit 0 |
| `npm run lint` (reviewer, round 2) | **PASS** — 0 error, 1 warning có sẵn `@next/next/no-img-element` tại `src/components/mdx/index.tsx:25` (`ArticleImage`, ngoài diff) |
| `npm run build` | Reviewer **không chạy lại**: biến thể có env `SWC_NATIVE_BINDING_CACHE=… npm run build` không nằm trong allow-list bash của reviewer (`"*": deny`), và `npm run build` trơn đã biết Blocked trong sandbox (DACL cache `AppData\Local\swc`). Dùng evidence phiên chính: `SWC_NATIVE_BINDING_CACHE='C:\Users\datda\.swc-native-cache' npm run build` → **PASS** (compile + generate static pages gồm `/[locale]/blog/[slug]`) — ghi ở task file mục "Unblock evidence". |

## Đánh giá điều kiện chặn round 1
| Mã | Yêu cầu | Evidence | Kết quả |
|---|---|---|---|
| **B2** build PASS | build thành công trên môi trường có SWC binding | Phiên chính ngoài sandbox: build PASS với cache SWC thay thế; nguyên nhân Blocked trước đó đã chẩn đoán rõ (DACL AppContainer trên cache root của `@swc/core` trong `next-intl`), không liên quan diff; diff không đụng `next.config.ts`/dependency | **Thỏa** |
| **B1** Repro Verification sau fix | computed style + không tràn ngang ở mobile/desktop, vi + en | `next start` :3100 — `/vi/blog/ai-weekly-2026-w42` desktop: h2 22px / 600 / marginTop 48px (khớp `text-h3` clamp min 1.375rem, `mt-12`), p marginBottom 20px (khớp `my-5`), link nguồn màu primary gạch chân. `/en/blog/ai-weekly-2026-w42` 375×812: h2 22px, scrollWidth 375 = innerWidth. `/vi/blog/first-steps` 375px: đoạn có khoảng cách, không tràn. Trước fix (root cause): h2 16px, p margin 0 | **Thỏa** — số đo khớp chính xác giá trị CSS kỳ vọng từ class trong diff, phủ cả vi/en, desktop + 375, bài mới + bài cũ |

Residual (không chặn): evidence B1 do phiên chính cung cấp (reviewer không tự chạy browser); chưa có số đo riêng 768px và `/en/blog/responsible-ai` — chấp nhận được vì không có breakpoint nào trong diff (mọi class không phụ thuộc viewport, `text-h3` là clamp liên tục) và 4 bài cũ cùng cấu trúc chỉ-đoạn-văn như `first-steps`.

## Acceptance
| Mục | Kết quả |
|---|---|
| Style h2/h3, p, a, ul/ol, blockquote, hr đúng token | PASS (tĩnh round 1 + đo thực tế h2/p/a) |
| `ai-weekly-2026-w42` vi + en: tiêu đề nổi bật, khoảng cách tin, link primary | PASS (B1) |
| 4 bài cũ × 2 locale không vỡ | PASS (đo `first-steps`; các bài khác cùng cấu trúc) |
| Bài pipeline tự nhận style | PASS (style ở renderer) |
| Mobile 375px không tràn | PASS (scrollWidth = innerWidth) |
| typecheck / lint / build PASS | PASS / PASS / PASS (evidence phiên chính) |

## Findings
### [CRITICAL]
- Không có.

### [MAJOR]
- Không có.

### [MINOR] (không chặn)
- **M1 — đề xuất CR riêng (KHÔNG sửa trong CR-023):** link `text-primary` (#009e87) trên nền trắng ≈ 3.4:1 < 4.5:1 WCAG AA cho chữ thường 16px (`src/components/mdx/index.tsx` class `a`). Pattern có sẵn toàn site (`blog/page.tsx`, `CaseStudyLink.tsx`, `RelatedSolutions.tsx`…) và đúng plan user duyệt. Đề xuất CR mới "contrast link primary toàn site": dùng `primary-hover` (#007c6b ≈ 5.1:1) cho chữ link trên nền sáng hoặc thêm token `primary-ink`, áp đồng loạt.
- **M2** inline `code` chưa có `[overflow-wrap:anywhere]` — token dài có thể tràn 375px; pipeline hiện không sinh inline code → rủi ro thấp.
- **M3** h4–h6 / table chưa style — ngoài scope, đã ghi trong plan.

## Skill gates
Như round 1 (aislop soi tay OK; oxlint/ocr not configured → skip; AI-readable 0 indicator; ai-friendly-web OK; blitzstrike N/A). Diff không đổi → không chạy lại.

## Verdict
✅ **PASS** — diff không đổi, 0 CRITICAL/MAJOR; typecheck + lint PASS (reviewer chạy lại), build PASS và Repro Verification PASS theo evidence phiên chính ngoài sandbox (B1, B2 đã thỏa). M1 chuyển thành đề xuất CR riêng; M2/M3 ghi nhận, không chặn close-out.
