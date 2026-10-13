/**
 * shots.mjs — manifest ảnh cần chụp cho 4 trang giải pháp.
 *
 * mode "mock"  : dựng từ scripts/screenshots/mock-hrm (HTML tĩnh + fixtures/hrm.json)
 * mode "live"  : app thật (LMS iSmartSchool / CRM Dragon Hotpot / DentGo Smile) + chặn API
 *                để trả fixtures/*.json (xem live.mjs) — không lộ dữ liệu khách hàng thật.
 *
 * Tên file & thư mục theo PLAN-STEP1.md §B–§E.
 *
 * Thư mục đích: `public/images/solutions/v2/<sản phẩm>/` — toàn bộ ảnh thế hệ 2 nằm chung
 * một chỗ, KHÔNG trộn với ảnh cũ (thư mục `public/images/solutions/<sản phẩm>/` là ảnh cũ
 * vẫn đang được web dùng). Vì đã nằm trong `v2/` nên tên file KHÔNG kèm hậu tố `-v2`.
 *
 * `crop`  — 1 vùng → `<tên>-crop.png`
 * `crops` — nhiều vùng có nhãn → `<tên>-<nhãn>-crop.png`
 * Mỗi vùng là CSS selector (`sel`) HOẶC chuỗi hiển thị (`text`) — xem README §"Ảnh crop".
 */

export const SHOTS = {
  enterprise: {
    mode: "mock", mockPath: "/mock-enterprise/", title: "NTA · Nền tảng vận hành doanh nghiệp",
    fixture: "hrm.json", outDir: "public/images/solutions/v2",
    shots: [{ screen: "overview", name: "enterprise-hero" }],
  },
  flycam: {
    mode: "mock", mockPath: "/mock-flycam/", title: "NTA Flycam · Điều hành nhiệm vụ bay",
    fixture: "hrm.json", outDir: "public/images/solutions/v2/flycam",
    shots: [{ screen: "overview", name: "01-tong-quan" }],
  },
  talvra: {
    mode: "mock", mockPath: "/mock-talvra/", title: "Talvra · Trợ lý AI doanh nghiệp",
    fixture: "hrm.json", outDir: "public/images/solutions/v2/talvra",
    shots: [{ screen: "overview", name: "01-tong-quan" }],
  },
  hrm: {
    mode: "mock",
    title: "NTA HRM · Quản trị nhân sự",
    fixture: "hrm.json",
    outDir: "public/images/solutions/v2/hrm",
    shots: [
      { screen: "overview", name: "01-tong-quan", crop: ".chart-card" },
      { screen: "employees", name: "02-ho-so-nhan-vien", crop: "table.data" },
      { screen: "employee-detail", name: "03-chi-tiet-nhan-vien", crop: ".two-col" },
      { screen: "attendance", name: "04-cham-cong", crop: "table.att" },
      { screen: "payroll", name: "05-tinh-luong", crop: "table.data" },
      { screen: "leave", name: "06-nghi-phep", crop: "table.data" },
      { screen: "org", name: "07-co-cau-to-chuc", crop: ".org" },
      { screen: "proposals", name: "08-quy-trinh-de-xuat", crop: "#stage > .card" },
      { screen: "directory", name: "09-tra-cuu-doi-ngu", crop: ".three-col" },
      { screen: "recruitment", name: "10-tuyen-dung", crop: ".kanban" },
      { screen: "contracts", name: "11-hop-dong-lao-dong", crop: "table.data" },
      { screen: "kpi", name: "12-danh-gia-kpi", crop: "table.data" },
      { screen: "turnover", name: "13-bao-cao-bien-dong", crop: ".two-col" },
    ],
  },

  lms: {
    mode: "live",
    product: "lms",
    title: "LMS · Quản lý trường học",
    fixture: "lms.json",
    outDir: "public/images/solutions/v2/lms",
    shots: [
      { route: "/workspace", name: "01-tong-quan", wait: "[class*=sidebar]", crop: null },
      // crop: bảng thẻ số liệu
      { route: "/dashboard", name: "02-quan-tri-bang-dieu-khien", crop: "section.dashboard-grid" },
      // crop: bảng hồ sơ học sinh + cột GVCN
      { route: "/people/students", name: "03-ho-so-hoc-sinh", crop: "section.data-panel" },
      // PLAN-STEP1 §B: 2 crop — khung Trợ lý AI gợi ý + lưới nhận xét TT27
      {
        route: (F) => `/assessment/tt27/regular?academicYearId=${F.meta.academicYearId}&subjectId=${F.meta.subjectId}&classId=${F.meta.classId}&term=1`,
        name: "04-danh-gia-ai",
        crop: { text: "TRỢ LÝ NHẬN XÉT" },
        crops: [{ as: "tt27", sel: '[class*="col-span-8"]' }],
      },
      { route: "/timetable", name: "05-thoi-khoa-bieu" },
      { route: "/curriculum/lesson-plans", name: "06-giao-an-dien-tu" },
      // crop: bảng học bạ số (cột trạng thái phát hành)
      { route: "/academic-records", name: "07-hoc-ba-so", crop: "table.mobile-scroll-table" },
    ],
  },

  crm: {
    mode: "live",
    product: "crm",
    title: "CRM · Quản trị khách hàng",
    fixture: "crm.json",
    outDir: "public/images/solutions/v2/crm",
    shots: [
      // crop: dải thẻ KPI "Hôm nay thế nào?" (khách · đơn · doanh thu · khiếu nại)
      { route: "/", name: "01-tong-quan", crop: ".grid.gap-4" },
      { route: "/customers", name: "02-khach-hang", crop: "table.w-full.text-sm" },
      { route: (F) => `/customers/${F.customerDetail.id}`, name: "03-chi-tiet-khach-hang", crop: ".grid.items-start" },
      { route: "/reservations", name: "04-dat-ban", crop: "table.w-full.text-sm" },
      { route: "/orders", name: "05-don-hang", crop: "table.w-full.text-sm" },
    ],
  },

  dentgo: {
    mode: "live",
    product: "dentgo",
    title: "DentGo · Quản lý phòng khám",
    fixture: "dentgo.json",
    outDir: "public/images/solutions/v2/dentgo",
    // Bảng của DentGo có nhiều cột, rộng hơn khung 1328px → cột cuối bị cắt mép phải
    // (ảnh trông "chọc" UI). Cách đúng: chụp ở viewport rộng hơn, wrapper tự co về 1328
    // → khung 4 sản phẩm vẫn đồng nhất mà không cắt cột, không phải co nội dung.
    // Nút chat/support là `position: fixed` → `unlockHeight` đổi thành `static` làm nó rơi
    // giữa bảng → `capture.mjs` ẩn widget nổi trước khi chụp.
    fitTables: true,
    hideWidgets: true,
    shots: [
      // Trang tổng quan: chỉ lưới thẻ KPI, vừa khít 1328.
      { route: "/internal", name: "01-tong-quan", crop: "section.grid.gap-4" },
      // Bốn màn bảng dưới đây: chụp rộng 1700 để bảng không cắt cột cuối.
      { route: "/internal/patients", name: "02-ho-so-khach-hang", crop: "div.internal-main-scale-canvas", appWidth: 1700, maxHeight: 1500 },
      { route: (F) => `/internal/patients/${F.patients[0].id}/dental-record`, name: "03-ho-so-rhm", crop: "div.internal-main-scale-canvas", appWidth: 1700, maxHeight: 1500 },
      // Lịch hẹn nhóm theo ngày → dài nhất, cắt còn các nhóm ngày đầu (đủ thấy cấu trúc lịch).
      { route: "/internal/schedule", name: "04-lich-hen", crop: "div.rounded-xl.border.bg-card", appWidth: 1700, maxHeight: 1500 },
      { route: "/internal/inventory/items", name: "05-kho-vat-tu", crop: "div.internal-main-scale-canvas", appWidth: 1700, maxHeight: 1100 },
    ],
  },
};

export const ORDER = ["hrm", "lms", "crm", "dentgo"];
