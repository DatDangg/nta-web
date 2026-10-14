Agent: reviewer

# Review — feature-remove-bao-ha-anonymize-oc-eo · phase-1-task-01 · round 1 (CR-025)

- Task: `tasks/feature-remove-bao-ha-anonymize-oc-eo/phase-1-task-01.md`
- Change doc: `spec/changes/2026-10-14-remove-bao-ha-anonymize-oc-eo.md`
- Ngày: 2026-10-14

## Review level
**NORMAL**

## Reason
Diff chỉ gồm content (MDX frontmatter, 2 dòng meta listing, xoá MDX + ảnh tĩnh) và 1 dòng doc as-built. Không đụng
component/API/schema/auth. Có xoá route public đã index (404 có chủ đích), nhưng user đã chốt, route xử lý bằng
`notFound()` sẵn có, nên không cần STRICT.

## Blast radius
- `/case-studies/ai-box-bao-ha` (vi/en): không còn MDX, `getCaseStudyBySlug` trả null nên ra `notFound()`
  (`src/app/[locale]/case-studies/[slug]/page.tsx:27-28,41-42`); `generateStaticParams` (`:20-22`) không sinh slug này nữa.
- `/case-studies`, trang chủ `/`, `/solutions/ai`, `sitemap.ts`: đều lấy từ `getAllCaseStudies`, nên tự bớt slug.
- `/solutions/ai/boxai` (vi/en): bỏ 1 item `sections[]` + 1 item `showcase.details.items[]`, `relatedCases[0]` giờ là
  `oc-eo-learning` (`src/app/[locale]/solutions/ai/[slug]/page.tsx:42-44`).
- `src/content/listings.ts`: bỏ meta `ai-box-bao-ha` ở vi + en.
- Related của các case study khác: lọc qua `flatMap` (`case-studies/[slug]/page.tsx:43-46`), slug thiếu thì bỏ qua. Grep cũng
  xác nhận không còn case study nào trỏ tới slug này.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` (`tsc --noEmit`) | PASS: không có lỗi |
| `npm run lint` (`eslint .`) | PASS: 0 error, 1 warning có sẵn `@next/next/no-img-element` `src/components/mdx/index.tsx:25`, ngoài diff |
| `npm run build` | Không chạy lại. Builder báo BLOCKED do môi trường (`ERR_SWC_NATIVE_CACHE`, DACL `AppData\Local` của sandbox). Đã ghi vào Residual risk |
| test | skip, `test_command: null` (no test framework) |
| Grep `bao-ha\|Bảo Hà\|Bao Ha\|bao_ha\|baoHa` (không phân biệt hoa thường) trong `src/**`, `public/**` | 0 kết quả |
| Grep `ai-box-bao-ha\|cases/bao-ha` toàn repo, trừ `spec/`, `.context/`, `tasks/`, `node_modules`, `.next` | chỉ có `SPECIFICATIONS.md` (đoạn DEPRECATED, đúng chủ đích) |
| Grep `Lào Cai\|Lao Cai\|48 camera\|48 existing` trong `src` | 0 kết quả trong content (không sót số liệu định danh dự án) |

## Kiểm tra chi tiết
- YAML frontmatter `boxai.mdx` vi/en: đã đọc quanh chỗ xoá (vi `:55-79`, en `:160-174`). Indent liền mạch: `sections` đi tiếp
  `faq:`, `relatedCases:` còn 1 phần tử hợp lệ, `details.items` đi tiếp `photos:` đúng cấp 2 space. Không còn mảng rỗng hay key treo.
  Typecheck không parse YAML, nên điểm này dựa trên đọc tĩnh và chờ build xác nhận.
- `listings.ts`: xoá đúng 2 dòng, cú pháp object còn nguyên, typecheck PASS.
- Câu "Xem case study chi tiết ở cuối trang" chỉ có trong item đã xoá, nên không còn tham chiếu treo.
- Route cũ: `notFound()` sẵn có, trang 404 dùng `src/app/[locale]/not-found.tsx`. Không có redirect, đúng quyết định user.
- `SPECIFICATIONS.md` R-06b / R-08b.2 có DEPRECATED kèm lý do và ngày, khớp diff task-01 (bỏ khối `sections` + `showcase.details`,
  bỏ `relatedCases` `ai-box-bao-ha`, 404 không redirect, gỡ ảnh). R-06e/R-08a.1 (slug mới `heritage-site-ai-camera`) thuộc
  task-02, nên `relatedCases` vẫn là `oc-eo-learning` ở task này là đúng thứ tự, không tính thiếu.
- `docs/DESIGN.md:112`: đã bỏ "+ Đền Bảo Hà", reconcile as-built đúng.
- Surgical diff: mọi dòng đổi đều trace về task. Không có drive-by. Không đụng `not-found.tsx`, `[slug]/page.tsx`, ảnh `boxai/*`.
- Trạng thái stage: các file xoá đã `git rm` (staged), các file sửa còn unstaged. Primary nên stage đúng danh sách file của task khi commit.

## Responsive Checklist Gate
N/A: diff không đổi component/CSS/route UI, chỉ bớt 1 item dữ liệu trong component đã có (SolutionSections / showcase details).
Không có layout mới.

## Skill gates
- aislop: N/A, không có code TS/JS logic mới (chỉ xoá 2 dòng object literal + content)
- oxlint (anti-slop): N/A, không có TS/JS logic mới. ESLint PASS.
- ocr (open-code-review): skip, không có code logic để review
- AI-readable: OK, 0 indicator (không có code mới)
- ai-friendly-web: OK. Sitemap tự bớt slug qua `getAllCaseStudies`, `public/**` không còn tham chiếu (bao gồm llms.txt nếu có).
- blitzstrike: N/A, không phải task nhạy cảm

## Findings
- [CRITICAL]: không có
- [MAJOR]: không có
- [MINOR]: không có lỗi code.
  - Ghi chú: AC "typecheck · lint · build PASS" và AC smoke HTTP 404 chưa được kiểm chứng end-to-end vì build BLOCKED do môi trường.
    Đề xuất: chạy `npm run build` (hoặc `bash tools/linux-build.sh verify` + smoke 404 vi/en, kèm `sitemap.xml`) ngoài sandbox
    trước khi push/deploy.

## Residual risk
- `npm run build` BLOCKED do môi trường (SWC native binding / DACL sandbox), không do code. Đọc tĩnh không thấy lý do khiến build
  hỏng: không còn import/tham chiếu tới MDX hay ảnh đã xoá, YAML hợp lệ. Việc parse frontmatter MDX lúc build và HTTP 404 thực tế
  chưa được chạy kiểm chứng.
- URL `/case-studies/ai-box-bao-ha` đã index sẽ trả 404 (chủ đích theo quyết định user). Có thể cần gỡ index trên Search Console, ngoài scope code.

## Verdict
PASS (kèm residual risk: build/smoke chưa chạy do môi trường)
