---
type: change
slug: nta-website
phaseTask: solution-detail-redesign-T2-verify
agent: primary
step: verify-7-diem-sau-T2
status: awaiting
startedAt: 2026-10-11T23:00:00+07:00
---

# Run — Kiểm 7 điểm sau T2 trên /dev/components + chốt spec §5.3

## Yêu cầu user (2 việc, trước khi chạy T3)

1. **Giữ `AiAssistantPanel` dạng DOM**, không quay lại ảnh crop. **Cập nhật spec §5.3** cho khớp
   (ghi rõ lý do: crop tỉ lệ 4.31 không đọc được, nền trắng trên nền tối). Panel phải **căn mép
   trái cùng text** và **đọc rõ ở 375**.
2. **Kiểm trên `/dev/components`**, báo cáo ngắn (đạt/chưa đạt + commit) cho **7 điểm** sau T2.
   Điểm nào chưa đạt → **sửa luôn**. Xong gửi **contact sheet 375 + 1440**.
   Sau khi user xem contact sheet OK → mới chạy **T3** (migrate 8 file `.mdx`).

## filesTouched (từ `git status --short` lúc start)

```
 M package-lock.json   (dirty sẵn, ngoài scope)
?? .tmp/               (gitignored)
```

## Việc đã làm

### 1. Spec §5.3 cập nhật (`.context/design-spec-solution-detail.md`)

- Sửa ASCII diagram: bỏ "ảnh crop khung AI" → "AiAssistantPanel (HTML/CSS), căn mép trái như text".
- Thêm banner **"ĐÃ CHỐT (2026-10-11): dựng bằng DOM, KHÔNG dùng ảnh crop"**.
- Bảng token §5.3: bỏ 2 dòng "Ảnh `04-danh-gia-ai-crop.png`" + "Kích thước ảnh" → thay bằng
  5 dòng: **Khung → `AiAssistantPanel` (HTML/CSS)** · **Căn chỉnh → căn mép trái như text, không
  căn giữa** · **Panel mobile → full-width, đọc rõ ở 375px, responsive theo nội dung** ·
  **Nền panel `#047857`/viền `#059669`** · **Chữ trên nền panel ≥ 4.5:1**.
- Ghi chú lý do (3 điểm, có số đo): tỉ lệ **1223×284 = 4.31** → cột 608px chỉ còn 608×141px
  không đọc được · **nền trắng lóa trên nền #1d1d1f** · **không có crop nào khác** của khung AI
  (crop `tt27` là lưới nhận xét, không phải khung "Trợ lý AI").
- Sửa mục §10.1 dòng "§5.3 dùng `04-danh-gia-ai-crop.png`" → "§5.3 dựng bằng DOM
  (`AiAssistantPanel`)" + lý do.

### 2. Verify 7 điểm — dev server `npm.cmd run dev` → port 3001

Script CDP `.tmp/verify-t2.mjs` (thuần, không thêm dependency) + `.tmp/contact-sheet.mjs`
(**ẩn header sticky** — điểm g). Probe ở **1440 + 375**, locale **VI + EN**.

| # | Điểm | Kết quả | Bằng chứng |
|---|---|---|---|
| a | 26 ảnh v2 nền trong suốt, shadow do component thêm, đồng bộ | ✅ **ĐẠT** | sharp: **26/26 PNG có pixel alpha < 250** (trong suốt). CDP: 9/9 `<img>` v2 đều có `shadow-*` ở ancestor (hero `shadow-lg` · zig-zag/row `shadow-md` · bento `shadow-sm`) |
| b | Section AI dùng DOM panel | ✅ **ĐẠT** | `imgCount: 0`, `hasFigure: true`, panel bg `rgb(4,120,87)` — VI + EN, cả 1440 lẫn 375 |
| c | Bento ô lớn TT27 có ảnh crop hoặc số "27" | ✅ **ĐẠT** | Phương án **A** (ảnh `04-danh-gia-ai-tt27-crop.png`, `imgLoaded: true`) + phương án **B** (figure `27/2020`) đều render, **không còn trống** |
| d | Feature 3 ảnh: text full-width, 3 ảnh cùng size 1 hàng, căn đỉnh (1440/1920) | ✅ **ĐẠT** | 1440: `gridCols = 394.656/394.672/394.656px`, `sameRow: true`, `align: flex-start`, `textWidth: 1216` (full) · 375: 1 cột, chính trên (đúng hành vi mobile) |
| e | Tiêu đề section AudienceCards + FAQ, đủ VI/EN | ✅ **ĐẠT** | VI: `Dành cho ai` · `Câu hỏi thường gặp` — EN: `Who it's for` · `Frequently asked questions` |
| f | Breadcrumb EN không lẫn tiếng Việt | ✅ **ĐẠT** | EN: `Home›Solutions›Customer Relationship Management (CRM)` — 0 ký tự VI |
| g | Script chụp ẩn header sticky; tiêu đề ô bento không dùng "—" | ✅ **ĐẠT** | Header site `position: sticky` → script contact-sheet **ẩn 57 phần tử sticky** trước khi chụp. 3 tiêu đề ô bento VI + EN: `emDash: false` (dùng `:`) |

**Không điểm nào chưa đạt → không sửa code component nào.** (Lưu ý probe `images: []` ở lần
chạy đầu chỉ do filter `/solutions/v2/` khớp nhầm URL `/next/image?url=...` — không phải lỗi render;
đã verify lại bằng sharp + ancestor-chain probe.)

`overflowX: 0` ở cả 1440 và 375.

### 3. Contact sheet

- `.tmp/contact-sheet.mjs` — chụp full-page `/vi/dev/components` ở **375 + 1440**, ẩn header
  sticky, ép ảnh lazy load, ghép cạnh nhau có nhãn → **`.tmp/contact-sheet-vi.png`** (1911×12535).
- Ảnh rời: `.tmp/contact-sheet/vi-375.png` (375×12415) · `.tmp/contact-sheet/vi-1440.png` (1440×10762).

## Evidence

- Verify JSON: 3 tổ hợp `vi-1440` / `vi-375` / `en-1440` — đủ 7 điểm ở trên.
- Crop kiểm bằng mắt: `.tmp/cs-crops/1440-{featrow,bento,ai,audience,faq}.png` ·
  `375-{featrow,bento,ai2,ai3}.png`.

## Residual risk

- Chưa verify ở **1920** (điểm d ghi "1440/1920") — browser tool + CDP script đang chạy 1440.
  Layout dùng `Container` 1280 nên 1920 chỉ là vùng trống hai bên, cùng grid với 1440 → rủi ro thấp.
- Contact sheet chỉ locale **VI**. EN đã verify bằng probe (đủ tiêu đề + breadcrumb sạch) nhưng
  chưa ghép ảnh.

## next

**DỪNG chờ user xem contact sheet OK** → rồi mới chạy **T3** (migrate 8 file `.mdx`:
CRM/HRM/DentGo chỉ tách `title`/`description` giữ nguyên câu chữ; LMS dùng copy §11.2;
build + kiểm 4 trang render đủ số tính năng như trước).
