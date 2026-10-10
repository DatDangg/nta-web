---
id: publish-solution-screenshots
type: feature
status: done
resolved: 2026-10-10
task: tasks/change-publish-solution-screenshots/phase-1-task-01.md
created: 2026-10-10
---

# Đưa ảnh + nội dung 4 giải pháp lên web (CRM, LMS, DentGo, BoxAI)

## Yêu cầu

Ảnh chụp đã sẵn sàng và docs đã viết xong. Nối vào trang web: khai `screenshots` trong `.mdx`, viết nội dung
đầy đủ cho CRM/LMS/DentGo, và thêm ảnh cho BoxAI (BoxAI đã có mô tả nhưng chưa có ảnh).

## Bối cảnh — hiện trạng đã verify trên đĩa

| Sản phẩm | Ảnh trong `public/` | Nội dung `.mdx` | Hiện trên web? |
|---|---|---|---|
| HRM | 5 PNG | đầy đủ + `renderExtendedContent` | ✅ xong (change `2026-10-10-hrm-solution-content`) |
| CRM | 5 PNG | **stub 17 dòng** | ❌ ảnh có, `.mdx` không khai → không hiện |
| LMS | 7 PNG | **stub 17 dòng** | ❌ tương tự |
| DentGo | 5 PNG | **stub 17 dòng** | ❌ tương tự |
| BoxAI | ❌ **chưa copy** | mô tả đầy đủ, thiếu `screenshots` | ❌ không có ảnh |

Nguồn nội dung đã chuẩn bị xong: `docs/reference/{crm-dragon-hotpot,lms-ismartschool,dentgo-smile}/README.md`
(bản web-ready, commit `0129a2f` + `7f4bbe2`), `docs/reference/boxai/README.md`.

## Phát hiện kỹ thuật khi đọc code — 3 điểm cần xử lý

### 1. Trang AI **không có** `ScreenshotSection` — BoxAI cần sửa `page.tsx`

`src/app/[locale]/solutions/ai/[slug]/page.tsx:55-64` render theo thứ tự:

```
FeatureList → BenefitList → SolutionSections → SolutionHighlights → UseCases → FaqList
```

**Không có `ScreenshotSection`.** Trang enterprise thì có (`enterprise/[slug]/page.tsx:75`).
→ Thêm `<ScreenshotSection>` vào trang AI, đặt sau `FaqList` (đúng vị trí enterprise đang dùng).

Component có sẵn và tự `return null` khi `images.length === 0` → **an toàn cho `flycam` và `custom-ai`
(không khai `screenshots`, không bị ảnh hụt).** Đây là shared component — cần reviewer chấp nhận rủi ro chung.

### 2. Thiếu i18n key `screenshotsTitle` cho nhóm AI

`solutions.ai` **không có** `screenshotsTitle`; `solutions.enterprise` có.
→ Thêm `screenshotsTitle` vào `src/i18n/messages/{vi,en}.json` → `solutions.ai`,
copy chữ từ key cùng nhóm ở `solutions.enterprise`.

### 3. Bật `renderExtendedContent` cho CRM/LMS/DentGo

`enterprise/[slug]/page.tsx:62` — cờ này gate `sections` / `useCases` / `faq`.
HRM đã bật; CRM/LMS/DentGo chưa → không hiện phần mô tả dù `.mdx` có data.
→ Bật cho 3 sản phẩm, sau khi `.mdx` có đủ data.

> Cờ này là **opt-in có chủ đích** (xem comment `types.ts:17-19` và change HRM §3.3): nhóm `ai` luôn render
> các khối này, nhóm `enterprise` chỉ render khi bật cờ. Không được bỏ cờ và cho enterprise render chung.

## Thay đổi

### A. Asset — copy ảnh BoxAI sang `public/`

`docs/reference/boxai/screenshots/` có 3 file `.jpg` (chưa có trong `public/`):

| File | Nội dung |
|---|---|
| `01-dashboard-quan-tri.jpg` | Dashboard quản trị cảnh báo — thống kê báo động + tường video 3×3 + cảnh báo thời gian thực |
| `02-tasks-channels.jpg` | Màn "Tasks and channels" — cây nhóm/task + overlay AI trên luồng live |
| `03-ai-box.jpg` | Phần cứng NVIDIA Jetson Orin Nano Super lắp tại hiện trường |

Không copy ảnh CRM/LMS/DentGo — chúng **đã có sẵn** trong `public/`.

### B. Nội dung `.mdx` — CRM / LMS / DentGo (vi + en)

Viết từ docs tham chiếu theo cấu trúc 8 phần đã chốt, map sang schema `Solution`:

| Khối docs | Field | Ghi chú |
|---|---|---|
| §2 Positioning | `description` | 1–2 câu, dùng cho hero + meta description |
| §3 Vấn đề khách hàng | `sections[0].intro` | mở đầu khối mô tả đầu tiên |
| §4 Năng lực chính | `features[]` | mỗi năng lực 1 phần tử `"<Tiêu đề> — <mô tả>"` |
| §5 Tích hợp | `sections[].items` | gộp vào section phù hợp |
| §6 Use case | `useCases[]` | theo tình huống cụ thể, không phải label ngắn |
| §7 FAQ | `faq[]` | 4 câu, trả lời trung tính |
| Ảnh | `screenshots[]` | theo đúng thứ tự bảng mapping §8 trong docs |
| — | `benefits[]` | giữ 2 mục có sẵn, viết lại cho cụ thể hơn |
| — | `renderExtendedContent` | `true` |

### C. Nội dung `.mdx` — BoxAI (vi + en)

- Thêm `screenshots:` 3 ảnh (đường dẫn `/images/solutions/boxai/*.jpg`).
- Giữ nguyên `sections` / `useCases` / `faq` / `highlights` đã có.
- **Không cần** `renderExtendedContent` (nhóm `ai` luôn render).

### D. Render infra

- `src/app/[locale]/solutions/ai/[slug]/page.tsx` — thêm `<ScreenshotSection>` sau `<FaqList>`.
- `src/i18n/messages/{vi,en}.json` — thêm `solutions.ai.screenshotsTitle`.

## Ràng buộc nội dung

1. **Không bịa số liệu.** Các con số quan sát trong ảnh (CRM 2.627 khách / 7.435 đơn; LMS 91 học sinh;
   DentGo 248 hồ sơ) là **mốc provenance trong ảnh demo**, đã được docs ghi rõ "không dùng làm số liệu
   marketing". → **KHÔNG** đưa vào `highlights` hay `description`. `highlights` để trống trừ khi có số liệu
   thật đã xác nhận.
2. **URL hệ thống và tài khoản demo không bao giờ lên trang public.** Cụ thể phải loại:
   - DentGo: `admin@demo1` / `123456`, URL `demo1.76.13.214.188.sslip.io`
   - LMS: URL IP `187.52.119.50:3002`
   - CRM: URL `cms.dragonhotpotvietnam.com`
   → Chỉ kiểm tra `.mdx`, **không** đưa vào trang. (Docs nội bộ vẫn giữ nguyên để tra cứu.)
3. **Brand/tên khách hàng trong ảnh được phép giữ** — user đã chốt ngày 10/10/2026 (đây là bằng chứng sản
   phẩm đang vận hành). Không tự ý redact ảnh.
4. **HRM không nằm trong change này** — đã xong. Nhưng phải regression-check: bật cờ chung không làm
   trang HRM đổi layout.
5. **Cả vi và en** — mọi thay đổi `.mdx` phải đủ 2 ngôn ngữ. Ảnh tiếng Việt dùng chung cho cả 2 locale
   (chấp nhận được, đã ghi trong docs).

## Acceptance

- [x] 3 ảnh BoxAI có trong `public/images/solutions/boxai/`, `boxai.mdx` (vi+en) khai đúng `screenshots`.
- [x] `page.tsx` nhóm AI render `ScreenshotSection`; `flycam` và `custom-ai` (không có ảnh) không bị ảnh
      hụt/heading rỗng — component `return null` khi rỗng (xác nhận trên HTML build).
- [x] `solutions.ai.screenshotsTitle` có ở cả `vi.json` và `en.json`.
- [x] CRM/LMS/DentGo `.mdx` (vi+en): có `screenshots` đúng thứ tự ảnh, `sections`, `useCases` đầy đủ,
      `faq`, và `renderExtendedContent: true`.
- [x] `highlights` trống ở CRM/LMS/DentGo. **BoxAI giữ `highlights` 21/3/4–16 — user chốt 10/10/2026**:
      đây là thông số sản phẩm trong spec R-06b (đã duyệt ở change `2026-10-09-ai-solution-content`),
      KHÔNG phải số liệu trong ảnh demo → mâu thuẫn nội tại của change file (với §C) giải quyết theo §C.
- [x] Grep toàn bộ `.mdx` không còn URL hệ thống, `admin@demo1`, `123456`, `187.52.119.50`,
      `dragonhotpotvietnam.com` (0 match).
- [x] Trang HRM hiển thị y hệt trước change (regression check — `hrm.mdx` không sửa, build vẫn 5 ảnh).
- [x] `npm run lint`, `npm run typecheck`, `npm run build` PASS.
- [ ] Visual check 4 trang (vi + en) trên local. **Chưa làm — cần user mở trang xác nhận** (ảnh hiển thị
      đúng, không lộ watermark/URL hệ thống trong ảnh, giọng văn copy ổn).

## Ngoài phạm vi

- HRM (đã hoàn tất).
- Không sửa `docs/reference/**` — nguồn nội dung đã chốt.
- Không nén/đổi định dạng ảnh — ảnh trong `public/` đã là bản đóng khung trình duyệt.
- Không tạo case study mới (BoxAI đã có `relatedCases: [oc-eo-learning]`).

## Verify

Theo `.context/project-config.md`: `npm run lint`, `npm run typecheck`, `npm run build`.
(`test_command: null` — repo chưa có test framework.)

## ✅ Câu hỏi đã chốt — ảnh BoxAI tiếng Anh

**User chốt 2026-10-10: chọn (a) — giữ nguyên tiếng Anh.** Không thêm caption tiếng Việt, không redact,
không đóng khung lại ảnh.

Lý do: đúng thực tế sản phẩm đang chạy tại đền Bảo Hà; ảnh là bằng chứng sản phẩm vận hành nên không
tự ý chỉnh sửa. Đánh đổi: trang `/vi/solutions/ai/boxai` sẽ hiện UI tiếng Anh giữa 20 ảnh tiếng Việt
của các trang khác — user cần review khi xem trang.

Phương án (b) caption / (c) không đưa ảnh lên web **không dùng**.

## Ghi chú

- Change tiền đề: `2026-10-10-enterprise-solution-docs-web-ready` (đã archive) — sửa docs mô tả 4 sản phẩm
  theo hướng web-ready.
- Đây là **shared component** thay đổi (`ScreenshotSection` dùng chung 2 nhóm trang) + **i18n dùng chung**
  → reviewer nên chọn mức **NORMAL trở lên**; nếu thấy rủi ro regression thì STRICT.