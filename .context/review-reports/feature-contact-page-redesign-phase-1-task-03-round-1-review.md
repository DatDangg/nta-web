# Review — feature contact-page-redesign · phase-1-task-03 · round 1

**Agent:** reviewer (thực hiện trong phiên) · **Level:** NORMAL · **Verdict:** PASS

## Phạm vi diff
`src/components/layout/Footer.tsx` (khối FooterContact dưới tagline), `src/i18n/messages/{vi,en}.json` (`footer.contact*`),
close-out (`spec/test-scope/current.json` v32, archive change doc, BACKLOG, progress).

## Kiểm tra
- SĐT/email/địa chỉ lấy từ `company-info.ts` (không hardcode lần 2); `tel:`/`mailto:` đúng; `<address>` cho địa chỉ. PASS
- Nhãn sr-only "Điện thoại:/Email:/Địa chỉ:" trước giá trị; icon `aria-hidden`; vùng `section aria-label`. PASS
- 1440: nằm dưới tagline cột thương hiệu, lưới 12 cột giữ nguyên; 1024 + 375: không tràn ngang. PASS
- BACKLOG: chỉ stage dòng CR-008 (dòng CR-010 của phiên khác để nguyên trong working tree). PASS
- Verify: typecheck PASS · lint PASS · build PASS.
