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
};

const out = path.resolve("scripts/screenshots/fixtures/hrm.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(fixture, null, 2));
console.log("wrote", out);
console.log("payroll total:", JSON.stringify(payrollTotal));
