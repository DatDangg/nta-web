# Review — change/ai-solution-content · phase-1 · task-02 · round-1

Agent: reviewer

- **Task:** `tasks/change-ai-solution-content/phase-1-task-02.md` (MODIFY-CONTENT)
- **Work item:** `change/ai-solution-content` · class MODIFY-CONTENT
- **Round:** 1 · **Branch:** main · **Ngày:** 2026-10-09
- **Nguồn đối chiếu:** `spec/changes/2026-10-09-ai-solution-content.md` (A/B/C — nguồn DUY NHẤT),
  `spec/updates/2026-10-09-ai-solution-content.md` (R-06a–e, R-08a), `SPECIFICATIONS.md` R-06/R-08.
- **Diff review (uncommitted):** 8 file content MDX + `src/content/home.ts`; (bỏ qua `.context/runs/*` bookkeeping,
  `spec/changes/2026-10-09-change-UI.md` ngoài scope).

## Review level

**STRICT**

## Reason

Content công khai (public web) + acceptance liên quan **BR-004 trung thực** (dự án di tích/nhà nước chưa xác nhận
quyền công bố) + song ngữ VI/EN + SEO metadata lấy từ content + validator đã flag MAJOR `home.ts` trước build.
Rủi ro claim sai/không trace được về nguồn → cần kiểm chứng độc lập chặt.

## Blast radius

- 3 trang AI detail × 2 locale: `/solutions/ai/{custom-ai,boxai,flycam}` (vi/en).
- Case study detail + list filter + AI overview teaser + home teaser:
  `/case-studies/oc-eo-learning` (vi/en), `/case-studies` (filter `ai`), `/solutions/ai`, `/` (trang chủ).
- SEO metadata (title/description lấy từ content frontmatter) + JSON-LD case study (`study.result`).
- `relatedCases` wiring: `boxai`/`flycam` → `oc-eo-learning` (R-06e).
- Không đụng API/DB/schema/route; slug giữ nguyên.

## Verify commands + result

| Lệnh (theo `.context/project-config.md`) | Kết quả |
|---|---|
| `npm run lint` | ✅ PASS — 0 errors, 1 warning pre-existing `src/components/mdx/index.tsx:25` (`<img>`), **không nằm trong diff** |
| `npm run typecheck` | ✅ PASS — `tsc --noEmit` sạch |
| `npm run build` | ✅ PASS — `next build` OK; `Generating static pages (49/49)`; `/[locale]/solutions/ai/[slug]` `●` đủ 6 path (`vi/en` × `boxai/flycam/custom-ai`); `/[locale]/case-studies/[slug]` `●` có `vi/en` `oc-eo-learning` → **8 route của task render SSG** |
| `test_command: null` | skip, no test framework (`project-config`) |

Ghi chú: lần chạy `git status --short && …` (compound) bị permission deny; đã chạy lại từng lệnh match allowlist.
Không retry command bị deny.

## Responsive Checklist Gate

**N/A (diff không đụng UI code).** Diff chỉ đổi **nội dung dữ liệu** (`*.mdx` frontmatter, `home.ts`),
không đổi route/component/CSS; các component render (`SolutionSections`, `SolutionHighlights`, `FaqList`,
`BenefitList`, `UseCases`, `CaseStudyLink`, `CaseStudyHighlight`) đã có từ task-01 và **không** nằm trong diff.
Vấn đề responsive nếu có thuộc code ngoài diff → ngoài scope, đề xuất task riêng.
Residual: nội dung dài hơn (sections/FAQ) làm tăng chiều cao khối text, không tạo layout mới; chưa verify trong
browser (no browser env). Không tính FAIL.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes --json` | skip, aislop not installed | `aislop: command not found` (127) |
| anti-slop / `oxlint` | skip, oxlint not configured | Glob `**/.oxlintrc*` = 0 file |
| `ocr` (open-code-review) | skip, ocr not installed | `ocr: command not found` (127) |
| AI-readable codebase | OK | Diff content-only + `home.ts` sửa 2 dòng `featuredCase`; file ≤74 dòng; tên field/title self-descriptive; không thêm indirection/comment WHAT/magic number |
| ai-friendly web | OK | `public/llms.txt` tồn tại; `robots.txt` + `sitemap.xml` route có trong build output (`○ /robots.txt`, `○ /sitemap.xml`); content đổi giữ nguyên route/slug → link llms.txt vẫn hợp lệ |
| blitzstrike pentest | N/A | Không đụng auth/API public/input surface — content-only |

## Acceptance coverage (theo change file + task)

| # | Acceptance | Verdict | Bằng chứng |
|---|---|---|---|
| 1 | custom-ai có Talvra (platform/template/lợi ích/use case), không placeholder | PASS | `solutions/{vi,en}/custom-ai.mdx`: description + benefits + useCases + 8 sections; không lộ credentials/infra (đúng A.1/A.2 đã lọc) |
| 2 | BoxAI có phần B + đề cập Đền Bảo Hà, KHÔNG bịa số | PASS | `boxai.mdx`: 3-tầng, phần cứng Jetson/DeepStream, 21 thuật toán + 3 tính năng nền, ngân sách kênh, gói ngành; `:57-58` Đền Bảo Hà **định tính** ("số lượng… sẽ cập nhật sau khi xác nhận") |
| 3 | Flycam: DJI Dock 2, phạm vi phủ, thermal, use case | PASS | `flycam.mdx`: Dock 2 + Matrice 3TD, thermal `640×512 → UHR 1280×1024`, phản ứng theo khoảng cách, 3 khái niệm diện tích phủ, 4 route, lịch cấp I–V, trigger, FAQ |
| 4 | Óc Eo bỏ "Số hoá quản lý đào tạo", format vấn đề→giải pháp→kết quả | PASS | grep placeholder trong `src` = **0**; `oc-eo-learning.mdx` có challenge/solution/result |
| 5 | home.ts `featuredCase` không còn tiêu đề cũ | PASS | `home.ts:20,32` = "Phương án AI camera và flycam tại Óc Eo – Ba Thê" / "Proposed AI camera and drone plan…" |
| 6 | Song ngữ VI/EN parity | PASS | Cả 2 locale đủ nội dung + i18n key (`solutions.ai.*`, `caseStudies.categories.ai`) tồn tại |
| 7 | Đền Bảo Hà không số bịa; Óc Eo không ghi "đã đạt" | PASS | Không có số camera/thiết bị/ngày cho Bảo Hà; Óc Eo `result` ghi rõ "**phương án đề xuất, không phải kết quả triển khai đã xác nhận**" + kết quả kỳ vọng |
| 8 | lint/typecheck/build PASS, SSG giữ | PASS | Bảng verify phía trên |
| 9 | Category `enterprise`→`ai`, giữ slug | PASS | `oc-eo-learning.mdx:4` vi/en = `category: ai`, `slug: oc-eo-learning`; `CaseStudyFilter.tsx:18` hỗ trợ filter `ai`; `solutions/ai/page.tsx:43` tìm theo slug → teaser không rớt |
| 10 | `relatedCases` wiring (R-06e) | PASS | `boxai.mdx:64-65` + `flycam.mdx:72-73` = `[oc-eo-learning]`; `solutions/ai/[slug]/page.tsx:47` render `CaseStudyLink` |
| 11 | Số liệu trace được về nguồn A/B/C | PASS (1 nit MINOR) | 45s/50min/35–40min/6km/10km/11.300ha/300–500ha/lịch I–V/21 thuật toán/16 kênh/433ha/~200 cam/12 tuần — đều bám B.4–B.8, C.1–C.4 |
| 12 | HTML/JSX an toàn, link không dead | PASS | MDX frontmatter-only (không nhúng HTML/JSX); route đích tồn tại và build SSG thành công |
| 13 | MAJOR validator (home.ts) đã xử lý | PASS | `git diff src/content/home.ts` chỉ đổi 2 dòng `featuredCase` (surgical) |

## Findings

### CRITICAL
- (none)

### MAJOR
- (none)

### MINOR
- **[MINOR-1] `custom-ai` thiếu section "điểm khác biệt" tường minh so với enum R-06a.**
  `src/content/solutions/vi/custom-ai.mdx:19-61` (và `en/custom-ai.mdx:19-61`) có đủ vấn đề/định nghĩa/4 nguyên tắc/
  3 template/hành trình/kênh/an toàn/tiến độ-tầm nhìn/đối tượng, nhưng R-06a liệt kê thêm "**khác biệt**" và "CTA".
  Một phần đã nằm trong `benefits` (fast-to-value, local-first) và CTA được page render sẵn (`CTAForm`).
  **Đề xuất:** thêm 1 section "Điểm khác biệt" (5 ý A.1: fast to value / non-tech / safe-by-design / grows with you /
  local-first) nếu muốn khớp 1:1 R-06a. Không chặn PASS (acceptance binding chỉ yêu cầu platform/template/lợi ích/use case).
- **[MINOR-2] `boxai` highlight kênh "4–16" lệch nhẹ so với nguồn B.4.**
  `src/content/solutions/{vi,en}/boxai.mdx:24-25` ghi "4–16 kênh mỗi box", nhưng B.4 hợp nhất các mức = **2–16**
  (mức rất nặng 2–4 kênh). Section "Chọn tổ hợp…" trong cùng file đã ghi đúng "2–6 kênh/box" cho tải nặng.
  **Đề xuất:** đổi highlight thành "2–16" (hoặc "tùy tải") để đồng nhất & trace chính xác. Không bịa số, chỉ understate.
- **[MINOR-3] Doc reconcile chưa hoàn tất (close-out item).**
  `docs/DESIGN.md:101-119` (current-state Screen chi tiết giải pháp AI) chưa phản ánh content/field mới
  (benefits/sections/highlights/faq) — spec-validator m-1 đã ghi. Task DoD yêu cầu "Doc Impact/Reconcile recorded";
  cần reconcile `docs/DESIGN.md` khi close-out. Không phải defect code.

### Ghi nhận / Residual risk (không tính FAIL)
- **BR-004 (quyền công bố tên):** nội dung public nêu tên khách hàng "Khu di tích Óc Eo – Ba Thê" và
  "Đền Bảo Hà" (`boxai.mdx:57`). Change file (user authorize) yêu cầu nội dung này, nhưng needs-input #3
  (xác nhận quyền công bố) chưa có evidence trong repo. **Cần human confirm trước khi publish** — reviewer không
  kiểm chứng được qua diff/test. Wording hiện tại trung tính, không bịa số → không chặn PASS.
- **Óc Eo "phương án" vs "đã triển khai":** builder chọn nhánh an toàn ("phương án đề xuất", kết quả kỳ vọng),
  đúng yêu cầu BR-004 khi chưa xác nhận. Nếu user xác nhận đây là **dự án đã triển khai** thì cần cập nhật lại
  title/result (vi/en + home.ts) — theo dõi ở close-out.
- **"Đền Bảo Hà" ngữ nghĩa:** `boxai.mdx:58` dùng "NTA **đã triển khai** giải pháp tại Đền Bảo Hà" — traceable về
  change §2 ("dự án triển khai thực tế tại Đền Bảo Hà"). Số liệu chi tiết đã bị lược đúng yêu cầu.
- **Process:** số lượng `Read/Glob/Grep` vượt soft-cap STRICT (25) trong lúc trace wiring; đã dừng đọc, không
  đọc thêm ngoài phạm vi cần thiết.
- **Browser verify:** không có môi trường browser → responsive/render thực tế chưa quan sát trực tiếp (content-only).

## Verdict

✅ **PASS**

Không còn CRITICAL/MAJOR. 3 MINOR (không chặn) + 2 residual risk cần human confirm (BR-004 / trạng thái Óc Eo)
được ghi nhận để xử lý ở close-out trước khi publish public. Verify `lint`/`typecheck`/`build` đều PASS,
SSG đủ 8 route của task.
