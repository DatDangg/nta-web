Agent: reviewer

# Review — feature-home-solution-card-photo · phase-1-task-01 · round 1 (CR-018)

- **Review level:** NORMAL
- **Reason:** Chỉ đổi UI một section trang chủ (component riêng `SolutionHomeCard`, không dùng chung) + 6 field `image`/`alt` trong content + 3 ảnh tĩnh. Không đụng shared token/component/API/schema/auth.
- **Blast radius:** `/` và `/en`, khối "Giải pháp" (`SolutionGridHome`). `tailwind.config.ts` (`max-w-container`), `HomeSectionHeader`, `HomeImage` không có trong diff.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (primary chạy, theo brief — reviewer không chạy lại) |
| `npm run lint` | PASS, 0 error, 1 warning cũ `src/components/mdx/index.tsx` (ngoài scope) (primary) |
| `npm run build` | PASS 59/59 (primary; reviewer KHÔNG rebuild theo yêu cầu) |
| `git diff` | Chỉ có `SolutionGridHome.tsx`, `home.ts` (+ progress/BACKLOG); 3 webp mới untracked |
| Browser (Browser pane, prod server :3100) | Đo + chụp ở 375 / 1024 / 1440 / 1920 VI và 1440 EN — chi tiết bên dưới |

## Kiểm tra theo brief
- **Alt VI/EN:** OK. Cả 6 alt mô tả đúng nội dung ảnh (laptop dashboard + cây; chip AI + màn hình camera giao thông; 2 điện thoại camera + biểu đồ), không có tiền tố "Minh hoạ"/"Illustration"/"Illustrative". Chữ/bullet/title/link không đổi (diff chỉ chạm `image`, `alt`).
- **Token `max-w-container`:** OK. Không sửa; chỉ section này dùng `max-w-[1400px]` (`SolutionGridHome.tsx:44`).
- **Mask:** OK. Computed style trên Chrome: `mask-composite: source-in, source-in` (vì `-webkit-mask-composite` khai báo sau là alias trong Chrome → ngữ nghĩa giao, tương đương `intersect`); `--photo-fade-top` = `25%` ở xl, mặc định 0% → lớp trên đục hoàn toàn nên < xl chỉ còn mờ sang trái như attempt 1. Ảnh hiển thị đúng ở 1440/1920 (mép trên + trái mờ).
- **Đo đạc (DOM):**
  - 1440 VI: thẻ 429×384; khung ảnh xl 320×214 neo phải-dưới (top 170); h3 "Giải pháp Doanh nghiệp" **1 dòng** (ngang tới 321px); cột chữ p/li/a tận cùng 237px; overflow ngang 0; 3 ảnh `naturalWidth` 360 (>0), `-photo.webp`.
  - 1920 VI: cùng số đo (container 1400px), overflow 0, `naturalWidth` 360 ×3.
  - 1440 EN: thẻ 429×406, h3 1 dòng cả 3 thẻ, overflow 0, alt EN đúng.
  - 375 VI: overflow 0 (`scrollWidth` 375 = `clientWidth`), `naturalWidth` 480 ×3.
  - 1024 VI: chụp ảnh trực quan (bên dưới); không đo overflow bằng JS ở mốc này.
- **Trực quan:** 1440/1920 VI và 1440 EN: ảnh nằm góc phải-dưới, ngoài cột chữ, chữ không đè ảnh. **375 và 1024: chữ đè lên chủ thể ảnh** (Finding M1).

## Responsive Checklist Gate
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | OK | overflow 0 ở 375 / 1440 / 1920 VI, 1440 EN |
| Layout — container không fixed px | OK | `max-w-[1400px]` là max-width, `w-full` + padding |
| Typography/Spacing | OK | dùng scale Tailwind (`text-xl`, `text-sm`), không đổi |
| Media — ảnh `fill` + `sizes` hợp lý, đã tải | OK | `naturalWidth` > 0 mọi mốc đã đo; `sizes` khớp khung render (360 ở xl, 480 ở hẹp) |
| Media — nội dung đọc được trên ảnh ở mọi mốc | **FAIL** | 375 + 1024: chữ mô tả/bullet nằm trên viền điện thoại, ảnh camera, cột biểu đồ, chip AI (M1) |
| Touch/Interaction | N/A | không đổi link/nút |
| Viewport/A11y — reduced motion, không che lỗi bằng overflow | OK | `overflow-hidden` của thẻ là bo góc có sẵn, không dùng để giấu tràn |

## Skill gates
- aislop: skip — reviewer không có ảnh/CLI chạy trong phiên này; diff nhỏ, không thấy pattern slop (không có code chết, không có fallback ẩn).
- oxlint (anti-slop): skip, chưa cấu hình oxlint (lint repo PASS).
- ocr: skip, ocr chưa cài.
- AI-readable: OK — tên `photoFade`/`photoFadeMask` rõ nghĩa, component < 50 dòng; JSDoc dài nhưng giải thích WHY (khung, tỉ lệ), 0 indicator.
- ai-friendly-web: N/A (không đổi route/meta/sitemap).
- blitzstrike: N/A.
- Surgical diff: OK — mọi dòng trace về task; không drive-by.

## Findings

### [MAJOR] M1 — Chữ đè lên chủ thể ảnh ở 375 và 1024 (fail acceptance "chữ không bị ảnh đè ở 375/1024/1440/1920")
- **File:** `src/components/home/SolutionGridHome.tsx:79-84` (khung ảnh < xl `inset-y-0 w-[72%] object-[85%_50%]` + lớp nền hẹp `from-40% to-[130%]`).
- **Bằng chứng (screenshot Browser pane):**
  - 375 VI, thẻ "Ứng dụng AI": viền 2 điện thoại cắt ngang "phục vụ nhu cầu hằng ngày"; "— AI Music" nằm trên ảnh camera đường phố; "dáng mặt —" trên các cột biểu đồ; "người dùng cuối" trên màn hình điện thoại. Thẻ "Giải pháp AI": bullet "Flycam…", "Trợ lý AI & AI API Gateway — FridayAI" nằm trên chip AI/màn hình. Thẻ "Doanh nghiệp": "— CRM", "— LMS," trên laptop/biểu đồ.
  - 1024 VI (lg, thẻ ~300px, chữ full bề rộng): cùng hiện tượng ở cả 3 thẻ (bullet nằm trên laptop, chip AI, điện thoại).
  - Chữ vẫn đọc được nhờ lớp surface, nhưng tương phản giảm rõ ở 60–95% bề ngang thẻ (overlay chỉ còn ~45–75% đục ở đó) và ảnh chụp có chi tiết đậm (viền máy, vạch biểu đồ), khác hẳn ảnh minh hoạ nhạt của CR-017. Ghi chú trong task "375/1024 OK → giữ nguyên" không khớp với hiện trạng.
- **Đề xuất fix (builder chọn 1):**
  1. Dùng cùng cách xl cho < xl ở thẻ hẹp: khung `aspect-[3/2]` neo phải-dưới, rộng ~55–60%, và chừa chỗ (vd `pb-` / `min-h` hoặc đặt link "Tìm hiểu…" + bullet ngắn hơn bề ngang) để khung ảnh nằm dưới/khỏi vùng chữ; hoặc
  2. Ở mobile/lg, đưa ảnh ra khỏi vùng chữ: dải ảnh riêng ở đáy thẻ (`relative h-32` + mask lên trên) thay vì nền dưới chữ; hoặc
  3. Tối thiểu: tăng lớp surface ở thẻ hẹp (vd `from-55% to-[160%]`) — nhưng cách này làm ảnh gần như biến mất, cần cân với yêu cầu "ảnh hiện bên phải".
  Sau fix chụp lại 375 / 768 / 1024 VI+EN.

### [MINOR] m1 — Độ giống mẫu `5.webp` ở xl
- Mẫu: thẻ thấp/ngang (~420×260), ảnh lớn chiếm gần full chiều cao nửa phải. Hiện tại: thẻ 429×384 (VI) / 406 (EN) vì cột chữ 56% làm mô tả + bullet wrap nhiều dòng, ảnh chỉ ~320×214 ở góc dưới → ảnh nhỏ hơn mẫu đáng kể, nửa trên-phải thẻ trống. Chấp nhận được về đọc chữ (không đè), nhưng nếu user so với mẫu có thể yêu cầu ảnh to hơn. Không chặn PASS.

### [MINOR] m2 — Container 1400px lệch lề với các section khác ở ≥ 1440
- Ở 1920 khối Giải pháp rộng hơn các section dưới (Sản phẩm tiêu biểu dùng `max-w-container`), lề trái tiêu đề hai khối không thẳng hàng. Đúng scope task (chỉ section này), ghi nhận để user biết; không chặn.

## Residual risk
- Không lưu được `scratchpad/cr018-solutions-1440-vi.png`: quyền bash của reviewer là `"*": deny` (không chạy node/Chrome headless), công cụ screenshot của Browser pane không ghi ra đường dẫn tuỳ chọn. Screenshot 1440 VI nằm ở: `C:\Users\datda\.claude\projects\D--prj-nta-web\a39a1628-1ddc-447a-a7d2-4ed0b58f4fb6\tool-results\mcp-Claude_Browser-blob-1791917740593-e2fhlb.jpg`.
- Chưa đo 768 (md) và EN ở 375/1024/1920; chưa đo overflow bằng JS ở 1024.
- Chưa kiểm Safari (`-webkit-mask-composite: source-in` vs `mask-composite: intersect`) — Chrome render đúng.

## Verdict
❌ **FAIL** — 1 MAJOR (M1: chữ đè ảnh ở 375/1024, trái acceptance). Chuyển builder fix M1, giữ nguyên bố cục xl (đạt).
