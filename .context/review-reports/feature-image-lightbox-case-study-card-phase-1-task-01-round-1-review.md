Agent: reviewer

# Review — feature-image-lightbox-case-study-card · phase-1-task-01 · round 1 (CR-013)

- **Review level:** STRICT
- **Reason:** Thêm component dùng chung mới (`ui/Lightbox`) và sửa `ShowcasePhotos` (dùng trong `ShowcaseLayout` ở 4 route chi tiết); modal a11y (focus, inert, khoá cuộn).
- **Blast radius:** `/[locale]/case-studies/[slug]` (layout showcase), `/[locale]/solutions/enterprise/[slug]`, `/[locale]/solutions/ai/[slug]`, `/[locale]/products/[slug]` — vi/en. Namespace i18n `common.lightbox` (mới, không đụng key cũ). Không đụng API/schema/auth/data.
- **Phạm vi diff đã xem:** `src/components/ui/Lightbox.tsx` (mới), `src/components/case-studies/showcase/ShowcasePhotos.tsx`, `src/i18n/messages/vi.json`, `src/i18n/messages/en.json`. Không review `.context/project-config.md` (ngoài CR).

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS (0 error; 1 warning có sẵn `src/components/mdx/index.tsx:25` no-img-element — ngoài scope) |
| `npm run build` | Không chạy lại (theo chỉ dẫn: lỗi môi trường native binding swc khi nạp `next.config.ts` trong sandbox). Primary chạy ở terminal user — **kết quả build là điều kiện close-out**, chưa xác nhận trong report này |

## Acceptance check (theo code)
| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| Mở lightbox mọi variant (photo/screen/phone) | OK | Mỗi `<li>` bọc `<button type="button" absolute inset-0>`; `onClick` → `openLightbox(index)`; không phân nhánh theo variant |
| Ảnh đủ, không cắt | OK | `next/image fill object-contain`, khung `h-[min(78dvh,900px)] w-[min(92vw,1400px)]`, `sizes="92vw"` |
| Đóng X / Esc / bấm nền | OK | X `size-11` (44px) gọi `onClose`; Esc → native `cancel`→`close` → `handleNativeClose`; nền: click target không nằm trong `[data-lightbox-content]` → `onClose` |
| Trước/sau nút + ←/→ | OK | `go(±1)` vòng lặp `(i+step+total)%total`; `onKeyDown` trên dialog; ẩn nút khi `total<2` |
| Vuốt | OK | pointerdown/up ngưỡng 50px, `touch-pan-y`; `suppressNextClick` chặn click giả sau vuốt (tránh đóng nhầm), reset ở pointerdown |
| Bộ đếm | OK | `t('counter', {current: index+1, total})`, ẩn khi 1 ảnh; alt làm caption + `aria-describedby`, bỏ khi alt rỗng |
| Focus vào khi mở / trả focus khi đóng | OK (xem MINOR-1) | effect: `showModal()` → focus nút đóng; trả focus qua `openerRef` + focus restore native của `<dialog>` |
| Tab giữ trong lightbox | OK | `showModal()` → top layer, nền inert |
| Khoá cuộn | OK | `documentElement.style.overflow='hidden'`, khôi phục giá trị cũ ở cleanup (đóng + unmount) |
| reduced-motion | OK | transition/scale chỉ dưới `motion-safe:`; opacity đổi tức thì khi reduce |
| Mobile 375 không tràn | OK (CSS math) | dialog `fixed inset-0 w-full max-w-none`; khối trong `w-full px-4`, ảnh 92vw=345px nằm trong border-box 375px (lấn 1px vào padding, không tràn) |
| Không thêm dependency | OK | `package.json` không đổi |
| Không phá scroll-snap carousel | OK | `<li>` giữ nguyên class/`snap-start`/aspect; button `absolute inset-0` bên trong; nút trước/sau carousel không đổi |
| SSR/hydration | OK | `<dialog>` render đóng (UA `display:none`), `showModal` chỉ trong effect; `useId` cho caption |
| i18n VI/EN | OK | `common.lightbox.{open,label,close,prev,next,counter}` đủ 2 file; client messages truyền đủ qua `NextIntlClientProvider messages={messages}` (`src/app/[locale]/layout.tsx:69`) |
| Không rò listener/style khi unmount | OK | Không addEventListener thủ công; cleanup huỷ rAF, khôi phục overflow, `dialog.close()` |
| Không mở 2 lần trong StrictMode | OK | `if (!dialog.open) dialog.showModal()`; `handleNativeClose` bỏ qua `close` event trễ nếu dialog đã mở lại. Lightbox mount với `index=null` nên double-invoke lúc mount return sớm |
| Hooks order | OK | `useState`/`useTranslations` mới trong `ShowcasePhotos` đặt trước early-return `items.length===0` |

## Responsive Checklist Gate
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll 375/768/1280 | OK (CSS math) | dialog fixed full-viewport; nội dung `min(92vw,1400px)` |
| Mobile-first / không fixed px container | OK | width dùng `min(vw, px)`, nút `sm:` offset |
| Typography rem | OK | `text-sm` |
| Media — aspect/contain | OK | `fill` + `object-contain` trong khung xác định |
| Touch target ≥ 44px | OK | `CONTROL_CLASS size-11`; nút ảnh carousel phủ toàn item |
| Viewport — không 100vh thuần | OK | `78dvh` + `h-full` của dialog fixed |
| prefers-reduced-motion | OK | `motion-safe:` |
| Không che lỗi bằng overflow:hidden | OK | overflow hidden chỉ là scroll-lock có chủ đích, gỡ khi đóng |
| Residual | — | Chưa smoke test trình duyệt thật (Safari ≥15.4 `<dialog>`, vuốt thật, 375×667 với caption dài: tính toán cho thấy nội dung lấn vào padding `py-16`, không bị cắt) |

## Skill gates
- aislop: skip, `aislop` chưa cài (không có trong `node_modules/.bin`).
- oxlint (anti-slop): skip, oxlint not configured (không có `.oxlintrc*`).
- ocr (open-code-review): skip, ocr not installed.
- AI-readable: OK — 1 indicator (hàm component `Lightbox` ~100 dòng, phần lớn JSX), < ngưỡng 3. Hằng số đặt tên (`SWIPE_THRESHOLD_PX`), comment giải thích WHY.
- ai-friendly-web: N/A (không đổi route/metadata/robots/sitemap).
- blitzstrike: N/A (không có input/endpoint/auth). XSS: alt render qua React text, `t('open', {alt})` truyền alt làm tham số ICU (không phải message) → an toàn.

## Findings
- **[MINOR-1]** `src/components/case-studies/showcase/ShowcasePhotos.tsx:49` — `closeLightbox` gọi `openerRef.current?.focus()` khi dialog vẫn đang modal (X / bấm nền: `onClose` chạy trước khi effect cleanup `dialog.close()`), lúc đó nút mở còn inert nên lần focus này là no-op. Focus thực tế quay về nhờ (a) focus-restore native của `<dialog>` và (b) `close` event bất đồng bộ gọi `onClose` lần 2 (`Lightbox.tsx:61`). Hoạt động đúng nhưng ngầm định và `onClose` chạy 2 lần mỗi lần đóng. Đề xuất (không bắt buộc): trong Lightbox, nút X/bấm nền gọi `dialogRef.current.close()` và để mọi đường đóng đi qua `handleNativeClose` → `onClose` đúng 1 lần, sau khi inert đã gỡ.
- **[MINOR-2]** `src/components/ui/Lightbox.tsx:107` — vùng letterbox trống trong khung ảnh (92vw × 78dvh, ảnh `object-contain` nhỏ hơn khung) mang `data-lightbox-content` nên bấm vào đó không đóng. Chấp nhận được theo task ("không phải ảnh/nút"), ghi nhận UX.
- **[MINOR-3]** `src/components/ui/Lightbox.tsx:45` — khoá cuộn bằng `overflow:hidden` trên `<html>` làm mất scrollbar → layout nhảy ngang vài px trên desktop có scrollbar (sau backdrop nên ít thấy). Cùng pattern hiện có; có thể bù bằng `scrollbar-gutter: stable` nếu cần.

Không có CRITICAL/MAJOR.

## Residual risk
- `npm run build` chưa được reviewer xác nhận (lỗi môi trường sandbox) — primary phải ghi kết quả build từ terminal user trước khi commit; build FAIL → không commit.
- Chưa smoke test trình duyệt thật (focus Safari, vuốt thiết bị thật, 375/768/1280).

## Verdict
✅ **PASS** (có điều kiện close-out: `npm run build` PASS ở terminal user).
