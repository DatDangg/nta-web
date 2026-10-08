# Spec Update — 2026-10-09 fix-blog-list-date-format

**spec_version:** 1.0.0 → 1.0.1 (**PATCH — làm rõ**)
**Trigger:** feature-update
**Requirements:** SỬA (làm rõ) **R-09** — bổ sung: format ngày trên card blog **list** dùng **cùng format
locale** với detail (design S11): VI `dd/mm/yyyy` (`08/10/2026`), EN `Oct 8, 2026`; tách **1 nguồn util
dùng chung** (`src/lib/format/date.ts`) để tránh lệch lại.
- Nguồn conflict: **C-L2-1 (MED)** — `PostCard.tsx:20` dùng `Intl.DateTimeFormat(locale, { dateStyle: 'medium' })`
  (VI "8 thg 10, 2026") ≠ `ArticleHeader.tsx:8` (`dd/mm/yyyy`) ≠ design S11 `.context/design-spec.md:487`.
- KHÔNG đổi R-09 về route/phạm vi; KHÔNG thêm/xoá requirement.

**Ảnh hưởng:** module `blog` (list + detail). Không đổi API/DB/contract. Không thêm route.

**Lý do bump PATCH:** requirement văn bản của R-09 được **làm rõ** (format ngày list = detail) —
`.agent/spec-publish.md` §1: "PATCH làm rõ".

**Test scope:** `spec/test-scope/current.json` → `trigger: feature-update`, `scopeVersion` 2 → 3, `risk: low`.
