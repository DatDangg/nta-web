# feature-solution-detail-screenshots · phase-1-task-01 — HRM: 4 màn mockup mới + rà branding

- **CR:** CR-007 (`spec/changes/2026-10-13-solution-detail-screenshots.md`)
- **Classification / Risk:** ADDITIVE · LOW (ảnh mock offline + frontmatter MDX, không API/auth/schema)

## Scope
1. Thêm 4 màn vào mock `scripts/screenshots/mock-hrm/` (cùng style 9 màn hiện có, ăn `fixtures/hrm.json`
   sinh bởi `build-hrm-fixture.mjs`):
   - `recruitment` → `10-tuyen-dung` — pipeline ứng viên theo vòng (kanban: Ứng tuyển → Sàng lọc → Phỏng vấn → Offer → Nhận việc)
   - `contracts` → `11-hop-dong-lao-dong` — danh sách HĐLĐ sắp hết hạn / chờ gia hạn (loại HĐ, ngày hết hạn, còn N ngày, trạng thái)
   - `kpi` → `12-danh-gia-kpi` — đánh giá hiệu suất theo kỳ (điểm KPI, xếp loại, tiến độ đánh giá)
   - `turnover` → `13-bao-cao-bien-dong` — báo cáo biến động nhân sự (tuyển mới / nghỉ việc theo tháng, tỷ lệ nghỉ việc, theo khối)
   Số liệu nhất quán với fixture hiện có (248 NV / 4 khối, mốc 10/10/2026). Dữ liệu giả kiểu VN, không người/doanh nghiệp thật.
2. Khai báo 4 shot trong `scripts/screenshots/shots.mjs` (kèm `crop`) → `node scripts/screenshots/capture.mjs hrm --only=10` ... ra `public/images/solutions/v2/hrm/`.
3. Rà branding: không còn `@ntavietnam.tech` / "Công ty NTA" trong mock/fixture HRM và trong ảnh HRM đang dùng
   (`public/images/solutions/v2/hrm/*`). Nếu có → đổi sang tổ chức giả, chụp lại màn bị ảnh hưởng.
4. Thêm ảnh mới vào `screenshots:` của `src/content/solutions/vi/hrm.mdx` + `en/hrm.mdx` (alt có "minh hoạ" / "illustrative", `ratio` đo từ ảnh).

## Acceptance
- 4 ảnh + crop mới tồn tại, khung macOS đồng nhất với 9 ảnh cũ; alt ghi minh hoạ (VI+EN).
- Không còn `ntavietnam.tech` / "Công ty NTA" trong ảnh/mock HRM.
- `npm run typecheck`, `npm run lint`, `npm run build` PASS.

## Verification summary
- **Mock:** thêm 4 màn `recruitment` / `contracts` / `kpi` / `turnover` vào `mock-hrm/app.js` (+ CSS kanban, thanh ngang, cột đôi trong `app.css`); sidebar thêm 4 mục (Tuyển dụng, Hợp đồng lao động → nhóm "Nhân sự"; Đánh giá KPI, Báo cáo biến động → nhóm "Tổ chức & quy trình").
- **Fixture:** `build-hrm-fixture.mjs` sinh thêm `recruitmentPipeline`, `contracts` (+`contractSummary`, "còn N ngày" tính từ mốc 10/10/2026), `kpi` (Quý III/2026, phân bố xếp loại tổng 186), `turnover` (T01–T09/2026 lấy từ `MONTHLY_FLOW`: 51 vào / 23 ra / 13,2%; theo phòng ban cộng đúng 51/23). Số liệu bám fixture hiện có: 186 nhân sự · 8 phòng ban · 2 chi nhánh · 5 vị trí / 9 chỉ tiêu tuyển. Tên người đều là tên giả.
- **Capture:** `node scripts/screenshots/capture.mjs hrm --only=10,11,12,13` → 4 ảnh + 4 crop, 0 lỗi. Đã xem cả 4 ảnh: khung macOS + sidebar/header giống 9 ảnh cũ, không vỡ layout.
  Ratio: 10 = 2656×2340 (1.135) · 11 = 2656×2102 (1.264) · 12 = 2656×2872 (0.925) · 13 = 2656×2584 (1.028).
- **Rà branding:** grep `ntavietnam|Công ty NTA` trên `mock-hrm/`, `fixtures/hrm.json`, `build-hrm-fixture.mjs` → không thấy (mock dùng "Công ty TNHH Giải pháp Minh Quang", email `@example.com`). Ảnh 01–09 dựng từ đúng các nguồn này → **không chụp lại** 01–09.
  Lưu ý: 01–09 vẫn dùng sidebar cũ (8 mục), 10–13 dùng sidebar mới (12 mục).
- **MDX:** thêm 4 mục `screenshots:` vào `vi/hrm.mdx` ("Giao diện minh hoạ — …") và `en/hrm.mdx` ("Illustrative interface — …").
- **Review round 1 fixes (F1/F2/F4):** màn 11 chỉ hiện HĐ hết hạn ≤ 60 ngày (bỏ dòng 63 ngày; footer lấy `expiring60` = 8 = số dòng = thẻ); thêm thẻ "Thử việc 6" (141 + 39 + 6 = 186), đổi nhãn "Không XĐ thời hạn" → "Không thời hạn" để khỏi xuống dòng. Màn 10: 2 ứng viên cột "Nhận việc" đổi thành sẽ nhận việc 15/10/2026 và 01/11/2026, tag "Đã ký HĐ thử việc" (chưa tính vào 186). Chụp lại chỉ 10 + 11; ratio 11 đổi 1.195 → 1.264 (VI + EN), 10 giữ 1.135.
- **Verify:** `npm run typecheck` PASS · `npm run lint` PASS (0 lỗi, 1 cảnh báo `no-img-element` có sẵn ở `src/components/mdx/index.tsx`) ·
  `npm run build` **BLOCKED (môi trường)**: native addon `@swc/core` (plugin next-intl) không chịu dùng thư mục cache vì DACL của thư mục cha (`AppData\Local` cấp quyền cho SID AppContainer của sandbox; thử `SWC_NATIVE_BINDING_CACHE` trên D: thì bị chặn vì quyền cấp cho Authenticated Users). Lỗi xảy ra lúc nạp `next.config.ts`, trước khi compile code → không liên quan diff này. Cần chạy lại `npm run build` ở terminal của user (hoặc `bash tools/linux-build.sh verify`).

## Retry / Escalation
Max 3 attempt → `architecture_review_needed`.
