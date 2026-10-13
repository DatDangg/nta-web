Agent: reviewer

# Review — feature-about-page-redesign · phase-1-task-01 · round 1

- **Task:** `tasks/feature-about-page-redesign/phase-1-task-01.md` (CR-014, spec R-04a 3.10.0)
- **Change doc:** `spec/changes/2026-10-13-about-page-redesign.md` (mục "Quyết định khi xử lý" — đã đối chiếu)
- **Ngày:** 2026-10-13

## Review level
**NORMAL**

## Reason
UI public-facing, scope hẹp trong `/about`. `icons.tsx` là shared nhưng diff chỉ thêm 3 tên mới (`target`/`eye`/`gem`), không sửa path cũ;
`TeamGrid` chỉ được dùng ở `/about` (grep xác nhận); không đụng API/schema/auth/navigation/cache.

## Blast radius
- `/about`, `/en/about` (page + 3 component mới + TeamGrid `id="team"`).
- `ListingIcon` (mọi trang dùng icon listing) — chỉ mở rộng union + record, không đổi icon cũ → không regression.
- i18n `about.*` vi/en — chỉ thêm key, không đổi key cũ.
- Metadata + Breadcrumb JSON-LD `/about` — giữ nguyên (đối chiếu `page.tsx:18-38`, `:59`).

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` (reviewer chạy lại) | PASS |
| `npm run lint` (reviewer chạy lại) | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:25` (ngoài scope) |
| `npm run build` | PASS theo primary (chạy ở terminal user; sandbox lỗi native binding swc do môi trường — không tính FAIL) |
| Đo layout trên server đang chạy `localhost:3100/en/about` (browser pane, viewport 375 / 1280, đo `getBoundingClientRect`/`scrollWidth`) | **FAIL** — xem F1 |

## Responsive Checklist Gate
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll @375 | **FAIL** | viewport 375: `documentElement.scrollWidth = 611` (layout viewport bị nới thành 611). Phần tử tràn: 2 `div.reveal-item` của grid AboutPeople, mỗi cái `w=595`; khung ảnh `team-people` = 595×200 |
| Layout — 2 cột @1280 không chồng nhau | **FAIL** | viewport 1280: cột ảnh AboutPeople rộng 617 nhưng khung ảnh `w=832.7, h=280` (left 32 → right 865); `h2` "people and technology" bắt đầu ở left 697 → ảnh đè lên cột chữ ~168px |
| Layout — grid mobile-first, `minmax(0,…)` | OK | Hero `lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]`, Values `lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)]` + `md:grid-cols-3`, stats `sm:grid-cols-3`; mobile 1 cột |
| Typography — heading fluid `clamp()`, rem | OK | h1 `clamp(2.5rem,…,4.25rem)`, tagline/h2 đều `clamp(...rem)` |
| Media — ảnh có kích thước/aspect, `sizes` | OK (trừ F1) | Hero `fill` + `aspect-[4/3]` + `sizes`, `priority` chỉ ảnh hero; ảnh team `fill` + `sizes`, không priority |
| Touch target ≥44px | OK | CTA `min-h-11` (44px) |
| Viewport/A11y — không `100vh`, reduced-motion | OK | không dùng `vh`; motion qua `motion-load`/`Reveal`/`data-motion-off` có sẵn của site |
| Tablet 768 | N/A đo trực tiếp — theo CSS math cột 1 rộng ~720 ≥ 595 nên không tràn, nhưng ảnh bị ép min-width 595 thay vì full width (cùng root cause F1) |

## Skill gates
| Gate | Kết quả |
|---|---|
| aislop | skip — không có quyền/cài đặt trong phiên này, không chạy |
| oxlint (anti-slop) | skip, oxlint not configured (lint repo = eslint, PASS) |
| ocr (open-code-review) | skip, ocr not installed |
| AI-readable | OK — 3 component < 75 dòng, tên rõ, docblock nêu mục đích (WHY), không indirection thừa; 0 indicator |
| ai-friendly-web | OK — không đổi robots/sitemap/llms; JSON-LD BreadcrumbList giữ nguyên, 1 `h1` |
| blitzstrike | N/A (không phải task nhạy cảm) |

## Kiểm tra trọng tâm khác
- **Bố cục vs mockup:** hero 2 cột (breadcrumb pill, H1 "Về **NTA**", tagline, mô tả, 3 chỉ số có vạch chia, ảnh tòa nhà phải) — khớp. Khối sứ mệnh: eyebrow `›` + H2 có phần nhấn brand trái, 3 thẻ icon phải, 4 bullet — khớp. Khối Con người: ảnh trái, eyebrow + H2 + mô tả + nút outline pill `→` phải — khớp bố cục, nhưng render hỏng vì F1. Các lệch có chủ đích (breadcrumb icon nhà, icon smile thay sao, ảnh tòa nhà là thẻ bo góc) chấp nhận được.
- **i18n:** mọi chuỗi hiển thị qua `t(...)`; key `hero|stats|values|people` đủ cả vi/en, cấu trúc đối xứng; `missionTitle` tái dùng có sẵn. Không hardcode chuỗi (ký tự `›` là trang trí, `aria-hidden`).
- **Heading hierarchy:** 1 `h1` → `h2` (values) → `h3` x3 → `h2` (people) → các h2 cũ. OK.
- **A11y:** `ListingIcon` mặc định `aria-hidden="true"` (`icons.tsx:65`); wrapper icon stats `aria-hidden`; link `#team` trỏ đúng `Section id="team"` + `scroll-mt-24`; focus-visible outline có. OK.
- **icons.tsx:** chỉ thêm 3 member union + 3 path; path cũ không đổi. OK.
- **TeamGrid `id`:** chỉ `/about` dùng TeamGrid → không trùng id trang khác. `Section` truyền `id`/`className` qua `...sectionProps`. OK.
- **Metadata + JSON-LD:** không đổi. OK.
- **Dead code/import:** import `PageHeader`/`MissionBlock` đã gỡ; không import thừa trong 3 file mới.

## Findings

### [MAJOR] F1 — Ảnh khối "Con người NTA" tràn ngang mobile và đè lên cột chữ ở desktop
- **File:** `src/components/about/AboutPeople.tsx:18`
  `className="relative aspect-[794/267] min-h-[200px] overflow-hidden ... lg:min-h-[280px]"`
- **Root cause:** grid item có `aspect-ratio` → `justify-self: normal` hành xử như `start` (không stretch), width = auto. `min-height` được **chuyển qua aspect-ratio thành min-width**: 200 × 794/267 ≈ 595px (mobile), 280 × 794/267 ≈ 833px (lg). Ở mobile track `auto` phình theo → cả 2 cột 595px trên viewport 375 (scrollWidth 611). Ở lg track `minmax(0,1.15fr)` = 617px nhưng ảnh 833px → đè sang cột chữ.
- **Vi phạm:** Acceptance "mobile 375px 1 cột, không tràn ngang" + "Desktop khớp bố cục mockup".
- **Đề xuất fix:** cho khung ảnh width xác định để không còn chuyển min-height → min-width, ví dụ thêm `w-full` (giữ `min-h-*` thì ảnh chỉ cao hơn tỉ lệ, `object-cover` crop), hoặc bỏ `aspect-[794/267]` và dùng chiều cao tường minh `h-[220px] sm:h-[260px] lg:h-full lg:min-h-[280px] w-full`. Sau fix đo lại: @375 `scrollWidth === clientWidth`, @1280 `right` khung ảnh ≤ `left` cột chữ − gap.

### [MINOR] F2 — Key/field cũ không còn dùng trên /about
- `about.description` (i18n) và `about.mission` (content `getAboutData`) không còn được render sau khi bỏ `PageHeader`/`MissionBlock`. Không gây lỗi; cân nhắc giữ (có thể dùng nơi khác/llms) hoặc dọn trong task riêng. Không chặn PASS.

### [MINOR] F3 — Màu hex hardcode
- `#f7fbfb`, `#cdeee6` trong `AboutHero.tsx:27,44,47`, `AboutValues.tsx:10` — cùng pattern `ListingHero` có sẵn (`HeroWaves fadeTo='to-[#f7fbfb]'`) nên chấp nhận; nếu có token tương ứng nên dùng token. Không chặn PASS.

## Residual risk
- So khớp pixel với mockup chưa làm (chỉ đo hình học); khối Reveal ở trạng thái chưa reveal khi chụp nên không có screenshot trực quan.
- Viewport 768 chưa đo trực tiếp (suy luận CSS math).
- Số liệu 50+/30+/99% vẫn chờ user xác nhận là số thật (change doc §Quyết định 1).

## Verdict
❌ **FAIL** — 1 MAJOR (F1: tràn ngang 375px + ảnh đè cột chữ ở desktop, Responsive gate FAIL). Trả về builder sửa `AboutPeople.tsx:18`, rồi review round 2.
