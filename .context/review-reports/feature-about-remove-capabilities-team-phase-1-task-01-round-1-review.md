# Review — feature-about-remove-capabilities-team · phase-1-task-01 · round 1

Agent: reviewer
Date: 2026-10-14
Change: CR-020 (REMOVE UI) — `/about` bỏ khối Năng lực (CapabilityGrid) + Đội ngũ (TeamGrid), bỏ nút `#team` trong AboutPeople, dọn component/i18n/data/ảnh.

## Review level
**NORMAL**

## Reason
Scope hẹp: 1 trang public, không API/auth/schema DB/tenant. Có xoá component + đổi type `AboutData` (dùng chung kiểu nhưng chỉ `/about` đọc) và xoá key i18n (file messages dùng chung toàn site) → không đủ hẹp cho FAST, không có risk đỏ cho STRICT.

## Blast radius
- `src/app/[locale]/about/page.tsx` (vi + en), `AboutPeople.tsx`.
- `AboutData` type + `getAboutData` (chỉ about page gọi).
- `src/i18n/messages/{vi,en}.json` namespace `about` — đã grep: không còn consumer cho các key bị xoá.
- Asset `public/images/about/team-ai.svg`, `team-domain.svg` — chỉ 2 mdx tham chiếu trước đó.
- Không ảnh hưởng: `HomeImage` (vẫn dùng ở trang chủ), `ListingIcon` (vẫn dùng ở AboutHero/AboutValues/home/listing/footer...), `team-people-temp.webp` (vẫn dùng ở AboutPeople).

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` (reviewer chạy lại) | PASS — 0 lỗi |
| `npm run lint` (reviewer chạy lại) | PASS — 0 error, 1 warning có sẵn ngoài scope `src/components/mdx/index.tsx:25` |
| `npm run build` (primary, terminal Windows) | PASS 59/59 (theo báo cáo primary; reviewer không chạy lại) |
| Grep `CapabilityGrid\|TeamGrid\|capabilitiesTitle\|teamTitle\|imageFallback\|team-ai\|team-domain\|#team\|people\.cta\|about\.team\|about\.capabilities` trong `src/ scripts/ public/` | 0 match thực (chỉ match rác trong cache Chrome `scripts/screenshots/.tmp/profile/...`, không phải code) |
| Grep tên component/asset toàn repo ngoài `.context/ tasks/ spec/ docs/ node_modules/ .next/` | 0 file |
| Prerender `.next/server/app/vi/about.html` | có "Con người NTA", "Hành trình phát triển"; KHÔNG có "Năng lực", `id="team"`, `href="#team"`, `team-domain` |
| Prerender `.next/server/app/en/about.html` | có "People of NTA", "Our journey"; KHÔNG có "Capabilities", "Our team", `id="team"`, `href="#team"` |

## Kiểm tra theo checklist
- Tham chiếu chết: không còn (import, i18n key, data mdx, asset).
- Không xoá thứ còn dùng: `HomeImage`, `ListingIcon`, `team-people-temp.webp` giữ nguyên và còn consumer.
- JSON i18n: diff chỉ xoá trọn dòng/khối, dấu phẩy hợp lệ; typecheck + build qua (next-intl load được messages).
- `AboutData` ↔ `assertRequiredFields` ↔ mdx: nhất quán (`mission`, `milestones`, `partners` có trong cả vi/en mdx và type).
- Thứ tự khối: Hero · Values · People · Milestones · Partners · CTA — giữ nguyên thứ tự còn lại, khớp R-04a 4.0.0.
- A11y: không còn link anchor trỏ tới id không tồn tại; heading còn lại không đổi cấp; AboutPeople vẫn có `alt` ảnh, h2.
- Spec: code khớp R-04/R-04a 4.0.0 (bỏ năng lực/team; khối People không còn nút).

## Findings

### CRITICAL
- Không có.

### MAJOR
- Không có.

### MINOR
1. **Task file lệch version spec** — `tasks/feature-about-remove-capabilities-team/phase-1-task-01.md` ghi "Spec: 3.11.0 → **3.12.0** (MINOR)" và spec delta draft dùng "3.12.0", nhưng `SPECIFICATIONS.md` thực tế là `spec_version: 4.0.0` (R-04/R-04a ghi 4.0.0). Status task vẫn "pending — chờ user duyệt", mục build ghi "BLOCKED" trong khi primary đã build PASS 59/59. → Cập nhật task file lúc close-out (version 4.0.0, status, build PASS) để source of truth nhất quán. Không chặn PASS.
2. **Câu chữ R-04 (`SPECIFICATIONS.md:82`)** liệt kê "sứ mệnh, milestones, đối tác" — không nêu "con người NTA" và "CTA" như đề xuất trong task file; R-04a dòng 91 đã có thứ tự đầy đủ nên không mâu thuẫn hành vi, chỉ là diễn đạt R-04 chưa đầy đủ. Tuỳ chọn chỉnh khi close-out.
3. (Ghi nhận, ngoài scope) frontmatter `mission` vẫn là required field nhưng không component nào đọc (dead data từ CR-014) — task đã ghi nhận out of scope; đề xuất CR riêng nếu muốn dọn.
4. (Residual) Smoke HTTP 200 + responsive 375/1440 chưa được xác minh bằng runtime; prerender HTML xác nhận nội dung đúng. Mất dải nền `variant="alt"` giữa các khối — đã chấp nhận trong task.

## Verdict
**PASS**
