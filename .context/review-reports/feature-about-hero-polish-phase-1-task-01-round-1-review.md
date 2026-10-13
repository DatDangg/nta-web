Agent: reviewer

# Review — feature-about-hero-polish · phase-1-task-01 · round 1 (CR-015)

- Ngày: 2026-10-14
- Task: `tasks/feature-about-hero-polish/phase-1-task-01.md`
- Change doc: `spec/changes/2026-10-13-about-hero-polish.md`
- Diff review: `src/components/about/AboutHero.tsx` (+22/-4). `git diff --stat` src chỉ có file này → `HeroWaves` / `ListingHero.tsx` / `DetailHero.tsx` KHÔNG đổi.

## Review level
NORMAL

## Reason
1 component trang `/about` (UI polish + bug layer nền). Không đụng shared component (HeroWaves chỉ được dùng với prop khác, không sửa), không API/auth/schema/data.

## Blast radius
`/about`, `/en/about` (hero + vùng đầu section AboutValues). ListingHero/DetailHero không bị ảnh hưởng (HeroWaves không đổi, chỉ AboutHero truyền `className="h-full"` giống DetailHero).

## Verify commands + result
- `npm run typecheck` — PASS (primary chạy)
- `npm run lint` — PASS, 0 error, 1 warning cũ `src/components/mdx/index.tsx:25` (ngoài scope)
- `npm run build` — PASS 59/59 static pages (primary chạy ở terminal user; sandbox lỗi native binding @swc)
- Smoke trình duyệt (server prod http://localhost:3100, route chuyển về `/en/about` do cookie locale; VI dùng cùng component):

| Viewport | scrollWidth / clientWidth | Wrapper hero bottom = section kế top | elementFromPoint mép trên 3 thẻ | Ảnh (left,right,top,bottom) | radius / shadow |
|---|---|---|---|---|---|
| 375 | 375 / 375 | 1084.6 = 1084.6 | self ×3 | 16,359 — trong container | 0px / none |
| 768 | 753 / 753 | 1113.0 = 1113.0 | self ×3 | 24,729 — trong container | 0px / none |
| 1280 | 1265 / 1265 | 697 = 697 | self ×3 | 697,1265 — chạm mép phải viewport | 0px / none |
| 1440 | 1425 / 1425 | 711 = 711 | self ×3 | 777,1432 (dư 7px dưới scrollbar, bị overflow-hidden cắt) | 0px / none |

Computed mask: lg+ `linear-gradient(90deg, transparent, #000 30%), linear-gradient(transparent, #000 12%, #000 68%, transparent)`; mobile/tablet fade 10%/90% ngang, 8%/78% dọc; `mask-composite` áp dụng (Chrome báo `source-in`).
Khoảng hàng chỉ số → đáy hero (1280): ~78px (= `md:pb-16` + căn giữa grid) — không còn khối trắng ~180px như ảnh lỗi. Khoảng đáy hero → thẻ ~96px là padding sẵn có của AboutValues (ngoài scope).
Screenshot (bằng chứng, trong tool-results phiên này): 1440 desktop (ảnh bleed phải, fade trái/dưới, 3 thẻ đủ viền + bo góc), 375 (ảnh gọn trong container, fade nhẹ, thẻ Mission đủ viền), 768. Lưu ý: screenshot ở 1280 bị tool chụp lệch do DPR=2 → dùng số đo JS làm bằng chứng cho mốc này.

## Responsive Checklist Gate
- Layout — không tràn ngang: OK (bảng trên, 375/768/1280/1440). Mobile-first `lg:`/`xl:` min-width: OK. Grid dùng `minmax(0,…)` sẵn có: OK.
- Typography/Spacing: N/A (diff không đổi chữ/spacing scale).
- Media: OK — `next/image fill` trong box có `aspect-[4/3]` (mobile) / `h-[480px]` `xl:h-[520px]` (lg+); `sizes` cập nhật `(min-width:1024px) 48vw, 100vw` khớp độ rộng hiển thị (568px @1280 ≈ 44vw, 655px @1440 ≈ 45vw).
- Touch/Interaction: N/A (không thêm phần tử tương tác).
- Viewport/A11y: OK — không dùng `100vh`; `overflow-hidden` trên wrapper dùng để clip lớp nền trang trí + phần bleed dư scrollbar, không che lỗi layout (đã đo scrollWidth); `motion-load` + `data-motion-off` giữ nguyên.

## Skill gates
- aislop: skip — không chạy (diff 1 file UI 26 dòng; soát tay: không dead code / fallback ẩn / `as any`).
- oxlint (anti-slop): skip, oxlint not configured (lint dự án = `npm run lint` PASS).
- ocr: skip, ocr not installed.
- AI-readable: OK — 0 indicator (tên `fadeMask` rõ nghĩa, comment giải thích WHY cho margin âm và `source-in`).
- ai-friendly-web: N/A (không đổi route/meta/robots/sitemap).
- blitzstrike: N/A.
- impeccable / frontend-checklist: OK — so mockup: ảnh bleed mép phải, fade trái + dưới, không bo/không shadow; mobile gọn.

## Findings
- [MINOR] `src/components/about/AboutHero.tsx:39-40` — hero giờ cắt đúng chiều cao, nền wrapper `#f7fbfb` + HeroWaves `fadeTo` mặc định `to-[#f7fbfb]` gặp section AboutValues nền trắng `rgb(255,255,255)` → có một đường nối màu cứng (nhìn thấy nhẹ ở 375 và 1440). Đề xuất (tuỳ chọn, task sau): `HeroWaves fadeTo="to-white"` + wrapper fade/bg trắng ở đáy như DetailHero, hoặc cho AboutValues nền `#f7fbfb`. Không chặn PASS.
- [MINOR] `src/components/about/AboutHero.tsx:73` — margin âm tính bằng `100vw` (gồm scrollbar) → ở ≥1281px khung ảnh vượt clientWidth ~½ scrollbar (7px @1440), đã bị `overflow-hidden` cắt nên không tràn ngang; phần ảnh 7px bị cắt không đáng kể. Không cần sửa.
- [MINOR] Residual: không kiểm Safari (`-webkit-mask-composite: source-in`) và route VI riêng (cookie chuyển về `/en/about`; cùng component, text dài hơn có thể đổi chiều cao hero nhưng wrapper `h-full` tự co giãn).

## Verdict
✅ PASS — không có CRITICAL/MAJOR. Acceptance đạt: lớp nền không còn đè thẻ Sứ mệnh/Tầm nhìn/Giá trị cốt lõi (đủ viền + bo góc ở 375/768/1280/1440), không tràn ngang, không còn khoảng trắng thừa dưới hàng chỉ số, ảnh Kim Hoàn bỏ bo/shadow + fade viền theo mockup, HeroWaves/ListingHero/DetailHero không đổi, typecheck/lint/build PASS.
