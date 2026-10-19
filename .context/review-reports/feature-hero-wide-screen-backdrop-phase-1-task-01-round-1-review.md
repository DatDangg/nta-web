# Review — feature-hero-wide-screen-backdrop · phase-1-task-01 · round 1

Agent: reviewer · 2026-10-19 · CR-041 · spec R-01b 4.9.0

## Review level
**NORMAL**

## Reason
Thay đổi chỉ ở UI, một component trang chủ (`HeroBackground`). Hiệu ứng thật chỉ có ở `lg+`, rõ nhất khi màn > 1440. Không đụng auth, API, schema hay shared service. Rủi ro gồm thẩm mỹ, tải thêm ảnh và LCP (R-22), nên không chọn FAST. Không có risk đỏ nên không cần STRICT.

## Blast radius
- `src/components/home/HeroVisual.tsx` → `HeroBackground` (chỉ trang chủ vi/en, chỉ `hidden lg:block`).
- `docs/DESIGN.md`: dòng hero as-built (as-built doc, không phải intent).
- Không đổi: `Hero.tsx`, `HeroMobileImage`, `Container` 1280, `sizes`/`priority` của ảnh nét, vị trí panel.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` (reviewer chạy lại) | PASS (`tsc --noEmit` không lỗi) |
| `npm run lint` (reviewer chạy lại) | PASS: 0 error, 1 warning đã có sẵn ở `src/components/mdx/index.tsx:26`, ngoài scope |
| `npm test` (evidence builder) | 196/199 pass. 1 fail có sẵn, ngoài scope (`tools/db/content-rules.test.ts`, thiếu `public/uploads` ở local) |
| `docker build --target builder` (evidence builder) | PASS 2 lần. Reviewer không chạy lại vì evidence đủ |

## Kiểm acceptance
| Tiêu chí | Kết quả | Căn cứ |
|---|---|---|
| > 1440 không còn mảng trắng trơn hai bên | OK | Ảnh 1920/2560/3840: bên phải là nền teal mờ nối tiếp ảnh, bên trái là thành phố mờ rất nhạt dưới lớp phủ |
| Không có cạnh cắt cứng ở mép stage | OK | Ảnh không thấy mép dọc. Mask `transparent→black 30%…88%→transparent` đặt trên `<img>`. Đo luminance trong evidence không thấy bước nhảy |
| Panel kính sát mép phải vẫn nét | OK | Mask đặt trên img, không đặt trên khung. Panel "Giải pháp & ứng dụng" nét ở cả 3 ảnh |
| Chữ dễ đọc | OK | Lớp phủ trái 0.9 sát stage, chữ đen/teal trên nền gần trắng |
| Mép chữ = khung Container 1280 | OK | h1 left 352/672/1312 = (W−1280)/2+32, chênh 0px. Giá trị 1312 ở 3840 là đúng |
| ≤ 1440 không đổi so với CR-040 | OK | Mọi thay đổi gắn `min-[1441px]:`, nhánh mặc định giữ nguyên class cũ (fade trái 30%, gradient `#fff`). Ảnh 1440 vẫn fade trắng, không có nền mờ. Số DOM ở 1440 trùng CR-040 |
| Không scroll ngang | OK | scrollWidth == clientWidth ở mọi viewport. Nền mờ `scale-110` nằm trong wrapper `overflow-hidden` |
| Ảnh nền mờ là decorative, không priority, `sizes` nhỏ | OK | `alt=""`, wrapper `aria-hidden`, không có `priority` (lazy), `sizes="640px"`. Ở ≤ 1440 nằm trong khối `display:none` nên không tải |
| Ảnh nét vẫn priority/LCP | OK | `priority` và `sizes` không đổi, preload vẫn còn |
| Doc impact | OK | `docs/DESIGN.md` đã cập nhật as-built, khớp code |

## Findings
- **[INFO]** Ở màn rất rộng (3840) hai bên không đối xứng: bên phải teal rõ, bên trái gần trắng. Đây là chủ ý để chữ dễ đọc, đã ghi ở Residual risk. Cần người duyệt thẩm mỹ, không chặn.
- **[INFO]** Chromium đôi khi dùng lại bản `w=1920` từ memory cache cho ảnh mờ (cùng URL) thay vì `w=640`. Không phát sinh request thêm, không chặn.
- **[INFO]** `blur-2xl` trên ảnh `fill` khổ lớn tốn GPU khi vẽ lần đầu, chỉ ở > 1440 và là ảnh tĩnh. Rủi ro thấp.
- **[NOTE quy trình]** Lượt bash đầu tiên của reviewer có dùng `cd`/`sed`/`cat` để đọc file, nằm ngoài allowlist bash của reviewer. Lệnh đó chỉ đọc, không ghi gì. Các bước sau chỉ dùng lệnh được allow và Read.

Không có finding mức CRITICAL, HIGH hay MEDIUM.

## Verdict
**PASS**
