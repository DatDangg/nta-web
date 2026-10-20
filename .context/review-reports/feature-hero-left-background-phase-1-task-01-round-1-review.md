Agent: reviewer

# Review — feature-hero-left-background · phase-1-task-01 · round 1 (CR-043)

- Change doc: `spec/changes/2026-10-20-hero-left-background.md` (MODIFY, UI-only)
- Scope diff: `git diff HEAD -- src/components/home/HeroVisual.tsx src/components/home/Hero.tsx` + `public/images/home/hero-bg.webp` (1916×821)
- Spec: `SPECIFICATIONS.md` R-01b dòng 64–69 (4.11.0 — CR-043) · As-built: `docs/DESIGN.md:88`

## Review level
NORMAL

## Reason
Chỉ đổi nền hero trang chủ (1 component trang, không shared/API/auth/schema). Không FAST vì đụng layout responsive toàn dải lg+ (1024 → 3440) với CSS container-query tính tay, có nguy cơ chồng chữ/cắt panel.

## Blast radius
- `src/components/home/HeroVisual.tsx` (`HeroBackground`, `HeroMobileImage`) — chỉ dùng trong `Hero.tsx` (route `/`, `/en`).
- `Hero.tsx`: chỉ đổi comment.
- Asset mới `hero-bg.webp`; `hero-banner.jpg` không còn được tham chiếu trong `src/`.
- LCP trang chủ (ảnh `priority`).

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (`tsc --noEmit`, 0 lỗi) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn ngoài scope (`src/components/mdx/index.tsx:26` no-img-element) |
| build | không chạy (theo yêu cầu) |

CSS sinh ra được đối chiếu trong `.next/static/css/app/layout.css` (dev build hiện có):
- `:847-848` `top: calc((100cqh - min(max(100cqh, 100cqw * 821 / 1916), 877.6px)) * 0.35)` — hợp lệ.
- `:844-845` `right: max(0px, calc((100cqw - 2048px) / 2))` — hợp lệ.
- `:1469-1470` `width: min(max(100cqw, calc(100cqh * 1916 / 821)), 2048px)` — hợp lệ.
- `:1074` `aspect-ratio: 1916/821`, `:3314` `container-type: size`, `:5034` mask `@media (min-width: 2049px)` — đều sinh đúng.
(File còn class cũ của vòng thử trước, ví dụ `.top-[calc((100cqh_-_max(...))*0.35)]`, `.w-[max(...)]` — chỉ là CSS dev stale, prod build sẽ purge.)

## Kiểm tra CSS khung ảnh (CSS math)
Ký hiệu: V = bề rộng viewport, cqh = cao section = clamp(540, 0.46V, 662), W = rộng khung, H = W×821/1916.
- `top` dùng `min(max(cqh, cqw×821/1916), 877.6px)` = đúng H (2048×821/1916 = 877.56) → nhất quán với `width`. top = (cqh − H)×0.35 ≤ 0.
- Khung tràn trái (W > cqw) và tràn dưới (H > cqh) đều nằm trong `section.overflow-hidden` → **không có scroll ngang** ở 1024–3440. Không có khoảng trắng: W ≥ cqw và H ≥ cqh ở mọi V ≤ 2048; > 2048 khung 2048 căn giữa, hai bên là nền trắng + mask 12% (đúng acceptance).
- `sizes` so với W thật: 1024–1174 → 540×2.3337 = 1260px ✔; 1174–1440 → 1.0735V ≈ 107.4vw (khai 108vw, dư nhẹ, chấp nhận) ✔; 1440–1545 → 1545px ✔; 1545–2048 → 100vw ✔; ≥ 2048 → 2048px ✔. `priority` giữ nguyên cho LCP ✔. `fill` trong khung `absolute` + `aspect-ratio` có chiều cao xác định ✔.
- Panel trong khung: mép phải xa nhất = 17% + 97.3%×69.9% ≈ 85% khung → không bị cắt phải. Chiều dọc ở trường hợp xấu nhất (> 2048, H 877.6, top −75.5): ChartPanel top ≈ 97px, panel Ứng dụng top ≈ 368px, cao ≈ 10cqw-hộp ≈ 140px → đáy ≈ 508 < 566 (bắt đầu dải mờ đáy) → không cắt/không chìm.

## Responsive Checklist Gate
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không scroll ngang | OK | khung tràn được clip bởi `section.overflow-hidden` (Hero.tsx:21) |
| Mobile-first / min-width | OK | `hidden lg:block`, `min-[2049px]:` |
| Container không fixed px | OK | khung theo `cqw/cqh`, chỉ cap 2048px |
| Typography rem/clamp | N/A | không đổi typography |
| Media: aspect-ratio + sizes | OK | `aspect-[1916/821]`, `sizes` khớp W (xem trên) |
| Touch target / nav | N/A | không đổi |
| 100vh / reduced-motion | N/A | không đổi; hiệu ứng `motion-load-zoom`/`hero-pop` có sẵn |
| Không che lỗi bằng overflow:hidden | OK | overflow-hidden có từ trước, dùng để crop nền có chủ đích |
| **Layout chữ ↔ panel ở dải lg (1024–1075)** | **FAIL** | xem Finding M1 |

## Skill gates
| Gate | Kết quả |
|---|---|
| aislop | skip, aislop chưa cài trong repo |
| oxlint (anti-slop) | skip, oxlint not configured |
| ocr (open-code-review) | skip, ocr not installed |
| AI-readable | OK — 0 indicator: comment giải thích lý do/công thức, không hàm mới, magic number 1916/821/2048/877.6/0.35 có giải thích trong JSDoc |
| ai-friendly-web | N/A — không đổi metadata/robots/sitemap |
| blitzstrike | N/A — UI-only |
| impeccable / frontend-checklist | xem Finding M1 (chồng chữ), m3 (tương phản) |

## Findings

### [MAJOR]
**M1 — Panel kính trái (AI + Quản trị doanh nghiệp) trượt vào dưới cột chữ ở 1024–~1075px (regression so với CR-042).**
`src/components/home/HeroVisual.tsx:150,160,163` + `Hero.tsx:25` (`lg:max-w-[40%]`, Container `lg:px-8`).
- Mới: ở 1024–1174 khung rộng cố định 1260px, neo phải → mép trái panel `left-[46.2%]` của hộp = V − 1260 + 0.17×1260 + 0.462×0.699×1260 ≈ **V − 639px**.
- Mép phải cột chữ = 32 + 0.4×(V − 64) = **0.4V + 6.4px**.
- Chồng khi V − 639 < 0.4V + 6.4 → **V < ~1075**. Tại 1024: panel bắt đầu ở x ≈ 385px, cột chữ (đoạn mô tả 48ch bị giới hạn 384px nên lấp đầy, cụm 2 nút) tới x ≈ 416px → chồng ≈ 31px. Theo chiều dọc: AI panel top ≈ 150px, Quản trị top ≈ 267px trong section cao 540 — nằm trong khối chữ (≈ 105–435px).
- Trước thay đổi (khung 1097px): panel ở V − 592 → không chồng từ 998px trở lên.
- Tham khảo: ở 1440 khe còn ≈ 10px (trước ≈ 67px) — chưa chồng nhưng rất sát (xem m1).
- Fix đề xuất (builder chọn 1): (a) ở dải < 1176 dịch khung sang phải (vd `right` âm ~ −48px khi cqh = 540; còn dư ≈ 189px lề phải sau panel nên không cắt panel), hoặc (b) giảm `lg:max-w` cột chữ ở 1024–1279 (vd 37%), hoặc (c) tăng hộp panel lệch phải. Sau fix chụp 1024 / 1050 / 1100 / 1440 vi + en để xác nhận.

### [MINOR]
- **m1** — Khe chữ ↔ panel ở 1280–1545 chỉ ≈ 10–16px (min ≈ 10px tại 1440). Không chồng nhưng bản en/vi có tiêu đề dài có thể chạm; nên kiểm bằng ảnh chụp 1440 vi + en (acceptance có 1440).
- **m2** — Mask bật theo media `min-width: 2049px` (viewport, gồm scrollbar) còn khung căn giữa theo `100cqw > 2048` (không gồm scrollbar). Viewport 2049 – ~2064 trên Windows: khung vẫn full-bleed nhưng đã bị mask → hai mép màn hình mờ trắng 12%. Dải rất hẹp, tác động nhỏ. Có thể dùng `@container` query thay media hoặc chấp nhận.
- **m3** — Tương phản chữ trên lớp phủ nhẹ: mép phải cột chữ ở ≈ 40–45% bề ngang, nơi lớp phủ chỉ còn ≈ 0.45–0.35 trắng; `text-text-secondary` của đoạn mô tả nằm trên ảnh thành phố. Không đo được bằng CSS (phụ thuộc pixel ảnh) → Residual risk; nên đo contrast trên ảnh chụp 1100/1440/1920.
- **m4** — `hero-bg.webp` rộng 1916px nhưng khung tối đa 2048px → phóng ≈ 7% ở V ≥ 2048 (hơi mềm). Chấp nhận được; ghi nhận.
- **m5** — `public/images/home/hero-banner.jpg` không còn tham chiếu trong `src/` (chỉ còn trong comment `VmsMock.tsx:9`). Nên xoá ở close-out hoặc ghi lý do giữ.

## Docs
- `SPECIFICATIONS.md:64-69` (R-01b 4.11.0) và `docs/DESIGN.md:88` khớp code: hero-bg 1916×821, `container-type:size`, công thức width/neo phải/neo dọc 35%, cap 2048 + mask 12%/88%, hộp panel 17%/7%/69.9%×80.4%, lớp phủ 0.85→0.72(30%)→0.35(45%)→0(58%), `object-[75%_50%]`. ✔
- Comment code đúng với công thức (bảng `sizes` trong comment khớp tính toán). Không thấy tham chiếu thừa trong diff (gradient che mép trái, stage 1440 đã gỡ sạch).

## Residual risk
- Không chạy app/browser (ngoài quyền reviewer) → M1, m1, m3 suy từ CSS math; khối chữ thực tế có thể hẹp hơn 40% một chút tuỳ ngắt dòng, nhưng đoạn mô tả 48ch luôn chạm max-width ở 1024.
- Không kiểm được panel HTML "đè khớp" panel vẽ sẵn trong ảnh (cần ảnh chụp).

## Verdict
❌ FAIL — 1 MAJOR (M1: panel chồng cột chữ ở 1024–~1075px, regression responsive dải lg). Trả về builder sửa M1 rồi review round 2; m1–m5 tuỳ chọn.
