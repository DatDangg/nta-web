Agent: reviewer

# Review — feature-about-page-redesign · phase-1-task-01 · round 2

- **Task:** `tasks/feature-about-page-redesign/phase-1-task-01.md` (CR-014, spec R-04a 3.10.0)
- **Round trước:** `.context/review-reports/feature-about-page-redesign-phase-1-task-01-round-1-review.md` (FAIL — F1 MAJOR)
- **Ngày:** 2026-10-13

## Review level
**NORMAL** (giữ như round 1)

## Reason
Round 2 là re-review sau fix 1 dòng class trong `AboutPeople.tsx` (component chỉ dùng ở `/about`). Phần còn lại của diff
không đổi so với round 1 (đã soát lại toàn bộ `git diff -- src` + 3 file mới). Không đụng API/schema/auth/navigation/cache.

## Blast radius
- Chỉ khối "Con người NTA" trên `/about`, `/en/about`.
- Các phần còn lại (AboutHero, AboutValues, TeamGrid `id="team"`, `icons.tsx` thêm 3 icon, i18n `about.*` thêm key,
  gỡ `MissionBlock`/`PageHeader` khỏi page) — y hệt round 1, đã PASS ở round 1.

## Fix đã kiểm
`src/components/about/AboutPeople.tsx:18` — khung ảnh:
`relative h-[220px] w-full min-w-0 overflow-hidden rounded-[24px] ... sm:h-[280px] lg:h-[320px]`
(bỏ `aspect-[794/267]` + `min-h-*` → không còn chuyển min-height thành min-width). Cột chữ `:27` thêm `min-w-0`.
Đúng root cause F1 round 1.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` (reviewer chạy lại) | PASS |
| `npm run lint` (reviewer chạy lại) | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:25` (ngoài scope) |
| `npm run build` | PASS theo primary (terminal user, 59/59 static pages, bản build sau fix) |
| Đo layout `localhost:3100/en/about` (browser pane, `getBoundingClientRect`/`scrollWidth`) | PASS — bảng dưới |

### Đo F1 sau fix
| Viewport | scrollWidth / clientWidth | Khung ảnh (l→r, w×h) | `h2` "people and technology" | Kết luận |
|---|---|---|---|---|
| 375 | 375 / 375 | 16→359, 343×220 | 16→359, top 2268 (dưới ảnh, bottom ảnh 2199) | Không tràn, 1 cột, không chồng |
| 768 | 753 / 753 (scrollbar 15px) | 24→729, 705×280 | 24→729, top 2051 (dưới ảnh, bottom 1982) | Không tràn, ảnh full width |
| 1280 | 1265 / 1265 | 32→649, 617×320 | cột chữ 697→1233 | Khoảng cách ảnh–chữ = 48px (= `lg:gap-12`), không đè |

Ghi chú 375: các phần tử có `right > clientWidth` chỉ là drawer menu mobile off-canvas (đã có sẵn, ẩn), không làm tăng
`scrollWidth`. Viewport đã trả về mặc định sau khi đo; server không bị tắt.

## Responsive Checklist Gate
| Mục | Kết quả |
|---|---|
| Không horizontal scroll @375 / @768 / @1280 | PASS |
| 2 cột @lg không chồng nhau | PASS |
| Ảnh có kích thước xác định + `sizes` | PASS — `fill` trong khung `h-*`+`w-full`; `sizes` khớp cột thực (~617px @1280) |
| Các mục khác (grid mobile-first, clamp, touch target, reduced-motion) | PASS (không đổi từ round 1) |

## Findings
- **F1 (MAJOR, round 1) — ĐÃ ĐÓNG.** Bằng chứng: bảng đo trên.
- **F2, F3 (MINOR, round 1)** — giữ nguyên, không chặn (key/field cũ không dùng; hex hardcode cùng pattern có sẵn).
- **[MINOR] F4 — Ảnh tạm bị crop hai bên ở mobile.** Ảnh nguồn 794×267 (~2.97:1) trong khung 343×220 (~1.56:1) @375 và
  617×320 (~1.93:1) @1280 → `object-cover` cắt bớt hai mép. Chấp nhận được vì là ảnh AI tạm, sẽ thay ảnh đội ngũ thật;
  khi thay nên chọn ảnh tỉ lệ gần khung (hoặc thêm `object-position`). Không chặn PASS.
- Không phát hiện regression mới trong `git diff -- src` + `AboutHero.tsx` / `AboutValues.tsx` / `AboutPeople.tsx`.

## Residual risk
- Chưa so pixel với mockup (chỉ đo hình học + screenshot nhanh @1280 khi Reveal đang fade).
- Số liệu 50+/30+/99% vẫn chờ user xác nhận (change doc §Quyết định 1).
- Ảnh `team-people-temp.webp` là ảnh tạm.

## Verdict
✅ **PASS** — F1 đã fix đúng root cause, đo lại 375/768/1280 không tràn, không đè chữ; typecheck/lint/build PASS.
Còn 3 MINOR (F2, F3, F4) không chặn.
