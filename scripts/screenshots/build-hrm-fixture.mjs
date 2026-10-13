/**
 * build-hrm-fixture.mjs — sinh dữ liệu giả cho mock HRM (scripts/screenshots/mock-hrm/).
 *
 * Chạy: node scripts/screenshots/build-hrm-fixture.mjs
 * Ra:   scripts/screenshots/fixtures/hrm.json
 *
 * Nghiệp vụ VN tính trong script (không gõ tay để tránh sai số):
 * - BHXH 8% + BHYT 1,5% + BHTN 1% = 10,5% phía người lao động; 21,5% phía công ty.
 * - Trần đóng BHXH = 20 × lương cơ sở 2.340.000đ = 46.800.000đ.
 * - Giảm trừ: bản thân 15.500.000đ/tháng; người phụ thuộc 6.200.000đ/tháng.
 * - Thuế TNCN lũy tiến 5→35% (bậc 5%: ≤5tr; 10%: 5–10tr; 15%: 10–18tr; 20%: 18–32tr;
 *   25%: 32–52tr; 30%: 52–80tr; 35%: >80tr).
 * - Ngày công chuẩn tháng 10/2026 = 22 (không lễ); thực nhận = thu nhập − BHXH − thuế.
 */
import fs from "node:fs";
import path from "node:path";

const MONTH = { year: 2026, month: 10, workdays: 22 };

/* ---------- tiện ích nghiệp vụ ---------- */
const INS_EMP_RATE = 0.105; // 8 + 1.5 + 1
const INS_CO_RATE = 0.215; // 17.5 + 3 + 1
const INS_CAP = 46_800_000;
const PT_BANTHAN = 15_500_000;
const PT_PHUTHUOC = 6_200_000;

const pit = (taxable) => {
  const brackets = [
    [5_000_000, 0.05], [5_000_000, 0.1], [8_000_000, 0.15],
    [14_000_000, 0.2], [20_000_000, 0.25], [28_000_000, 0.3],
    [Infinity, 0.35],
  ];
  let rest = Math.max(0, taxable), tax = 0;
  for (const [band, rate] of brackets) {
    if (rest <= 0) break;
    const take = Math.min(rest, band);
    tax += take * rate;
    rest -= take;
  }
  return Math.round(tax);
};

/* ---------- dữ liệu gốc ---------- */
// [họ tên, giới tính, phòng ban, chức danh, chi nhánh, lương CB, phụ cấp chức vụ, xăng+ĐT, người phụ thuộc, ngày vào]
const ROSTER = [
  ["Nguyễn Hoài Nam", "Nam", "Phòng Nhân sự", "Trưởng phòng", "Hà Nội", 28_000_000, 5_000_000, 1_500_000, 2, "2019-03-01"],
  ["Trần Thị Mai Hương", "Nữ", "Phòng Nhân sự", "Chuyên viên", "Hà Nội", 15_000_000, 1_500_000, 800_000, 0, "2021-07-15"],
  ["Lê Văn Hùng", "Nam", "Phòng Công nghệ", "Trưởng phòng", "Hà Nội", 32_000_000, 6_000_000, 1_500_000, 1, "2020-01-06"],
  ["Phạm Minh Khoa", "Nam", "Phòng Công nghệ", "Chuyên viên cấp cao", "Hà Nội", 25_000_000, 2_000_000, 800_000, 0, "2021-11-02"],
  ["Vũ Thu Trang", "Nữ", "Phòng Công nghệ", "Chuyên viên", "TP. Hồ Chí Minh", 18_000_000, 0, 800_000, 0, "2022-04-11"],
  ["Đặng Quốc Bảo", "Nam", "Phòng Công nghệ", "Nhân viên", "Hà Nội", 12_000_000, 0, 500_000, 0, "2023-08-21"],
  ["Hoàng Lan Anh", "Nữ", "Phòng Kế toán – Tài chính", "Kế toán trưởng", "Hà Nội", 30_000_000, 5_000_000, 1_000_000, 1, "2019-09-02"],
  ["Bùi Tiến Dũng", "Nam", "Phòng Kế toán – Tài chính", "Chuyên viên", "TP. Hồ Chí Minh", 16_000_000, 0, 800_000, 1, "2022-06-13"],
  ["Đỗ Thị Thanh Hà", "Nữ", "Phòng Kinh doanh", "Trưởng phòng", "TP. Hồ Chí Minh", 30_000_000, 5_000_000, 2_000_000, 2, "2018-05-14"],
  ["Ngô Hải Yến", "Nữ", "Phòng Kinh doanh", "Chuyên viên", "Hà Nội", 14_000_000, 0, 1_500_000, 0, "2023-02-01"],
  ["Dương Thu Thảo", "Nữ", "Phòng Marketing", "Chuyên viên", "Hà Nội", 14_500_000, 0, 800_000, 0, "2022-10-10"],
  ["Lý Hoàng Nam", "Nam", "Phòng Công nghệ", "Nhân viên", "TP. Hồ Chí Minh", 11_500_000, 0, 500_000, 0, "2024-03-18"],
];

// ngày nghỉ phép / đi muộn / nửa ngày tháng 10/2026 (danh sách ngày rõ ràng)
const ATTEND = {
  "Nguyễn Hoài Nam": { leave: [], late: [13], half: [] },
  "Trần Thị Mai Hương": { leave: [8, 9], late: [], half: [] },
  "Lê Văn Hùng": { leave: [], late: [], half: [20] },
  "Phạm Minh Khoa": { leave: [9], late: [7, 13], half: [] },
  "Vũ Thu Trang": { leave: [14, 15, 16], late: [], half: [] }, // nghỉ 3 ngày
  "Đặng Quốc Bảo": { leave: [], late: [2], half: [] },
  "Hoàng Lan Anh": { leave: [], late: [], half: [] },
  "Bùi Tiến Dũng": { leave: [6], late: [], half: [] },
  "Đỗ Thị Thanh Hà": { leave: [], late: [16], half: [16] },
  "Ngô Hải Yến": { leave: [12], late: [], half: [] },
  "Dương Thu Thảo": { leave: [], late: [], half: [] },
  "Lý Hoàng Nam": { leave: [23, 24], late: [23], half: [] },
};

const initials = (name) => {
  const parts = name.split(" ");
  return parts[parts.length - 1][0] + (parts[0] ? parts[0][0] : "");
};

// Nhân viên đầy đủ + mặt công
const employees = ROSTER.map((r, i) => {
  const [fullName, gender, department, position, branch, baseSalary, allowancePosition, allowanceTravel, dependents, joinDate] = r;
  const att = ATTEND[fullName] || { leave: [], late: [], half: [] };
  const code = "MQ-" + String(i + 1).padStart(4, "0");
  return {
    id: code,
    code,
    fullName,
    initials: initials(fullName),
    gender,
    dob: `19${85 + (i % 15)}-0${1 + (i % 9)}-${String(3 + (i % 25)).padStart(2, "0")}`,
    phone: `09${12 + (i % 8)} *** ${String(100 + i * 7).slice(-3)}`,
    email: `${code.toLowerCase()}@example.com`,
    department,
    position,
    branch,
    joinDate,
    contractType: i % 7 === 3 ? "Xác định thời hạn" : "Không xác định thời hạn",
    status: i === 3 ? "Thử việc" : i === 4 ? "Nghỉ thai sản" : "Đang làm việc",
    baseSalary,
    allowancePosition,
    allowanceTravel,
    dependents,
    attendance: att,
  };
});

/* ---------- chấm công tháng 10/2026 ---------- */
const grid = employees.map((e) => {
  const cells = [];
  for (let d = 1; d <= 31; d++) {
    const dow = new Date(MONTH.year, MONTH.month - 1, d).getDay(); // 0=CN
    if (dow === 0 || dow === 6) cells.push("OFF");
    else if (e.attendance.leave.includes(d)) cells.push("NP");
    else if (e.attendance.half.includes(d)) cells.push("H");
    else if (e.attendance.late.includes(d)) cells.push("L");
    else cells.push("P");
  }
  const ngayCong = cells.filter((c) => c === "P").length + cells.filter((c) => c === "L").length + 0.5 * cells.filter((c) => c === "H").length;
  return {
    code: e.code,
    fullName: e.fullName,
    department: e.department,
    cells,
    ngayCong,
    diMuon: cells.filter((c) => c === "L").length,
    nghiPhep: cells.filter((c) => c === "NP").length,
  };
});

/* ---------- bảng lương ---------- */
const payrollRows = employees.map((e) => {
  const att = grid.find((g) => g.code === e.code);
  const insuranceBase = Math.min(e.baseSalary, INS_CAP);
  const byWorkdays = Math.round(((e.baseSalary / MONTH.workdays) * att.ngayCong) / 1000) * 1000;
  const allowanceFixed = e.allowancePosition + e.allowanceTravel;
  const thuNhap = byWorkdays + allowanceFixed;
  const bhxh = Math.round(insuranceBase * 0.08);
  const bhyt = Math.round(insuranceBase * 0.015);
  const bhtn = Math.round(insuranceBase * 0.01);
  const insurance = bhxh + bhyt + bhtn;
  const giamTru = PT_BANTHAN + PT_PHUTHUOC * e.dependents;
  const thue = pit(thuNhap - insurance - giamTru);
  const thucNhan = thuNhap - insurance - thue;
  return {
    code: e.code,
    fullName: e.fullName,
    department: e.department,
    position: e.position,
    bankAccount: `1000${String(100000 + Number(e.code.slice(-4))).slice(-7)}`,
    ngayCong: att.ngayCong,
    baseSalary: e.baseSalary,
    byWorkdays,
    allowanceFixed,
    thuNhap,
    insuranceBase,
    bhxh,
    bhyt,
    bhtn,
    insurance,
    dependents: e.dependents,
    giamTru,
    thue,
    thucNhan,
    coBhxh: Math.round(insuranceBase * INS_CO_RATE),
  };
});

const total = (key) => payrollRows.reduce((s, r) => s + r[key], 0);
const payrollTotal = {
  fullName: "TỔNG CỘNG (12 nhân sự hiển thị / 186 nhân sự)",
  ngayCong: total("ngayCong"),
  thuNhap: total("thuNhap"),
  insurance: total("insurance"),
  thue: total("thue"),
  thucNhan: total("thucNhan"),
  coBhxh: total("coBhxh"),
};

/* ---------- nghỉ phép ---------- */
const LEAVE = [
  ["Vũ Thu Trang", "Nghỉ phép năm", "14/10/2026 – 16/10/2026", 3, "Đã duyệt", "Lê Văn Hùng", "Nghỉ dưỡng cùng gia đình"],
  ["Trần Thị Mai Hương", "Nghỉ phép năm", "08/10/2026 – 09/10/2026", 2, "Đã duyệt", "Nguyễn Hoài Nam", "Chăm con ốm"],
  ["Phạm Minh Khoa", "Nghỉ ốm", "09/10/2026", 1, "Đã duyệt", "Lê Văn Hùng", "Nghỉ bệnh có giấy xác nhận"],
  ["Ngô Hải Yến", "Nghỉ phép năm", "12/10/2026", 1, "Chờ duyệt", "Đỗ Thị Thanh Hà", "Đám giỗ gia đình"],
  ["Đặng Quốc Bảo", "Nghỉ việc riêng", "05/11/2026", 1, "Chờ duyệt", "Lê Văn Hùng", "Làm thủ tục ngân hàng"],
  ["Lý Hoàng Nam", "Nghỉ phép năm", "23/10/2026 – 24/10/2026", 2, "Đã duyệt", "Lê Văn Hùng", "Về quê"],
  ["Dương Thu Thảo", "Nghỉ thai sản", "01/12/2026 – 30/05/2027", 122, "Chờ duyệt", "Đỗ Thị Thanh Hà", "Theo chế độ thai sản"],
  ["Bùi Tiến Dũng", "Nghỉ ốm", "06/10/2026", 1, "Đã duyệt", "Hoàng Lan Anh", "Khám tổng quát"],
  ["Trần Thị Mai Hương", "Nghỉ phép năm", "17/11/2026", 1, "Từ chối", "Nguyễn Hoài Nam", "Trùng lịch báo cáo quý"],
  ["Nguyễn Hoài Nam", "Công tác", "21/10/2026 – 23/10/2026", 3, "Đã duyệt", "Ban Giám đốc", "Hội nghị nhân sự khu vực phía Nam"],
];
const leaveRequests = LEAVE.map((r, i) => ({
  id: "DX-" + String(2400 + i),
  fullName: r[0], type: r[1], period: r[2], days: r[3],
  status: r[4], approver: r[5], reason: r[6],
  submittedAt: `0${1 + (i % 9)}/10/2026`,
}));

/* ---------- đề xuất / phê duyệt ---------- */
const PROPOSALS = [
  ["PT-1024", "Đề xuất tuyển dụng", "Lý Hoàng Nam", "Phòng Công nghệ", "Bổ sung 02 lập trình viên Frontend", "Phó Giám đốc", "Đang chờ duyệt", "05/10/2026"],
  ["PT-1023", "Đề xuất tăng lương", "Đỗ Thị Thanh Hà", "Phòng Kinh doanh", "Điều chỉnh lương định kỳ đợt 2/2026", "Giám đốc", "Đã duyệt", "03/10/2026"],
  ["PT-1022", "Đề xuất đào tạo", "Nguyễn Hoài Nam", "Phòng Nhân sự", "Khoá đào tạo kỹ năng quản lý cấp trung", "Phòng Nhân sự", "Đang xử lý", "02/10/2026"],
  ["PT-1021", "Đề xuất mua sắm", "Hoàng Lan Anh", "Phòng Kế toán – Tài chính", "Mua 05 laptop cho phòng Kinh doanh", "Kế toán trưởng", "Đã duyệt", "01/10/2026"],
  ["PT-1020", "Đề xuất tuyển dụng", "Trần Thị Mai Hương", "Phòng Nhân sự", "Tuyển chuyên viên HCNS phụ trách C&B", "Trưởng phòng Nhân sự", "Từ chối", "30/09/2026"],
  ["PT-1019", "Đề xuất chấm dứt HĐ", "Lê Văn Hùng", "Phòng Công nghệ", "Chấm dứt hợp đồng theo thỏa thuận", "Phó Giám đốc", "Đã duyệt", "29/09/2026"],
  ["PT-1018", "Đề xuất đào tạo", "Phạm Minh Khoa", "Phòng Công nghệ", "Tham dự hội thảo bảo mật thông tin", "Trưởng phòng Công nghệ", "Đang chờ duyệt", "28/09/2026"],
  ["PT-1017", "Đề xuất mua sắm", "Đặng Quốc Bảo", "Phòng Công nghệ", "Mua màn hình 27 inch cho đội thiết kế", "Kế toán trưởng", "Đã duyệt", "26/09/2026"],
  ["PT-1016", "Đề xuất tuyển dụng", "Đỗ Thị Thanh Hà", "Phòng Kinh doanh", "Bổ sung 03 nhân viên kinh doanh chi nhánh HCM", "Giám đốc", "Đang chờ duyệt", "25/09/2026"],
  ["PT-1015", "Đề xuất tăng lương", "Bùi Tiến Dũng", "Phòng Kế toán – Tài chính", "Thăng chức kế toán viên lên chuyên viên", "Kế toán trưởng", "Đang chờ duyệt", "24/09/2026"],
];
const proposals = PROPOSALS.map((p) => ({
  id: p[0], type: p[1], requester: p[2], department: p[3], title: p[4],
  currentStep: p[5], status: p[6], submittedAt: p[7],
}));

/* ---------- tổng quan ---------- */
const HEADCOUNT = {
  total: 186,
  present: 171,
  onLeave: 8,
  businessTrip: 4,
  remote: 3,
  recruiting: 9,
  branches: [
    { name: "Văn phòng Hà Nội", count: 112 },
    { name: "Văn phòng TP. Hồ Chí Minh", count: 74 },
  ],
};
const MONTHLY_FLOW = [
  { month: "T12/25", total: 158, joined: 5, left: 1 },
  { month: "T01/26", total: 162, joined: 6, left: 2 },
  { month: "T02/26", total: 165, joined: 5, left: 2 },
  { month: "T03/26", total: 165, joined: 4, left: 4 },
  { month: "T04/26", total: 171, joined: 8, left: 2 },
  { month: "T05/26", total: 174, joined: 5, left: 2 },
  { month: "T06/26", total: 178, joined: 7, left: 3 },
  { month: "T07/26", total: 181, joined: 5, left: 2 },
  { month: "T08/26", total: 184, joined: 6, left: 3 },
  { month: "T09/26", total: 186, joined: 5, left: 3 },
];
const DEPARTMENTS = [
  { name: "Ban Giám đốc", manager: "Trần Quốc Việt", headcount: 6 },
  { name: "Phòng Nhân sự", manager: "Nguyễn Hoài Nam", headcount: 14 },
  { name: "Phòng Kế toán – Tài chính", manager: "Hoàng Lan Anh", headcount: 16 },
  { name: "Phòng Kinh doanh", manager: "Đỗ Thị Thanh Hà", headcount: 42 },
  { name: "Phòng Marketing", manager: "Nguyễn Thành Long", headcount: 18 },
  { name: "Phòng Công nghệ", manager: "Lê Văn Hùng", headcount: 68 },
  { name: "Phòng Hành chính", manager: "Võ Thị Hồng", headcount: 12 },
  { name: "Phòng Chăm sóc khách hàng", manager: "Phan Thị Thu Hiền", headcount: 10 },
];
const RECRUITING = [
  ["NV-2609", "Frontend Developer", "Phòng Công nghệ", "Hà Nội", 2, "Đang mở"],
  ["NV-2608", "Backend Developer", "Phòng Công nghệ", "TP. Hồ Chí Minh", 2, "Đang mở"],
  ["NV-2607", "Chuyên viên HCNS (C&B)", "Phòng Nhân sự", "Hà Nội", 1, "Đang mở"],
  ["NV-2606", "Nhân viên kinh doanh", "Phòng Kinh doanh", "TP. Hồ Chí Minh", 3, "Đang mở"],
  ["NV-2605", "Chuyên viên Content", "Phòng Marketing", "Hà Nội", 1, "Đang mở"],
];

/* ---------- tuyển dụng: pipeline ứng viên (màn 10) ---------- */
// Mỗi vòng: tổng số ứng viên đang ở vòng + vài thẻ tiêu biểu. Vị trí lấy từ RECRUITING.
const PIPELINE = [
  { stage: "Ứng tuyển", total: 46, cards: [
    ["Trịnh Minh Tuấn", "Frontend Developer", "Website tuyển dụng", "09/10/2026", "Mới"],
    ["Phan Ngọc Ánh", "Nhân viên kinh doanh", "Giới thiệu nội bộ", "09/10/2026", "Mới"],
    ["Cao Đức Thịnh", "Backend Developer", "Trang việc làm", "08/10/2026", "Mới"],
    ["Mai Thùy Linh", "Chuyên viên Content", "Website tuyển dụng", "08/10/2026", "Mới"],
  ] },
  { stage: "Sàng lọc", total: 19, cards: [
    ["Lâm Quốc Huy", "Backend Developer", "Trang việc làm", "06/10/2026", "Đạt CV"],
    ["Tạ Thu Hằng", "Chuyên viên HCNS (C&B)", "Giới thiệu nội bộ", "05/10/2026", "Đạt CV"],
    ["Hồ Văn Lực", "Nhân viên kinh doanh", "Website tuyển dụng", "05/10/2026", "Chờ test"],
  ] },
  { stage: "Phỏng vấn", total: 9, cards: [
    ["Kiều Anh Dũng", "Frontend Developer", "Trang việc làm", "Vòng 2 · 14/10/2026", "Đã hẹn"],
    ["Đinh Bảo Ngọc", "Chuyên viên Content", "Website tuyển dụng", "Vòng 1 · 13/10/2026", "Đã hẹn"],
    ["La Thanh Sơn", "Nhân viên kinh doanh", "Giới thiệu nội bộ", "Vòng 1 · 15/10/2026", "Chờ xác nhận"],
  ] },
  { stage: "Offer", total: 3, cards: [
    ["Âu Minh Châu", "Backend Developer", "Trang việc làm", "Gửi 07/10/2026", "Chờ phản hồi"],
    ["Quách Gia Bảo", "Nhân viên kinh doanh", "Website tuyển dụng", "Gửi 08/10/2026", "Đã nhận lời"],
  ] },
  { stage: "Nhận việc", total: 2, cards: [
    ["Văn Thị Kim Oanh", "Frontend Developer", "Giới thiệu nội bộ", "Nhận việc 15/10/2026", "Đã ký HĐ thử việc"],
    ["Lưu Hoàng Phúc", "Nhân viên kinh doanh", "Trang việc làm", "Nhận việc 01/11/2026", "Đã ký HĐ thử việc"],
  ] },
];
const recruitmentPipeline = PIPELINE.map((col) => ({
  stage: col.stage,
  total: col.total,
  cards: col.cards.map((c) => ({ fullName: c[0], position: c[1], source: c[2], note: c[3], tag: c[4] })),
}));

/* ---------- hợp đồng lao động sắp hết hạn (màn 11) ---------- */
const TODAY = new Date(2026, 9, 10); // mốc dữ liệu 10/10/2026
const daysLeft = (ddmmyyyy) => {
  const [d, m, y] = ddmmyyyy.split("/").map(Number);
  return Math.round((new Date(y, m - 1, d) - TODAY) / 86_400_000);
};
// [họ tên, phòng ban, loại HĐ, số HĐ, hiệu lực, hết hạn, trạng thái]
const CONTRACTS = [
  ["Phạm Minh Khoa", "Phòng Công nghệ", "Thử việc", "TV-2026/031", "21/08/2026", "20/10/2026", "Chờ đánh giá"],
  ["Lý Hoàng Nam", "Phòng Công nghệ", "XĐ thời hạn 12 tháng", "HĐ-2025/118", "18/10/2025", "17/10/2026", "Chờ gia hạn"],
  ["Ngô Hải Yến", "Phòng Kinh doanh", "XĐ thời hạn 24 tháng", "HĐ-2024/052", "01/11/2024", "31/10/2026", "Chờ gia hạn"],
  ["Dương Thu Thảo", "Phòng Marketing", "XĐ thời hạn 24 tháng", "HĐ-2024/061", "10/11/2024", "09/11/2026", "Đã gửi phụ lục"],
  ["Trương Văn Khải", "Phòng Kinh doanh", "XĐ thời hạn 12 tháng", "HĐ-2025/131", "15/11/2025", "14/11/2026", "Chờ gia hạn"],
  ["Nguyễn Thị Bích Ngọc", "Phòng Chăm sóc khách hàng", "XĐ thời hạn 12 tháng", "HĐ-2025/140", "24/11/2025", "23/11/2026", "Chờ gia hạn"],
  ["Hà Minh Trí", "Phòng Công nghệ", "XĐ thời hạn 24 tháng", "HĐ-2024/077", "02/12/2024", "01/12/2026", "Đã gia hạn"],
  ["Tôn Nữ Diệu Linh", "Phòng Hành chính", "XĐ thời hạn 12 tháng", "HĐ-2025/152", "08/12/2025", "07/12/2026", "Chờ ký"],
];
const contracts = CONTRACTS.map((c) => ({
  fullName: c[0], department: c[1], type: c[2], number: c[3],
  startDate: c[4], endDate: c[5], daysLeft: daysLeft(c[5]), status: c[6],
}));
const contractSummary = {
  active: HEADCOUNT.total,
  indefinite: 141,
  fixedTerm: 39,
  probation: 6,
  expiring30: contracts.filter((c) => c.daysLeft <= 30).length,
  expiring60: contracts.filter((c) => c.daysLeft <= 60).length,
};

/* ---------- đánh giá KPI quý III/2026 (màn 12) ---------- */
// [họ tên, phòng ban, % mục tiêu hoàn thành, điểm KPI (70%), điểm năng lực (30%), trạng thái]
const KPI = [
  ["Đỗ Thị Thanh Hà", "Phòng Kinh doanh", 112, 96, 90, "Đã chốt"],
  ["Lê Văn Hùng", "Phòng Công nghệ", 104, 92, 94, "Đã chốt"],
  ["Hoàng Lan Anh", "Phòng Kế toán – Tài chính", 100, 90, 92, "Đã chốt"],
  ["Phạm Minh Khoa", "Phòng Công nghệ", 98, 88, 84, "Chờ quản lý duyệt"],
  ["Ngô Hải Yến", "Phòng Kinh doanh", 94, 84, 80, "Chờ quản lý duyệt"],
  ["Trần Thị Mai Hương", "Phòng Nhân sự", 92, 82, 86, "Đã chốt"],
  ["Dương Thu Thảo", "Phòng Marketing", 88, 79, 82, "Tự đánh giá"],
  ["Đặng Quốc Bảo", "Phòng Công nghệ", 81, 74, 78, "Chờ quản lý duyệt"],
  ["Lý Hoàng Nam", "Phòng Công nghệ", 72, 66, 74, "Tự đánh giá"],
  ["Bùi Tiến Dũng", "Phòng Kế toán – Tài chính", 63, 58, 70, "Chờ quản lý duyệt"],
];
const grade = (score) => (score >= 90 ? "A" : score >= 80 ? "B" : score >= 65 ? "C" : "D");
const kpiReviews = KPI.map((k) => {
  const total = Math.round((k[3] * 0.7 + k[4] * 0.3) * 10) / 10;
  return { fullName: k[0], department: k[1], targetPct: k[2], kpiScore: k[3], skillScore: k[4], total, grade: grade(total), status: k[5] };
});
// Phân bố xếp loại toàn công ty (tổng = 186) và tiến độ đánh giá theo phòng ban
const kpiDistribution = [
  { grade: "A", label: "Xuất sắc", count: 27 },
  { grade: "B", label: "Tốt", count: 98 },
  { grade: "C", label: "Đạt", count: 51 },
  { grade: "D", label: "Cần cải thiện", count: 10 },
];
const kpiProgress = [
  { department: "Phòng Kinh doanh", done: 36, total: 42 },
  { department: "Phòng Công nghệ", done: 49, total: 68 },
  { department: "Phòng Marketing", done: 12, total: 18 },
  { department: "Phòng Kế toán – Tài chính", done: 16, total: 16 },
  { department: "Phòng Nhân sự", done: 14, total: 14 },
];

/* ---------- biến động nhân sự 2026 (màn 13) ---------- */
// Tuyển mới / nghỉ việc T01–T09/2026 theo phòng ban — tổng khớp MONTHLY_FLOW (51 vào / 23 ra).
const TURNOVER_BY_DEPT = [
  ["Phòng Công nghệ", 20, 6],
  ["Phòng Kinh doanh", 15, 8],
  ["Phòng Marketing", 5, 3],
  ["Phòng Chăm sóc khách hàng", 4, 3],
  ["Phòng Nhân sự", 3, 1],
  ["Phòng Kế toán – Tài chính", 2, 1],
  ["Phòng Hành chính", 2, 1],
  ["Ban Giám đốc", 0, 0],
];
const LEAVE_REASONS = [
  ["Lý do cá nhân / gia đình", 8],
  ["Thu nhập & phúc lợi", 6],
  ["Cơ hội nghề nghiệp khác", 5],
  ["Hết hạn hợp đồng", 3],
  ["Khác", 1],
];

function buildTurnover() {
  const ytd = MONTHLY_FLOW.filter((m) => m.month.endsWith("/26"));
  const joined = ytd.reduce((s, m) => s + m.joined, 0);
  const left = ytd.reduce((s, m) => s + m.left, 0);
  const avgHeadcount = ytd.reduce((s, m) => s + m.total, 0) / ytd.length;
  const byDepartment = TURNOVER_BY_DEPT.map(([name, inCount, outCount]) => {
    const headcount = DEPARTMENTS.find((d) => d.name === name).headcount;
    return { name, headcount, joined: inCount, left: outCount, rate: Math.round((outCount / headcount) * 1000) / 10 };
  });
  return {
    period: "T01 – T09/2026",
    months: ytd,
    joined,
    left,
    net: joined - left,
    rate: Math.round((left / avgHeadcount) * 1000) / 10,
    byDepartment,
    reasons: LEAVE_REASONS.map(([reason, count]) => ({ reason, count })),
  };
}

const fixture = {
  meta: {
    company: "Công ty TNHH Giải pháp Minh Quang",
    month: "Tháng 10/2026",
    workdays: MONTH.workdays,
    loggedInUser: { name: "Nguyễn Hoài Nam", role: "Quản trị nhân sự" },
    note: "Dữ liệu giả để chụp ảnh minh hoạ. Không có người thật.",
  },
  headcount: HEADCOUNT,
  monthlyFlow: MONTHLY_FLOW,
  departments: DEPARTMENTS,
  recruiting: RECRUITING.map((r) => ({ id: r[0], position: r[1], department: r[2], branch: r[3], count: r[4], status: r[5] })),
  employees,
  attendanceGrid: grid,
  payroll: { month: MONTH, rows: payrollRows, total: payrollTotal },
  leaveRequests,
  proposals,
  recruitmentPipeline,
  contracts,
  contractSummary,
  kpi: { period: "Quý III/2026", reviews: kpiReviews, distribution: kpiDistribution, progress: kpiProgress },
  turnover: buildTurnover(),
};

const out = path.resolve("scripts/screenshots/fixtures/hrm.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(fixture, null, 2));
console.log("wrote", out);
console.log("payroll total:", JSON.stringify(payrollTotal));
