# Run Journal — change solution-detail-redesign · T3→T5 marathon (cont)

## step: T3 — migrate `features` 8 file .mdx — status=awaiting ✅ DONE (code+verify)

### filesTouched
- `src/content/solutions/vi/crm.mdx` · `en/crm.mdx` — 4 features split title/description (tách ở `—`)
- `src/content/solutions/vi/hrm.mdx` · `en/hrm.mdx` — 3 features không có `—`/`:` → chỉ `title`
- `src/content/solutions/vi/dentgo.mdx` · `en/dentgo.mdx` — 4 features split tại `—`
- `src/content/solutions/vi/lms.mdx` · `en/lms.mdx` — copy §11.2 (VI title §5.1 + desc §11.2; EN title giữ
  nguyên — spec không có bảng EN title riêng, chỉ §11.2 desc; ghi nhận là quyết định)
- `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:81` — map features ghép lại
  `title — description` cho FeatureList (mặc định map `f.title` sẽ làm MẤT description trong
  khoảng T3→T4 khi trang chưa chuyển layout mới). Text render lại = chuỗi gốc y hệt.

### Verify
- `npm run lint` → 0 errors (1 warning pre-existing mdx `<img>` ngoài scope)
- `npm run typecheck` → PASS
- `npm run build` → PASS 51/51, 8 route enterprise SSG
- `scripts/screenshots/.tmp/verify-t3.mjs` → 8/8 route đủ title (crm 4 · hrm 3 · dentgo 4 · lms 4 × VI/EN)
  + LMS desc §11.2.1 VI + §11.2.4 EN render trong HTML
- soi HTML crm VI: `<span>Tổng quan vận hành hằng ngày — màn hình chào…</span>` = chuỗi gốc trước migrate

### Quyết định
- CRM/HRM/DentGo: GIỮ NGUYÊN câu chữ, split tại `—` (rule §8.1). HRM không có dấu tách → title-only.
- LMS: dùng copy §11.2 đã duyệt (không theo rule split).
- acceptance T3 "câu chữ giống hệt bản gốc" ✓ (render lại bằng cách nối `title — description`).

---

## step: T3 review (NORMAL) — status=awaiting ✅ DONE
- Report: `.context/review-reports/change-solution-detail-redesign-phase-1-task-03-round-1-review.md`
- **Verdict PASS** — 0 CRITICAL/MAJOR, 6 MINOR (follow-up T4–T5 + commit hygiene).
- Verify của reviewer bị env block (ExecutionPolicy npm.ps1 + allowlist) → primary đã chạy
  lint/typecheck/build + verify-t3.mjs TRƯỚC review (PASS) → residual covered.
- MINOR đã ghi nhận: #1 bridge `title — description` T4 BẮT BUỘC revert · #2 lms.mdx thiếu
  `layout: 'lms'` (T5) · #3 EN title LMS giữ bản cũ (spec không có bảng EN) · #4 desc chữ thường
  đúng rule §8.1 (mâu thuẫn ví dụ trong spec — theo rule table) · #5 commit đúng 9 file T3 · #6 thiếu task file.

---

## step: T3 close-out + commit — status=running
- next: commit 9 file T3 → T4 (CRM/HRM/DentGo layout mới)
