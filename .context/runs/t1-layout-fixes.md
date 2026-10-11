# Run Journal — T1 sửa 4 lỗi bố cục (template chung)

```yaml
workItem: feature/nta-website
phaseTask: change-solution-detail-redesign/T1
step: done
agent: primary
status: awaiting
attempt: 1
interrupted: false
updatedAt: 2026-10-11T00:00:00+07:00
changeRequest: spec/changes/2026-10-11-solution-detail-redesign.md
specSource: .context/design-spec-solution-detail.md §1
filesNew:
  - src/components/ui/Container.tsx
filesTouched:
  - src/components/ui/Section.tsx              # dùng Container, thêm prop size
  - src/components/layout/Header.tsx           # max-w-[1280px] -> max-w-container
  - src/components/layout/Footer.tsx           # max-w-[1280px] -> Container
  - src/components/shared/PageHeader.tsx       # dùng Container
  - src/components/shared/CTABanner.tsx        # bỏ sm:px-2 lệch -> khớp padding chuẩn
  - src/components/shared/HomeImage.tsx        # bỏ hardcode 1200x720
  - src/components/home/Hero.tsx               # Container + width/height
  - src/components/home/CaseStudyHighlight.tsx # Container + width/height
  - src/components/about/TeamGrid.tsx          # width/height theo khung 4/3
  - src/components/about/PartnerLogos.tsx      # width/height theo logo
  - src/components/cards/cardStyles.ts         # thêm hằng tỉ lệ card
  - src/components/cards/SolutionCard.tsx      # width/height
  - src/components/cards/ProductCard.tsx       # width/height
  - src/components/solutions/ScreenshotSection.tsx # width/height
  - src/app/[locale]/solutions/enterprise/[slug]/page.tsx  # L1 + L2
evidence:
  verdict: "lint 0 errors · typecheck PASS · build PASS · 8/8 route enterprise SSG"
next: "reviewer STRICT (template, blast radius rộng) → PASS thì commit + chạy T2"
loopSignal: none
```

## Kết quả verify (chạy thật)

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | **0 errors**, 1 warning có sẵn (`src/components/mdx/index.tsx:25` `<img>`, ngoài phạm vi T1) |
| `npm run typecheck` | **PASS** (0 lỗi) |
| `npm run build` | **PASS**, `✓ Compiled successfully in 5.3s` |
| grep `max-w-[1280px]` trong `src/` | **0 kết quả** ✅ |
| Route enterprise SSG | **8/8** (`vi|en` × `crm|hrm|lms|dentgo`) |

**HTML verify (build output thật):**
- L1: cả 4 trang `grid2col=False` + `relatedSidebar=False` → **không còn cột phải rỗng**. Không trang nào có `relatedCases` data nên nhánh 2 cột không kích hoạt (đúng — không giữ chỗ cho nội dung không tồn tại).
- L2: `<section class="py-12 md:py-16 xl:py-24 bg-background-alt ...">` → section **không còn class giới hạn 720px**, nền tràn full-width. `xl:max-w-[720px]` không còn trong page.

## Quyết định đã lấy

| Chỗ | Quyết định | Vì sao |
|---|---|---|
| Container size khi **không** có related | `default` 1280 | Theo review user: **không** thu về 720 khi không có sidebar. 720 chỉ cho khối chữ thuần. |
| Nội dung chữ sau khi bỏ wrapper 720 | **không** bọc lại 720 | `FeatureList`/`BenefitList`/`SolutionSections`… dùng `Section` (chữ thuần, hợp lý) — giữ nguyên `Section` default 1280, tỉ lệ đọc do nội dung ngắn quyết định. `ScreenshotSection` có ảnh → `default`. |
| `HomeImage` width/height | Truyền `width`/`height` theo **khung CSS đang dùng** ở từng call site, không đo tỉ lệ file | Khung `aspect-*` đã quyết định tỉ lệ hiển thị; `object-cover` cắt đúng ý đồ thiết kế. Cơ chế 2 trường hợp cho ảnh v2 (giữ tỉ lệ gốc, fade đáy) là **T2**, chưa đụng. |
| Ảnh `ScreenshotSection` | `2600×1900` (tỉ lệ ~1.37, khớp ảnh v2 cũ đang dùng) | Ảnh cũ (không phải v2) vẫn dùng `h-auto w-full object-cover`-style. Giữ nguyên hành vi hiện tại. |

## Rủi ro còn lại

- **HomeImage width/height giờ là BẮT BUỘC ở mọi call site.** Thêm call site mới mà quên truyền → ảnh vỡ tỉ lệ. Đã ghi comment trong `HomeImage.tsx` nhắc rõ. Sẽ reviewer kiểm tra.
- **Section `default` 1280 cho `FeatureList`/`BenefitList`**: trước đây chúng nằm trong cột 720px nên chữ ngắn; giờ ở 1280 có thể **dài dòng hơn** (mất giới hạn độ dài đọc ~75ch). Chưa verify bằng mắt — đã ghi residual, reviewer/screenshot sẽ thấy.
- **T2 chưa làm**: `Section` chưa có `variant="ink"`, chưa có `.shot-fade-bottom`, chưa có `Feature[]`. Các tham chiếu trong spec §3.1/§4 là việc T2.