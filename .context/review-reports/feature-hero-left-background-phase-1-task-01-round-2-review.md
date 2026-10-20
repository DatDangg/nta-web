Agent: reviewer

# Review — feature-hero-left-background · phase-1-task-01 · round 2 (CR-043)

- Change doc: `spec/changes/2026-10-20-hero-left-background.md` (MODIFY, UI-only)
- Round 1: `.context/review-reports/feature-hero-left-background-phase-1-task-01-round-1-review.md` (FAIL — M1)
- Scope diff: `git diff HEAD -- src public` → `src/components/home/HeroVisual.tsx`, `src/components/home/Hero.tsx` (comment), `public/images/home/hero-banner.jpg` (deleted, staged), `public/images/home/hero-bg.webp` (untracked, mới)

## Review level
NORMAL

## Reason
Round 2 chỉ đổi 1 class `right-[...]` trên khung ảnh + JSDoc, và xoá asset không còn dùng. Component trang (route `/`, `/en`), không shared/API/auth/schema. Giữ NORMAL (không FAST) vì CSS container-query tính tay ảnh hưởng layout toàn dải lg+.

## Blast radius
- `HeroBackground` trong `HeroVisual.tsx` — chỉ dùng ở `Hero.tsx`.
- Xoá `hero-banner.jpg`: không còn tham chiếu runtime (xem dưới).
- LCP hero: `sizes`/`priority` không đổi.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (`tsc --noEmit`, 0 lỗi) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn ngoài scope (`src/components/mdx/index.tsx:26` no-img-element) |
| build | không chạy (theo yêu cầu) |
| CSS sinh ra | `.next/static/css/app/layout.css:857` → `right: calc(max(0px, (100cqw - 2048px) / 2) - min(max(0px, 100cqh * 1916 / 821 - 100cqw), 56px));` — hợp lệ (dấu `-` trong calc có khoảng trắng hai bên, `*`/`/` không cần) |
| Tham chiếu `hero-banner` trong `src/` | chỉ còn comment lịch sử `src/components/case-studies/showcase/VmsMock.tsx:9` (không phải đường dẫn asset). Ngoài `src/`: chỉ `tasks/change-home-hero-banner/phase-1-task-01.md` (task cũ, lịch sử) |

## Kiểm tra M1 / m1 (CSS math)
Ký hiệu: cqw/cqh = rộng/cao section, W = `min(max(cqw, cqh×1916/821), 2048)`, E = `max(0, cqh×1916/821 − cqw)` (phần ảnh thừa bên trái), shift = `min(E, 56px)`.
- `right = max(0,(cqw−2048)/2) − shift`.
  - cqw < 2048: số hạng 1 = 0; khi E > 0 thì W = cqh×1916/821 (cap 2048 không chạm vì cqh×1916/821 ≤ 1545) → W − cqw = E → mép trái khung = −E + shift ≤ 0 → **không hở mép trái**. Mép phải khung = cqw + shift ≥ cqw → **không hở mép phải** (phần lố bị `section.overflow-hidden` cắt, không scroll ngang).
  - cqw ≥ ~1545: E = 0 → shift 0, công thức như round 1 (full-bleed / > 2048 căn giữa + mask). ✔
- Chiều dọc: `top`/`width` không đổi → H ≥ cqh, top ≤ 0, đáy khung = 0.35cqh + 0.65H ≥ cqh → không hở đáy. ✔
- Panel không bị cắt phải: mép phải xa nhất = 17% + 97.3%×69.9% ≈ 85% W. Ở 1024 (cqw ≈ 1009, W 1260, left −195): 0.85×1260 − 195 ≈ 876 < 1009 ✔. Ở 1530 (left 0, W 1545): ≈ 1313 < 1515 ✔. Dải 1545+ như round 1 ✔. Khớp số đo builder (mép phải panel < bề rộng section ở mọi mốc).
- Khe chữ ↔ panel (CSS math, so với số đo dev server): 1024 mép trái panel ≈ −195 + 0.17×1260 + 0.462×0.699×1260 ≈ 416 so với mép phải cột chữ ≈ 0.4×1009 + 6 ≈ 410 → hết chồng (đo thật 21px do khối chữ thực hẹp hơn 40% một chút). 1440 khe đo 65px (round 1 ≈ 10px). **M1 đã fix, m1 đã cải thiện rõ.**
- `sizes`: W không đổi (shift chỉ dịch, không đổi kích thước) → bảng `sizes` round 1 vẫn khớp ✔.

## Responsive Checklist Gate
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không scroll ngang | OK | khung lố phải ≤ 56px, clip bởi `section.overflow-hidden` (Hero.tsx) |
| Không hở mép trái/phải/đáy 1024–3440 | OK | xem CSS math trên |
| Layout chữ ↔ panel dải lg | OK | khe ≥ 21px ở 1024, 65–84px ở 1280–1530 (số đo builder, khớp math) |
| Media: aspect-ratio + sizes | OK | không đổi |
| Mobile-first / min-width | OK | không đổi |

## Skill gates
| Gate | Kết quả |
|---|---|
| aislop | skip, aislop chưa cài trong repo |
| oxlint (anti-slop) | skip, oxlint not configured |
| ocr | skip, ocr not installed |
| AI-readable | OK — JSDoc giải thích lý do + giới hạn 56px + trỏ review M1/m1 |
| impeccable / frontend-checklist | OK cho chồng chữ; tương phản xem m3 (residual) |

## Findings

### [MAJOR]
Không còn. M1 (round 1) — **RESOLVED**.

### [MINOR]
- **m1** (round 1) — RESOLVED (khe 1440 từ ≈ 10px lên 65px).
- **m5** (round 1) — RESOLVED (`hero-banner.jpg` đã `git rm`, không còn tham chiếu runtime).
- **m2, m3, m4** (round 1) — giữ nguyên, builder chấp nhận → Residual risk.
- **n1 (mới, doc reconcile)** — `docs/DESIGN.md:88` (as-built) mô tả khung "neo phải" nhưng chưa ghi phần lùi khung sang phải tối đa 56px khi khung rộng hơn viewport (< ~1545). Cần reconcile ở close-out (as-built doc, không phải intent). `SPECIFICATIONS.md` R-01b: nếu acceptance chỉ yêu cầu "neo phải/không chồng chữ" thì không bắt buộc đổi; không chặn verdict.

## Residual risk
- m2: viewport 2049 – ~2064 (Windows có scrollbar) mask bật sớm hơn khung căn giữa → hai mép màn hình mờ trắng 12% trong dải rất hẹp.
- m3: tương phản đoạn mô tả trên lớp phủ nhẹ phụ thuộc pixel ảnh — chưa đo bằng công cụ contrast.
- m4: ảnh 1916px phóng ≈ 7% ở V ≥ 2048.
- Khe 1024 chỉ 21px — đủ, nhưng nếu copy tiêu đề/mô tả dài hơn sau này cần kiểm lại. Reviewer không chạy browser; dựa trên CSS math + số đo `getBoundingClientRect` builder cung cấp (vi; en chỉ 1024 qua ảnh chụp).

## Verdict
✅ PASS — M1 fixed, m1/m5 resolved, typecheck + lint PASS. Close-out: reconcile `docs/DESIGN.md:88` (n1).
