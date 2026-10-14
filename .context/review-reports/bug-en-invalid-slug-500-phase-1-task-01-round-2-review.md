Agent: reviewer

# Review — bug-en-invalid-slug-500 · phase-1-task-01 · round 2

- **Task:** `tasks/bug-en-invalid-slug-500/phase-1-task-01.md` (BUG, gộp CR-026 + CR-032)
- **Round 1:** `.context/review-reports/bug-en-invalid-slug-500-phase-1-task-01-round-1-review.md` — FAIL do 1 MAJOR (thiếu Repro Verification có evidence kiểm chứng được); code đã được đánh giá đúng ở round 1.

## Review level
**FAST**

## Reason
Code không đổi so với round 1: `src/app/[locale]/not-found.tsx:8-13` (metadata tĩnh `title: { absolute: '404 | NTA' }` + `robots: { index: false, follow: false }`) và `src/app/[locale]/not-found.test.ts` (assert `:22`, `:24`) giống hệt nội dung đã review ở round 1. Thay đổi round 2 chỉ là tài liệu trong task file. Phân tích STRICT về shared 404 / cache ISR ở round 1 vẫn giữ nguyên.

## Blast radius
Như round 1 (trang 404 mọi route `[locale]`; 404 `/en/*/[slug]` vào full route cache, tag `content`, `content:<collection>`, `content:<collection>:<slug>`). Round 2 không thêm blast radius.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | PASS — tests 104, pass 102, fail 0 (2 skip cần `TEST_DATABASE_URL`, có sẵn); 2 test `not-found` pass |
| `npm run typecheck`, `npm run lint` | không chạy lại (code không đổi; round 1 PASS) |
| Docker build / smoke | không chạy (reviewer không chạy app) — đánh giá qua evidence trong task file |

## Kiểm mục mới so với yêu cầu round 1
| Yêu cầu round 1 | Vị trí | Kết quả |
|---|---|---|
| Section `Repro Verification`, status `PASS` | task `:98-107` | OK |
| Lệnh build/run cả 2 chế độ `file` + `db` (DB tạm loopback, không prod) | `:109-131` | OK |
| Bảng `URL / expected / actual` đủ Acceptance (en 404 ×9 + `/en/nope`, vi 404, slug hợp lệ 200 mỗi locale ×5 loại, 301 ×3, `/`, `/en`, `/blog`, `/en/blog`, `/sitemap.xml`) | `:136-174` (36 dòng) | OK — khớp Acceptance `:68-73` |
| Ngôn ngữ thân 404, title `404 \| NTA`, robots noindex | cột bảng + mô tả script `:132-134` | OK — khớp code `not-found.tsx:10-13` |
| `grep -c 'static to dynamic'` = 0 mỗi chế độ | `:117`, `:128`, `:191`, `:202-203` | OK |
| Kịch bản db: 404 cached (MISS→HIT, `s-maxage`) → publish → revalidate tag → 200 | `:178-191` | OK — tag revalidate `content:post`, `content:post:<slug>` khớp `contentTags` (`src/lib/content/cache-tags.ts:16-20`) và tag đọc `getEntry` (`src/lib/content/store.ts:32-38`) |
| Test-first FAIL trên HEAD → PASS sau fix | `:104`, `:196-197` | OK — nhất quán: HEAD có `export async function generateMetadata` và không có `export const metadata` |
| Acceptance được tick | `:68-78` | OK |

Nhất quán với root cause: evidence before (500 + log `at get requestLocale`) và after (0 log static→dynamic, thân 404 en đúng ngôn ngữ) khớp chuỗi `not-found generateMetadata → getTranslations → requestLocale → headers()` đã xác nhận ở round 1. Residual risk (`:209-215`) đã ghi đủ các MINOR round 1 (key `notFound.title` thừa, CDN `s-maxage`, test regex tĩnh) + giới hạn kịch bản "slug mới".

## Skill gates
Như round 1: Responsive N/A (không đổi markup/CSS); aislop skip (diff nhỏ, đọc tay OK); oxlint skip (not configured, eslint PASS); ocr skip (not installed); AI-readable OK; ai-friendly-web OK (404 noindex); blitzstrike N/A.

## Findings
- **[MINOR]** `tasks/bug-en-invalid-slug-500/phase-1-task-01.md:5` vẫn ghi `Trạng thái: awaiting_approval (… trước khi gọi Builder)` — lỗi thời. Primary cập nhật khi close-out (không chặn PASS).
- **[MINOR]** Dòng `/fr/blog` (`:156`) robots "script không kiểm" — chấp nhận (404 locale lạ đi qua `layout.tsx:56`, cùng metadata tĩnh). Không chặn PASS.
- Các MINOR round 1 (key `notFound.title`, CDN `s-maxage`, test regex) vẫn còn nhưng đã ghi residual risk; kiểm CDN ở smoke prod sau deploy.

Không còn CRITICAL/MAJOR.

## Verdict
✅ **PASS** — MAJOR round 1 đã đóng: Repro Verification status PASS với evidence kiểm chứng được (lệnh, bảng 36 URL ×2 chế độ, log count, kịch bản revalidate db, test-first). Code không đổi, `npm test` PASS.
