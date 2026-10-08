# Spec Review — feature fix-blog-list-date-format · phase 1 · round 1

Agent: spec-validator

> ⚠️ **Inline self-review** — env subagent depth limit chặn spawn spec-validator độc lập. Report do
> change-request thực hiện tại chỗ. Primary chạy lại **spec-validator Layer 2 round 2** riêng (ngoài scope change này).

## Scope
Cross-check change `spec/changes/2026-10-09-fix-blog-list-date-format.md` (C-L2-1 MED) ↔ spec delta
(`SPECIFICATIONS.md` R-09 clarify, `spec/updates/2026-10-09-fix-blog-list-date-format.md`) ↔
design S11 (`.context/design-spec.md:487`) ↔ code thật.

## Coverage matrix

| Yêu cầu change | Nguồn | Status | Evidence |
|---|---|---|---|
| Blog list VI `08/10/2026` (dd/mm/yyyy) | change AC1; design S11:487; R-09 clarify | ✅ | `.next/server/app/vi/blog.html` chứa `08/10/2026`; `PostCard.tsx:20` → `formatPostDate` |
| Blog list EN `Oct 8, 2026` | change AC1; design S11:487 | ✅ | `.next/server/app/en/blog.html` chứa `Oct 8, 2026` |
| Blog detail không regression (VI `08/10/2026`, EN `Oct 8, 2026`) | change AC2; design S11:487 | ✅ | `ArticleHeader.tsx:9` → `formatPostDate`; cùng util |
| 1 nguồn format dùng chung | change AC3 | ✅ | `src/lib/format/date.ts`; cả 2 component import, 0 inline `Intl.DateTimeFormat` còn lại cho post date |
| Không đụng `CaseStudyCard` | change Ghi chú | ✅ | `git diff` không chạm; `dateStyle` grep 0 |
| lint/typecheck/build PASS + SSG giữ | change AC4 | ✅ | exit 0/0/0; `● /[locale]/blog`; prerender-manifest `/vi/blog` |
| A11y `<time dateTime>` giữ (R-24) | change refs | ✅ | `PostCard.tsx:20` + `ArticleHeader.tsx:17` còn `<time dateTime={post.date}>` |

## Spec delta check
- `SPECIFICATIONS.md` R-09: đã thêm bullet làm rõ format ngày list = detail + 1 nguồn util. ✅
- Frontmatter: `spec_version` 1.0.0 → **1.0.1** (PATCH — làm rõ). ✅
- `spec/updates/2026-10-09-fix-blog-list-date-format.md` + `spec/CHANGELOG.md` dòng 1.0.1. ✅
- Không đổi route/scope R-09; không thêm/xoá requirement. ✅

## Conflict C-L2-1 resolution
- Trước: list `dateStyle:'medium'` (VI "8 thg 10, 2026") ≠ detail `dd/mm/yyyy` ≠ design S11.
- Sau: list = detail = design S11 (VI `08/10/2026`, EN `Oct 8, 2026`), 1 nguồn util. **C-L2-1 đóng.**

## Verdict
**PASS** (change/task-level).

## Residual risk
- Inline self-review (không độc lập) — primary cần re-run spec-validator Layer 2 round 2.
- M-2/M-4/residual SSG pagination KHÔNG thuộc change này (giữ nguyên).
- Chưa browser-test trực quan.
