# Review — feature contact-page-redesign · phase-1-task-01 · round 1

**Agent:** reviewer (thực hiện trong phiên, không sửa source khi review) · **Level:** NORMAL · **Verdict:** PASS

## Phạm vi diff
`src/lib/contact/company-info.ts` (mới), `src/lib/api/contact-schema.ts`, `src/lib/api/forward.ts`,
`src/lib/contact/useContactForm.ts`, `src/components/contact/ContactForm.tsx` (1 dòng kiểu `FIELDS`), `docs/API_SPEC.md`, spec 3.6.0.

## Kiểm tra
- Tương thích ngược API: payload CTA cũ (không phone/company/need) → 200; payload có `company:"" need:""` (hook mới gửi) → 200. PASS
- `company` 151 ký tự + `need:"abc"` → 400 `errors.company`, `errors.need`. PASS
- Payload đủ (`need:"crm"`, company, phone) → 200; forward gửi kèm `company`, `need`. PASS (đọc code)
- Hook: mặc định `options = {}` ⇒ phone tuỳ chọn, message ≤2000 → `CTAForm` không đổi hành vi. PASS
- Message lỗi company/need fallback `messages.summary` khi form không truyền (CTA không render 2 field này). OK
- Không còn dữ liệu liên hệ hardcode ở nơi khác (grep). OK
- Verify: `bash tools/linux-build.sh verify` → typecheck PASS · lint PASS (1 warning cũ `mdx/index.tsx`) · build PASS.

## MINOR
- `MAP_QUERY` dùng tên tòa nhà + ngõ: vị trí pin cần user kiểm trên trang thật (task 02 smoke).
