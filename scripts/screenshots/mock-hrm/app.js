/**
 * app.js — mock HRM "Công ty TNHH Giải pháp Minh Quang".
 *
 * Không phải app thật: chỉ render lại dữ liệu trong
 * `scripts/screenshots/fixtures/hrm.json` thành HTML để chụp ảnh minh hoạ
 * cho trang giải pháp HRM trên website NTA.
 *
 * Mở:  /mock-hrm/?screen=<slug>   (xem scripts/screenshots/README.md)
 * Slug: overview · employees · employee-detail · attendance · payroll
 *       leave · org · proposals · directory
 *       recruitment · contracts · kpi · turnover
 */

/* ---------- tiện ích ---------- */
const fmtVnd = (n) => `${Math.round(n).toLocaleString("vi-VN")}đ`;
const fmtNum = (n) => Math.round(n).toLocaleString("vi-VN");

const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>',
  wallet: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1"/><rect x="3" y="7.5" width="18" height="11.5" rx="2.5"/><path d="M17 13.2h.01"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  sitemap: '<rect x="9" y="2.5" width="6" height="5" rx="1.4"/><rect x="2" y="16" width="6" height="5" rx="1.4"/><rect x="16" y="16" width="6" height="5" rx="1.4"/><path d="M12 7.5v4.5M5 16v-2.5h14V16"/>',
  flow: '<rect x="2.5" y="3" width="7" height="5.5" rx="1.4"/><rect x="14.5" y="15.5" width="7" height="5.5" rx="1.4"/><path d="M6 8.5v5a3 3 0 0 0 3 3h5.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  trend: '<path d="M3 17l5.5-5.5 3.5 3.5L21 6"/><path d="M15 6h6v6"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.4 3.1-5.4 7-5.4s7 2 7 5.4"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="2.4"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h6"/>',
  userPlus: '<circle cx="9" cy="8" r="3.6"/><path d="M2.5 20c0-3.4 2.9-5.4 6.5-5.4 1.6 0 3 .4 4.1 1.1"/><path d="M18 13v7M14.5 16.5h7"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  report: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
};

const icon = (name, extra = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICONS[name]}</svg>`;

const avColor = (seed) => {
  const palette = ["#1d4ed8", "#0891b2", "#7c3aed", "#0d9488", "#c2410c", "#be185d", "#4d7c0f", "#0369a1"];
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return palette[h % palette.length];
};

const avatar = (person, size = 32) =>
  `<span class="mini-avatar" style="--s:${size}px;background:${avColor(person.code || person.fullName)}">${person.initials || person.fullName.slice(-1)}</span>`;

const badge = (text, tone) => `<span class="badge ${tone}">${text}</span>`;

const statusTone = (status) =>
  ({ "Đang làm việc": "green", "Thử việc": "blue", "Nghỉ thai sản": "violet",
     "Đã duyệt": "green", "Chờ duyệt": "amber", "Đang chờ duyệt": "amber",
     "Đang xử lý": "blue", "Từ chối": "red", "Đang mở": "blue",
     "Chờ gia hạn": "amber", "Chờ đánh giá": "amber", "Chờ ký": "blue", "Đã gửi phụ lục": "blue", "Đã gia hạn": "green",
     "Đã chốt": "green", "Chờ quản lý duyệt": "amber", "Tự đánh giá": "slate" }[status] || "slate");

const NAV_MAIN = [
  ["overview", "Tổng quan nhân sự", "grid"],
  ["employees", "Hồ sơ nhân viên", "users"],
  ["attendance", "Chấm công", "clock"],
  ["payroll", "Tính lương", "wallet"],
  ["leave", "Nghỉ phép", "calendar"],
  ["recruitment", "Tuyển dụng", "userPlus"],
  ["contracts", "Hợp đồng lao động", "file"],
];
const NAV_MORE = [
  ["org", "Cơ cấu tổ chức", "sitemap"],
  ["proposals", "Quy trình đề xuất", "flow"],
  ["directory", "Tra cứu đội ngũ", "search"],
  ["kpi", "Đánh giá KPI", "target"],
  ["turnover", "Báo cáo biến động", "report"],
];

/* ---------- shell ---------- */
const F = await fetch("/fixtures/hrm.json").then((r) => r.json());
const params = new URLSearchParams(location.search);
const SCREEN = params.get("screen") || "overview";
const EMP_CODE = params.get("code") || F.employees[0].code;

document.getElementById("me-name").textContent = F.meta.loggedInUser.name;
document.getElementById("me-role").textContent = F.meta.loggedInUser.role;
const meInitials = F.employees.find((e) => e.fullName === F.meta.loggedInUser.name)?.initials || "NH";
document.getElementById("me-avatar").textContent = meInitials;
document.getElementById("top-avatar").textContent = meInitials;

const activeScreen = SCREEN === "employee-detail" ? "employees" : SCREEN;
const navHtml = (items) =>
  items
    .map(
      ([slug, label, ic]) =>
        `<li><a class="nav-item${slug === activeScreen ? " active" : ""}" href="?screen=${slug}">${icon(ic)}${label}</a></li>`
    )
    .join("");
document.getElementById("nav-main").innerHTML = navHtml(NAV_MAIN);
document.getElementById("nav-more").innerHTML = navHtml(NAV_MORE);

const pageTitle = (title, crumb, actions = "") => `
  <div class="page-title-row">
    <div>
      <div class="breadcrumb">Nhân sự <b>/</b> ${crumb}</div>
      <div class="page-title">${title}</div>
    </div>
    <div class="filters-right">${actions}</div>
  </div>`;

const btn = (label, ic, cls = "") => `<button class="btn ${cls}">${ic ? icon(ic) : ""}${label}</button>`;

/* ---------- 1. Tổng quan nhân sự ---------- */
const screenOverview = () => {
  const hc = F.headcount;
  const maxTotal = Math.max(...F.monthlyFlow.map((m) => m.total));
  const bars = F.monthlyFlow
    .map((m) => {
      const h = Math.round((m.total / maxTotal) * 150);
      const joinH = Math.round((m.joined / (m.joined + m.left)) * h);
      return `<div class="bar">
        <span class="bar-total">${m.total}</span>
        <div class="bar-stack" style="height:${h}px">
          <span class="bar-join" style="height:${joinH}px"></span>
          <span class="bar-leave" style="height:${h - joinH}px"></span>
        </div>
        <span class="bar-label">${m.month}</span>
      </div>`;
    })
    .join("");

  const branchTotal = hc.branches.reduce((s, b) => s + b.count, 0);
  const pct = Math.round((hc.branches[0].count / branchTotal) * 100);
  const donut = `<div class="donut" style="background:conic-gradient(#1d4ed8 0 ${pct}%, #bfdbfe ${pct}% 100%)">
      <div class="donut-center"><div><b>${branchTotal}</b><span>nhân sự</span></div></div>
    </div>`;

  const activity = [
    ["Nguyễn Hoài Nam", "đã duyệt đơn nghỉ phép 2 ngày của Trần Thị Mai Hương", "08:42"],
    ["Lê Văn Hùng", "đã duyệt đề xuất PT-1021 — mua 05 laptop phòng Kinh doanh", "09:15"],
    ["Hệ thống", "chuyển bảng lương tháng 10/2026 sang trạng thái chờ chốt", "09:30"],
    ["Đỗ Thị Thanh Hà", "gửi đề xuất PT-1016 — bổ sung 03 nhân viên kinh doanh chi nhánh HCM", "10:05"],
    ["Hoàng Lan Anh", "đã cập nhật hợp đồng lao động cho 04 nhân sự", "10:48"],
    ["Phạm Minh Khoa", "chấm công đi muộn ngày 07/10/2026 (07:52)", "11:20"],
  ]
    .map(
      ([who, what, time]) => `
      <div class="list-row">
        ${avatar({ code: who, fullName: who, initials: who.slice(0, 1) }, 34)}
        <div class="grow"><div class="title">${who} <span style="font-weight:400;color:var(--slate-600)">${what}</span></div></div>
        <div class="sub mono">${time}</div>
      </div>`
    )
    .join("");

  const recruiting = F.recruiting
    .map(
      (r) => `<div class="list-row">
        <span class="kpi-icon" style="width:38px;height:38px;border-radius:12px">${icon("briefcase")}</span>
        <div class="grow"><div class="title">${r.position}</div><div class="sub">${r.department} · ${r.branch}</div></div>
        <div class="sub">${r.count} chỉ tiêu ${badge(r.status, statusTone(r.status))}</div>
      </div>`
    )
    .join("");

  return (
    pageTitle("Tổng quan nhân sự", "Tổng quan", btn("Tháng 10/2026", "calendar") + btn("Xuất báo cáo", "wallet", "primary")) +
    `<div class="kpi-grid">
      <div class="card kpi"><div><div class="kpi-label">Tổng nhân sự</div><div class="kpi-value">${hc.total}</div>
        <div class="kpi-trend">${icon("trend", 'width="13" height="13"')} +5 so với T9/2026</div></div>
        <span class="kpi-icon">${icon("users")}</span></div>
      <div class="card kpi"><div><div class="kpi-label">Có mặt hôm nay</div><div class="kpi-value">${hc.present}</div>
        <div class="kpi-hint">Công tác ${hc.businessTrip} · làm từ xa ${hc.remote}</div></div>
        <span class="kpi-icon green">${icon("check")}</span></div>
      <div class="card kpi"><div><div class="kpi-label">Nghỉ phép</div><div class="kpi-value">${hc.onLeave}</div>
        <div class="kpi-hint">3 đơn chờ duyệt</div></div>
        <span class="kpi-icon amber">${icon("calendar")}</span></div>
      <div class="card kpi"><div><div class="kpi-label">Đang tuyển dụng</div><div class="kpi-value">${hc.recruiting}</div>
        <div class="kpi-hint">5 vị trí đang mở</div></div>
        <span class="kpi-icon violet">${icon("briefcase")}</span></div>
    </div>
    <div class="two-col">
      <div class="card chart-card">
        <div class="card-head"><div><div class="card-title">Biến động nhân sự theo tháng</div>
          <div class="card-sub">T9/2025 – T9/2026 · tổng nhân sự, tuyển mới và nghỉ việc</div></div>
          ${badge("12 tháng", "slate")}</div>
        <div class="card-body">
          <div class="legend"><span><i class="dotc" style="background:#134cc9"></i>Tuyển mới</span>
            <span><i class="dotc" style="background:#cbd5e1"></i>Nghỉ việc</span></div>
          <div class="bars">${bars}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">Cơ cấu theo chi nhánh</div></div>
        <div class="card-body">
          <div class="donut-wrap">${donut}
            <div class="donut-legend">
              ${hc.branches.map((b, i) => `<div class="dl-row"><i class="dotc" style="background:${i === 0 ? "#1d4ed8" : "#bfdbfe"}"></i>${b.name}<b>${b.count}</b></div>`).join("")}
              <div class="dl-row" style="color:var(--slate-500)">Tổng cộng<b>${branchTotal}</b></div>
            </div>
          </div>
          <div class="note" style="margin-top:18px">${icon("trend")}
            <div>Tỷ trọng nhân sự Hà Nội <b>${pct}%</b> — kế hoạch 2026 ưu tiên tuyển dụng cho văn phòng TP. Hồ Chí Minh.</div></div>
        </div>
      </div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="card-head"><div><div class="card-title">Hoạt động gần đây</div>
          <div class="card-sub">Nhật ký thao tác hôm nay 11/10/2026</div></div>
          <a class="btn sm ghost" href="#">Xem tất cả</a></div>
        <div class="list-rows">${activity}</div>
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">Tuyển dụng đang mở</div>
          <div class="card-sub">9 chỉ tiêu / 5 vị trí</div></div></div>
        <div class="list-rows">${recruiting}</div>
      </div>
    </div>`
  );
};

const contractLabel = (t) =>
  t.replace("Không xác định thời hạn", "Không XĐ thời hạn").replace("Xác định thời hạn", "XĐ thời hạn");

/* ---------- 2. Hồ sơ nhân viên — danh sách ---------- */
const screenEmployees = () => {
  const rows = F.employees
    .map(
      (e) => `<tr>
        <td><div class="emp-cell">${avatar(e)}<div><div>${e.fullName}</div><div class="emp-code mono">${e.code}</div></div></div></td>
        <td>${e.department}</td>
        <td>${e.position}</td>
        <td>${e.branch}</td>
        <td>${contractLabel(e.contractType)}</td>
        <td>${badge(e.status, statusTone(e.status))}</td>
        <td class="num mono">${e.joinDate.split("-").reverse().join("/")}</td>
        <td style="width:1%"><a class="btn sm ghost" href="?screen=employee-detail&code=${e.code}">Chi tiết</a></td>
      </tr>`
    )
    .join("");

  const depts = [...new Set(F.employees.map((e) => e.department))];

  return (
    pageTitle("Hồ sơ nhân viên", "Hồ sơ nhân viên", btn("Nhập từ Excel", "wallet") + btn("Thêm nhân sự", "user", "primary")) +
    `<div class="card">
      <div class="card-body" style="padding-bottom:14px">
        <div class="filters">
          <span class="chip-select">Phòng ban: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
          <span class="chip-select">Chức danh: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
          <span class="chip-select">Trạng thái: Đang làm việc ${icon("grid", 'width="13" height="13" class="chev"')}</span>
          <span class="chip-select">Chi nhánh: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
          <span class="search-inline">${icon("search", 'width="15" height="15"')}<span>Tìm theo tên hoặc mã nhân viên…</span></span>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr>
            <th>Nhân sự</th><th>Phòng ban</th><th>Chức danh</th><th>Chi nhánh</th>
            <th>Hợp đồng</th><th>Trạng thái</th><th class="num">Ngày vào</th><th></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="table-foot">
        <span>Hiển thị <b>${F.employees.length}</b> / 186 nhân sự · ${depts.length} phòng ban</span>
        <span class="pager"><button>‹</button><button class="on">1</button><button>2</button><button>3</button><button>…</button><button>16</button><button>›</button></span>
      </div>
    </div>`
  );
};

/* ---------- 3. Hồ sơ nhân viên — chi tiết ---------- */
const screenEmployeeDetail = () => {
  const e = F.employees.find((x) => x.code === EMP_CODE) || F.employees[0];
  const pay = F.payroll.rows.find((r) => r.code === e.code);
  const info = [
    ["Mã nhân viên", e.code], ["Ngày sinh", e.dob.split("-").reverse().join("/")],
    ["Giới tính", e.gender], ["Điện thoại", e.phone],
    ["Email", e.email], ["Chi nhánh", e.branch],
    ["Ngày vào làm", e.joinDate.split("-").reverse().join("/")], ["Người phụ thuộc", `${e.dependents} người`],
  ];

  const timeline = [
    ["01/03/2019", "Nhận việc — Chuyên viên Nhân sự", e.branch],
    ["01/01/2021", "Bổ nhiệm Phó phòng Nhân sự", "Quyết định số 12/QĐ-MQ"],
    ["01/04/2023", "Bổ nhiệm Trưởng phòng Nhân sự", "Quyết định số 45/QĐ-MQ"],
    ["01/10/2026", "Điều chỉnh lương định kỳ đợt 2/2026", `Lương cơ bản ${fmtVnd(e.baseSalary)}`],
  ]
    .map(
      (t, i) => `<div class="list-row">
        <span class="mini-avatar" style="background:${i === 3 ? "#16a34a" : "#1d4ed8"}">${ICONS.check ? "✓" : "•"}</span>
        <div class="grow"><div class="title">${t[1]}</div><div class="sub">${t[2]}</div></div>
        <div class="sub mono">${t[0]}</div>
      </div>`
    )
    .join("");

  return (
    pageTitle("Hồ sơ nhân sự", `Hồ sơ nhân viên / ${e.fullName}`, btn("In hồ sơ", "wallet") + btn("Chỉnh sửa", "user", "primary")) +
    `<div class="card card-body">
      <div class="profile-head">
        <div class="profile-avatar">${e.initials}</div>
        <div>
          <div class="profile-name">${e.fullName}</div>
          <div class="profile-meta"><span class="mono">${e.code}</span><span>${e.position}</span><span>${e.department}</span><span>${e.branch}</span> ${badge(e.status, statusTone(e.status))}</div>
        </div>
        <div class="filters-right">${badge(e.contractType, "blue")}</div>
      </div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="card-head"><div class="card-title">Thông tin cá nhân</div></div>
        <div class="card-body"><div class="info-grid">
          ${info.map(([k, v]) => `<div class="info-item"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("")}
        </div></div>
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">Hợp đồng &amp; lương</div>
          <div class="card-sub">Hiệu lực từ 01/10/2026</div></div>${badge("Đang hiệu lực", "green")}</div>
        <div class="card-body"><div class="info-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="info-item"><div class="k">Lương cơ bản</div><div class="v">${fmtVnd(e.baseSalary)}</div></div>
          <div class="info-item"><div class="k">Phụ cấp chức vụ</div><div class="v">${fmtVnd(e.allowancePosition)}</div></div>
          <div class="info-item"><div class="k">Xăng xe &amp; điện thoại</div><div class="v">${fmtVnd(e.allowanceTravel)}</div></div>
          <div class="info-item"><div class="k">Thực nhận T10/2026</div><div class="v">${fmtVnd(pay.thucNhan)}</div></div>
          <div class="info-item"><div class="k">Số ngày công</div><div class="v">${pay.ngayCong} / ${F.meta.workdays} ngày</div></div>
          <div class="info-item"><div class="k">Ngày ký hợp đồng</div><div class="v">${e.joinDate.split("-").reverse().join("/")}</div></div>
        </div></div>
      </div>
    </div>
    <div class="two-col rev">
      <div class="card">
        <div class="card-head"><div class="card-title">Quá trình công tác</div></div>
        <div class="list-rows">${timeline}</div>
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">Chấm công tháng 10/2026</div>
          <div class="card-sub">Trích từ bảng chấm công phòng Nhân sự</div></div></div>
        <div class="card-body">
          <div class="stat-strip" style="grid-template-columns:repeat(3,1fr)">
            <div class="mini-stat"><div class="k">Ngày công</div><div class="v">${pay.ngayCong}</div></div>
            <div class="mini-stat"><div class="k">Đi muộn</div><div class="v">${(F.attendanceGrid.find((g) => g.code === e.code).diMuon) || 0}</div></div>
            <div class="mini-stat"><div class="k">Nghỉ phép</div><div class="v">${F.attendanceGrid.find((g) => g.code === e.code).nghiPhep || 0}</div></div>
          </div>
          <div class="note" style="margin-top:16px">${icon("check")}
            <div>Dữ liệu chấm công tháng 10/2026 đã được chốt ngày <b>31/10/2026</b> — dùng làm căn cứ tính lương kỳ 2.</div></div>
        </div>
      </div>
    </div>`
  );
};

/* ---------- 4. Chấm công ---------- */
const screenAttendance = () => {
  const cells = (row) =>
    row.cells
      .map((c, i) => {
        const day = i + 1;
        const dow = new Date(2026, 9, day).getDay();
        const cls = c === "OFF" ? "off" : c === "P" ? "p" : c === "L" ? "l" : c === "NP" ? "np" : "h";
        const label = c === "OFF" ? "" : c === "P" ? "x" : c === "L" ? "M" : c === "NP" ? "P" : "½";
        return `<td class="${cls}${dow === 0 || dow === 6 ? " weekend" : ""}" title="${day}/10/2026">${label}</td>`;
      })
      .join("");

  const head = Array.from({ length: 31 }, (_, i) => {
    const dow = new Date(2026, 9, i + 1).getDay();
    return `<th class="${dow === 0 || dow === 6 ? "weekend" : ""}">${i + 1}</th>`;
  }).join("");

  const rows = F.attendanceGrid
    .map(
      (g) => `<tr>
        <th><div class="emp-cell"><div><div>${g.fullName}</div><div class="emp-code mono">${g.code} · ${g.department}</div></div></div></th>
        ${cells(g)}
        <td class="num mono"><b>${g.ngayCong}</b></td>
        <td class="num mono">${g.diMuon}</td>
        <td class="num mono">${g.nghiPhep}</td>
      </tr>`
    )
    .join("");

  return (
    pageTitle("Bảng chấm công", "Chấm công / Tháng 10/2026", btn("Chốt công", "check") + btn("Xuất Excel", "wallet", "primary")) +
    `<div class="card">
      <div class="card-head"><div><div class="card-title">Chấm công tháng 10/2026</div>
        <div class="card-sub">${F.meta.workdays} ngày công chuẩn · đơn vị: Văn phòng Hà Nội · ${F.attendanceGrid.length}` +
    ` nhân sự hiển thị</div></div>${badge("Chưa chốt", "amber")}</div>
      <div class="card-body" style="padding-bottom:0"><div class="att-wrap">
        <table class="att">
          <thead><tr>
            <th style="text-align:left">Nhân sự</th>${head}
            <th>Ngày công</th><th>Đi muộn</th><th>Nghỉ phép</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div></div>
      <div class="att-key">
        <span class="key"><span class="key-sq" style="background:#f0fdf4;color:#15803d">x</span>Đi làm đủ ngày</span>
        <span class="key"><span class="key-sq" style="background:#fffbeb;color:#b45309">M</span>Đi muộn</span>
        <span class="key"><span class="key-sq" style="background:#f0fdfa;color:#0d9488">½</span>Nửa ngày</span>
        <span class="key"><span class="key-sq" style="background:#eff6ff;color:#1d4ed8">P</span>Nghỉ phép</span>
        <span class="key"><span class="key-sq" style="background:#f8fafc;color:#cbd5e1">—</span>Cuối tuần</span>
      </div>
    </div>`
  );
};

/* ---------- 5. Tính lương ---------- */
const screenPayroll = () => {
  const p = F.payroll;
  const rows = p.rows
    .map(
      (r) => `<tr>
        <td><div class="emp-cell">${avatar({ code: r.code, fullName: r.fullName })}<div><div>${r.fullName}</div><div class="emp-code mono">${r.code} · ${r.position}</div></div></div></td>
        <td class="num mono">${r.ngayCong}</td>
        <td class="num mono">${fmtNum(r.baseSalary)}</td>
        <td class="num mono">${fmtNum(r.byWorkdays)}</td>
        <td class="num mono">${fmtNum(r.allowanceFixed)}</td>
        <td class="num mono"><b>${fmtNum(r.thuNhap)}</b></td>
        <td class="num mono">${fmtNum(r.insurance)}</td>
        <td class="num mono">${fmtNum(r.thue)}</td>
        <td class="num mono"><b>${fmtNum(r.thucNhan)}</b></td>
      </tr>`
    )
    .join("");

  const t = p.total;
  const stat = (k, v, ic, tone = "") =>
    `<div class="mini-stat"><div class="k">${k}</div><div class="v">${v}</div></div>`;

  return (
    pageTitle("Bảng lương tháng 10/2026", "Tính lương / Kỳ 2/2026", btn("Phiếu lương", "wallet") + btn("Chốt lương &amp; chi trả", "check", "primary")) +
    `<div class="stat-strip">
      ${stat("Tổng thu nhập", fmtVnd(t.thuNhap))}
      ${stat("Khấu trừ NLĐ (10,5%)", fmtVnd(t.insurance))}
      ${stat("Thuế TNCN", fmtVnd(t.thue))}
      ${stat("Thực nhận", fmtVnd(t.thucNhan))}
      ${stat("Chi phí BHXH công ty (21,5%)", fmtVnd(t.coBhxh))}
    </div>
    <div class="card">
      <div class="card-head"><div><div class="card-title">Bảng thanh toán lương</div>
        <div class="card-sub">Ngày công chuẩn ${p.month.workdays} ngày · BHXH 8% · BHYT 1,5% · BHTN 1% · giảm trừ gia cảnh 15,5 triệu + 6,2 triệu/người phụ thuộc</div></div>
        ${badge("Đang tổng hợp", "blue")}</div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr>
            <th>Nhân sự</th><th class="num">Công</th><th class="num">Lương CB</th><th class="num">Theo công</th>
            <th class="num">Phụ cấp</th><th class="num">Thu nhập</th><th class="num">Bảo hiểm</th>
            <th class="num">Thuế TNCN</th><th class="num">Thực nhận</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tbody><tr class="total-row">
            <td>${t.fullName}</td>
            <td class="num mono">${t.ngayCong}</td>
            <td class="num mono">—</td>
            <td class="num mono">—</td>
            <td class="num mono">—</td>
            <td class="num mono">${fmtNum(t.thuNhap)}</td>
            <td class="num mono">${fmtNum(t.insurance)}</td>
            <td class="num mono">${fmtNum(t.thue)}</td>
            <td class="num mono">${fmtNum(t.thucNhan)}</td>
          </tr></tbody>
        </table>
      </div>
      <div class="table-foot">
        <span>Số liệu khớp từng dòng với bảng chấm công tháng 10/2026</span>
        <span class="pager"><button>‹</button><button class="on">1</button><button>2</button><button>›</button></span>
      </div>
    </div>`
  );
};

/* ---------- 6. Nghỉ phép ---------- */
const screenLeave = () => {
  const rows = F.leaveRequests
    .map(
      (r) => `<tr>
        <td class="mono">${r.id}</td>
        <td><div class="emp-cell">${avatar({ code: r.id, fullName: r.fullName })}<div>${r.fullName}</div></div></td>
        <td>${r.type}</td>
        <td class="mono">${r.period}</td>
        <td class="num mono">${r.days}</td>
        <td>${r.approver}</td>
        <td><div>${r.reason}</div><div class="emp-code">Gửi ngày ${r.submittedAt}</div></td>
        <td>${badge(r.status, statusTone(r.status))}</td>
      </tr>`
    )
    .join("");

  const count = (s) => F.leaveRequests.filter((r) => r.status === s).length;

  return (
    pageTitle("Nghỉ phép", "Nghỉ phép / Tháng 10/2026", btn("Lịch nghỉ toàn công ty", "calendar") + btn("Duyệt hàng loạt", "check", "primary")) +
    `<div class="stat-strip" style="grid-template-columns:repeat(4,1fr)">
      <div class="mini-stat"><div class="k">Tổng đơn trong tháng</div><div class="v">${F.leaveRequests.length}</div></div>
      <div class="mini-stat"><div class="k">Chờ duyệt</div><div class="v" style="color:#b45309">${count("Chờ duyệt")}</div></div>
      <div class="mini-stat"><div class="k">Đã duyệt</div><div class="v" style="color:#15803d">${count("Đã duyệt")}</div></div>
      <div class="mini-stat"><div class="k">Từ chối</div><div class="v" style="color:#b91c1c">${count("Từ chối")}</div></div>
    </div>
    <div class="card">
      <div class="card-body" style="padding-bottom:14px"><div class="filters">
        <span class="chip-select">Trạng thái: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
        <span class="chip-select">Loại nghỉ: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
        <span class="chip-select">Phòng ban: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
        <span class="search-inline">${icon("search", 'width="15" height="15"')}<span>Tìm theo tên nhân sự…</span></span>
      </div></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Mã đơn</th><th>Nhân sự</th><th>Loại nghỉ</th><th>Thời gian</th>
            <th class="num">Số ngày</th><th>Người duyệt</th><th>Lý do</th><th>Trạng thái</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="table-foot"><span>Hiển thị <b>${F.leaveRequests.length}</b> đơn nghỉ phép gần nhất</span>
        <span class="pager"><button>‹</button><button class="on">1</button><button>›</button></span></div>
    </div>`
  );
};

/* ---------- 7. Cơ cấu tổ chức ---------- */
const screenOrg = () => {
  const depts = F.departments;
  const totalHead = depts.reduce((s, d) => s + d.headcount, 0);
  const mid = depts.filter((d) => !["Ban Giám đốc"].includes(d.name));
  const top = depts.find((d) => d.name === "Ban Giám đốc");

  const node = (d, cls = "") =>
    `<div class="org-node ${cls}"><b>${d.name}</b><span>${d.manager}</span><span>${d.headcount} nhân sự</span></div>`;

  const rows = depts
    .map(
      (d) => `<tr>
        <td><div class="emp-cell">${avatar({ code: d.name, fullName: d.manager })}<div><div>${d.name}</div><div class="emp-code">Phụ trách: ${d.manager}</div></div></div></td>
        <td class="num mono">${d.headcount}</td>
        <td class="num mono">${Math.round((d.headcount / totalHead) * 100)}%</td>
        <td><div class="progress-track"><div class="progress-fill" style="width:${Math.round((d.headcount / Math.max(...depts.map((x) => x.headcount))) * 100)}%"></div></div></td>
      </tr>`
    )
    .join("");

  return (
    pageTitle("Cơ cấu tổ chức", "Cơ cấu tổ chức", btn("Sơ đồ dạng cây", "sitemap") + btn("Thêm phòng ban", "building", "primary")) +
    `<div class="stat-strip" style="grid-template-columns:repeat(4,1fr)">
      <div class="mini-stat"><div class="k">Phòng ban</div><div class="v">${depts.length}</div></div>
      <div class="mini-stat"><div class="k">Tổng nhân sự</div><div class="v">${totalHead}</div></div>
      <div class="mini-stat"><div class="k">Chi nhánh</div><div class="v">2</div></div>
      <div class="mini-stat"><div class="k">Quản lý trực tiếp</div><div class="v">${depts.length}</div></div>
    </div>
    <div class="card">
      <div class="card-head"><div><div class="card-title">Sơ đồ tổ chức</div>
        <div class="card-sub">Công ty TNHH Giải pháp Minh Quang · cập nhật 01/10/2026</div></div>
        ${badge("Còn 5 vị trí trống", "amber")}</div>
      <div class="card-body">
        <div class="org">
          ${top ? node(top, "top") : ""}
          <div class="org-connector"></div>
          <div class="org-row">${mid.map((d) => node(d)).join("")}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Quy mô theo phòng ban</div></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Phòng ban</th><th class="num">Nhân sự</th><th class="num">Tỷ trọng</th><th>Mức độ</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>`
  );
};

/* ---------- 8. Quy trình đề xuất ---------- */
const screenProposals = () => {
  const rows = F.proposals
    .map(
      (p) => `<tr>
        <td class="mono">${p.id}</td>
        <td>${p.type}</td>
        <td><div class="emp-cell">${avatar({ code: p.requester, fullName: p.requester })}<div><div>${p.requester}</div><div class="emp-code">${p.department}</div></div></div></td>
        <td>${p.title}</td>
        <td>${p.currentStep}</td>
        <td class="mono">${p.submittedAt}</td>
        <td>${badge(p.status, statusTone(p.status))}</td>
      </tr>`
    )
    .join("");

  const count = (s) => F.proposals.filter((p) => p.status === s).length;
  const steps = ["Khởi tạo", "Trưởng phòng duyệt", "Nhân sự kiểm tra", "Phê duyệt", "Hoàn tất"];

  return (
    pageTitle("Quy trình đề xuất &amp; phê duyệt", "Quy trình đề xuất", btn("Cấu hình luồng", "flow") + btn("Tạo đề xuất", "flow", "primary")) +
    `<div class="stat-strip" style="grid-template-columns:repeat(4,1fr)">
      <div class="mini-stat"><div class="k">Tổng đề xuất</div><div class="v">${F.proposals.length}</div></div>
      <div class="mini-stat"><div class="k">Đang chờ duyệt</div><div class="v" style="color:#b45309">${count("Đang chờ duyệt")}</div></div>
      <div class="mini-stat"><div class="k">Đang xử lý</div><div class="v" style="color:#1d4ed8">${count("Đang xử lý")}</div></div>
      <div class="mini-stat"><div class="k">Đã duyệt</div><div class="v" style="color:#15803d">${count("Đã duyệt")}</div></div>
    </div>
    <div class="card">
      <div class="card-head"><div><div class="card-title">Luồng phê duyệt đề xuất tuyển dụng</div>
        <div class="card-sub">Có dấu vết từng bước — ai duyệt, lúc nào, ý kiến gì</div></div>
        ${badge("Đang áp dụng", "green")}</div>
      <div class="card-body">
        <div class="three-col">
          ${steps
            .map(
              (s, i) => `<div class="mini-stat" style="${i <= 2 ? "border-color:#bfdbfe;background:#eff6ff" : ""}">
                <div class="k">Bước ${i + 1}</div><div class="v" style="font-size:14px">${s}</div>
                <div class="sub" style="font-size:11.5px;color:var(--slate-500)">${["Người đề xuất", "Trưởng phòng", "Nhân sự", "Phó Giám đốc", "Hệ thống"][i]}</div>
              </div>`
            )
            .join("")}
        </div>
        <div class="note" style="margin-top:16px">${icon("flow")}
          <div>Đề xuất <b>PT-1023</b> (tăng lương) đi hết 5 bước trong <b>2 ngày</b> — người duyệt kế tiếp: <b>Phó Giám đốc</b>.</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Danh sách đề xuất</div>
        <a class="btn sm ghost" href="#">Lọc theo trạng thái</a></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Mã</th><th>Loại đề xuất</th><th>Người đề xuất</th><th>Nội dung</th>
          <th>Bước hiện tại</th><th>Ngày gửi</th><th>Trạng thái</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="table-foot"><span>Hiển thị <b>${F.proposals.length}</b> đề xuất gần nhất</span>
        <span class="pager"><button>‹</button><button class="on">1</button><button>›</button></span></div>
    </div>`
  );
};

/* ---------- 9. Tra cứu thông tin đội ngũ ---------- */
const screenDirectory = () => {
  const depts = [...new Set(F.employees.map((e) => e.department))];
  const cards = F.employees
    .map(
      (e) => `<div class="card card-body" style="text-align:center">
        <div class="profile-avatar" style="width:56px;height:56px;font-size:19px;background:${avColor(e.code)};margin:0 auto 12px">${e.initials}</div>
        <div style="font-size:14.5px;font-weight:600">${e.fullName}</div>
        <div style="font-size:12.5px;color:var(--slate-500);margin-top:3px">${e.position}</div>
        <div style="margin-top:10px">${badge(e.department, "blue")}</div>
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--slate-100);font-size:12.5px;color:var(--slate-600);display:flex;flex-direction:column;gap:5px">
          <span class="mono">${e.phone}</span><span>${e.email}</span><span>${e.branch}</span>
        </div>
      </div>`
    )
    .join("");

  return (
    pageTitle("Tra cứu thông tin đội ngũ", "Tra cứu đội ngũ", btn("Danh bạ nội bộ", "search") + btn("Xuất danh bạ", "wallet", "primary")) +
    `<div class="card"><div class="card-body">
      <div class="filters">
        <span class="chip-select">Phòng ban: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
        <span class="chip-select">Chi nhánh: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
        <span class="chip-select">Chức vụ: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
        <span class="search-inline">${icon("search", 'width="15" height="15"')}<span>Tìm theo tên, số điện thoại, email…</span></span>
        <span class="filters-right"><span class="sub">${F.employees.length} / 186 nhân sự</span></span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
        ${depts.map((d, i) => `<span class="chip-select" style="${i === 0 ? "border-color:#1d4ed8;color:#1d4ed8;background:#eff6ff" : ""}">${d}</span>`).join("")}
      </div>
    </div></div>
    <div class="three-col" style="grid-template-columns:repeat(4,1fr)">${cards}</div>`
  );
};

/* ---------- 10. Tuyển dụng — pipeline ứng viên ---------- */
const screenRecruitment = () => {
  const cols = F.recruitmentPipeline;
  const totalCandidates = cols.reduce((s, c) => s + c.total, 0);
  const tagTone = (tag) =>
    ({ "Mới": "slate", "Đạt CV": "green", "Chờ test": "amber", "Đã hẹn": "blue", "Chờ xác nhận": "amber",
       "Chờ phản hồi": "amber", "Đã nhận lời": "green", "Đã ký HĐ thử việc": "violet" }[tag] || "slate");

  const columns = cols
    .map(
      (c, i) => `<div class="kanban-col">
        <div class="kanban-head"><span class="kanban-step">${i + 1}</span>${c.stage}<b>${c.total}</b></div>
        ${c.cards
          .map(
            (k) => `<div class="kanban-card">
              <div class="emp-cell">${avatar({ code: k.fullName, fullName: k.fullName, initials: k.fullName.split(" ").pop()[0] + k.fullName[0] }, 30)}
                <div><div class="kc-name">${k.fullName}</div><div class="emp-code">${k.position}</div></div></div>
              <div class="kc-meta"><span>${k.source}</span><span class="mono">${k.note}</span></div>
              <div>${badge(k.tag, tagTone(k.tag))}</div>
            </div>`
          )
          .join("")}
        ${c.total > c.cards.length ? `<div class="kanban-more">+ ${c.total - c.cards.length} ứng viên khác</div>` : ""}
      </div>`
    )
    .join("");

  return (
    pageTitle("Tuyển dụng", "Tuyển dụng / Pipeline ứng viên", btn("Tin tuyển dụng", "briefcase") + btn("Thêm ứng viên", "userPlus", "primary")) +
    `<div class="stat-strip" style="grid-template-columns:repeat(4,1fr)">
      <div class="mini-stat"><div class="k">Vị trí đang mở</div><div class="v">${F.recruiting.length}</div></div>
      <div class="mini-stat"><div class="k">Chỉ tiêu tuyển</div><div class="v">${F.headcount.recruiting}</div></div>
      <div class="mini-stat"><div class="k">Ứng viên trong pipeline</div><div class="v">${totalCandidates}</div></div>
      <div class="mini-stat"><div class="k">Lịch phỏng vấn tuần này</div><div class="v" style="color:#1d4ed8">6</div></div>
    </div>
    <div class="card">
      <div class="card-head"><div><div class="card-title">Pipeline ứng viên theo vòng</div>
        <div class="card-sub">Đợt tuyển dụng Quý IV/2026 · cập nhật 10/10/2026</div></div>
        <span class="chip-select">Vị trí: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span></div>
      <div class="card-body"><div class="kanban">${columns}</div></div>
    </div>`
  );
};

/* ---------- 11. Hợp đồng lao động ---------- */
const screenContracts = () => {
  const S = F.contractSummary;
  const leftTone = (d) => (d <= 15 ? "red" : d <= 30 ? "amber" : "slate");
  // Chỉ hiện hợp đồng khớp bộ lọc "Hết hạn trong: 60 ngày" → số dòng = thẻ "Hết hạn ≤ 60 ngày".
  const rows = F.contracts
    .filter((c) => c.daysLeft <= 60)
    .map(
      (c) => `<tr>
        <td><div class="emp-cell">${avatar({ code: c.number, fullName: c.fullName, initials: c.fullName.split(" ").pop()[0] + c.fullName[0] })}<div><div>${c.fullName}</div><div class="emp-code">${c.department}</div></div></div></td>
        <td>${c.type}</td>
        <td class="mono">${c.number}</td>
        <td class="num mono">${c.startDate}</td>
        <td class="num mono">${c.endDate}</td>
        <td class="num">${badge(`Còn ${c.daysLeft} ngày`, leftTone(c.daysLeft))}</td>
        <td>${badge(c.status, statusTone(c.status))}</td>
      </tr>`
    )
    .join("");

  return (
    pageTitle("Hợp đồng lao động", "Hợp đồng lao động / Sắp hết hạn", btn("Mẫu hợp đồng", "file") + btn("Gia hạn hàng loạt", "check", "primary")) +
    `<div class="stat-strip" style="grid-template-columns:repeat(6,1fr)">
      <div class="mini-stat"><div class="k">Đang hiệu lực</div><div class="v">${S.active}</div></div>
      <div class="mini-stat"><div class="k">Không thời hạn</div><div class="v">${S.indefinite}</div></div>
      <div class="mini-stat"><div class="k">XĐ thời hạn</div><div class="v">${S.fixedTerm}</div></div>
      <div class="mini-stat"><div class="k">Thử việc</div><div class="v">${S.probation}</div></div>
      <div class="mini-stat"><div class="k">Hết hạn ≤ 30 ngày</div><div class="v" style="color:#b91c1c">${S.expiring30}</div></div>
      <div class="mini-stat"><div class="k">Hết hạn ≤ 60 ngày</div><div class="v" style="color:#b45309">${S.expiring60}</div></div>
    </div>
    <div class="card">
      <div class="card-head"><div><div class="card-title">Hợp đồng sắp hết hạn / chờ gia hạn</div>
        <div class="card-sub">Tính đến 10/10/2026 · nhắc trước 60 ngày cho quản lý trực tiếp và phòng Nhân sự</div></div>
        ${badge(`${S.expiring30} hợp đồng cần xử lý trong tháng`, "red")}</div>
      <div class="card-body" style="padding-bottom:14px"><div class="filters">
        <span class="chip-select">Loại hợp đồng: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
        <span class="chip-select">Hết hạn trong: 60 ngày ${icon("grid", 'width="13" height="13" class="chev"')}</span>
        <span class="chip-select">Phòng ban: Tất cả ${icon("grid", 'width="13" height="13" class="chev"')}</span>
        <span class="search-inline">${icon("search", 'width="15" height="15"')}<span>Tìm theo tên hoặc số hợp đồng…</span></span>
      </div></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Nhân sự</th><th>Loại hợp đồng</th><th>Số HĐ</th><th class="num">Hiệu lực</th>
            <th class="num">Hết hạn</th><th class="num">Còn lại</th><th>Trạng thái</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="table-foot"><span>Hiển thị <b>${S.expiring60}</b> hợp đồng hết hạn trong 60 ngày tới</span>
        <span class="pager"><button>‹</button><button class="on">1</button><button>›</button></span></div>
    </div>`
  );
};

/* ---------- 12. Đánh giá KPI ---------- */
const screenKpi = () => {
  const K = F.kpi;
  const gradeTone = { A: "green", B: "blue", C: "amber", D: "red" };
  const totalPeople = K.distribution.reduce((s, d) => s + d.count, 0);
  const done = K.progress.reduce((s, p) => s + p.done, 0);
  const reviews = [...K.reviews].sort((a, b) => b.total - a.total);

  const rows = reviews
    .map(
      (r) => `<tr>
        <td><div class="emp-cell">${avatar({ code: r.fullName, fullName: r.fullName, initials: r.fullName.split(" ").pop()[0] + r.fullName[0] })}<div><div>${r.fullName}</div><div class="emp-code">${r.department}</div></div></div></td>
        <td style="width:180px"><div class="kpi-target"><div class="progress-track"><div class="progress-fill" style="width:${Math.min(r.targetPct, 100)}%;${r.targetPct < 80 ? "background:#d97706" : ""}"></div></div><span class="mono">${r.targetPct}%</span></div></td>
        <td class="num mono">${r.kpiScore}</td>
        <td class="num mono">${r.skillScore}</td>
        <td class="num mono"><b>${r.total.toLocaleString("vi-VN")}</b></td>
        <td>${badge(`Loại ${r.grade}`, gradeTone[r.grade])}</td>
        <td>${badge(r.status, statusTone(r.status))}</td>
      </tr>`
    )
    .join("");

  const dist = K.distribution
    .map(
      (d) => `<div class="dist-row"><span class="dist-grade ${gradeTone[d.grade]}">${d.grade}</span>
        <div class="grow"><div class="dist-label">${d.label}<b>${d.count} người · ${Math.round((d.count / totalPeople) * 100)}%</b></div>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.round((d.count / totalPeople) * 100)}%"></div></div></div></div>`
    )
    .join("");

  const prog = K.progress
    .map(
      (p) => `<div class="dist-row"><div class="grow"><div class="dist-label">${p.department}<b>${p.done}/${p.total}</b></div>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.round((p.done / p.total) * 100)}%;${p.done === p.total ? "background:#16a34a" : ""}"></div></div></div></div>`
    )
    .join("");

  return (
    pageTitle(`Đánh giá hiệu suất — ${K.period}`, "Đánh giá KPI / " + K.period, btn("Bộ tiêu chí", "target") + btn("Chốt kỳ đánh giá", "check", "primary")) +
    `<div class="stat-strip" style="grid-template-columns:repeat(4,1fr)">
      <div class="mini-stat"><div class="k">Nhân sự trong kỳ</div><div class="v">${totalPeople}</div></div>
      <div class="mini-stat"><div class="k">Đã hoàn tất đánh giá</div><div class="v" style="color:#15803d">${done}</div></div>
      <div class="mini-stat"><div class="k">Điểm trung bình</div><div class="v">82,4</div></div>
      <div class="mini-stat"><div class="k">Hạn chốt kỳ</div><div class="v">20/10/2026</div></div>
    </div>
    <div class="two-col" style="grid-template-columns:1fr 1fr">
      <div class="card">
        <div class="card-head"><div><div class="card-title">Phân bố xếp loại</div>
          <div class="card-sub">Toàn công ty · KPI 70% + năng lực 30%</div></div></div>
        <div class="card-body dist">${dist}</div>
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">Tiến độ đánh giá theo phòng ban</div>
          <div class="card-sub">Số phiếu đã chốt / tổng nhân sự</div></div>${badge("Còn 10 ngày", "amber")}</div>
        <div class="card-body dist">${prog}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Kết quả đánh giá cá nhân</div>
        <a class="btn sm ghost" href="#">Xuất bảng điểm</a></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Nhân sự</th><th>Hoàn thành mục tiêu</th><th class="num">Điểm KPI</th><th class="num">Năng lực</th>
          <th class="num">Tổng điểm</th><th>Xếp loại</th><th>Trạng thái</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="table-foot"><span>Hiển thị <b>${reviews.length}</b> / ${totalPeople} nhân sự</span>
        <span class="pager"><button>‹</button><button class="on">1</button><button>2</button><button>…</button><button>19</button><button>›</button></span></div>
    </div>`
  );
};

/* ---------- 13. Báo cáo biến động nhân sự ---------- */
const screenTurnover = () => {
  const T = F.turnover;
  const maxVal = Math.max(...T.months.map((m) => Math.max(m.joined, m.left)));
  const bars = T.months
    .map(
      (m) => `<div class="gbar">
        <div class="gbar-pair">
          <span class="gbar-join" style="height:${Math.round((m.joined / maxVal) * 150)}px"><i>${m.joined}</i></span>
          <span class="gbar-leave" style="height:${Math.round((m.left / maxVal) * 150)}px"><i>${m.left}</i></span>
        </div>
        <span class="bar-label">${m.month}</span>
      </div>`
    )
    .join("");
  const maxReason = Math.max(...T.reasons.map((r) => r.count));
  const reasons = T.reasons
    .map(
      (r) => `<div class="dist-row"><div class="grow"><div class="dist-label">${r.reason}<b>${r.count}</b></div>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.round((r.count / maxReason) * 100)}%;background:#94a3b8"></div></div></div></div>`
    )
    .join("");
  const rows = T.byDepartment
    .map(
      (d) => `<tr>
        <td>${d.name}</td>
        <td class="num mono">${d.headcount}</td>
        <td class="num mono" style="color:#15803d">+${d.joined}</td>
        <td class="num mono" style="color:#b91c1c">${d.left ? "−" + d.left : "0"}</td>
        <td class="num mono">${d.joined - d.left >= 0 ? "+" : "−"}${Math.abs(d.joined - d.left)}</td>
        <td class="num">${badge(`${d.rate.toLocaleString("vi-VN")}%`, d.rate >= 15 ? "red" : d.rate >= 10 ? "amber" : "green")}</td>
      </tr>`
    )
    .join("");

  return (
    pageTitle("Báo cáo biến động nhân sự", "Báo cáo / Biến động nhân sự", btn(T.period, "calendar") + btn("Xuất báo cáo", "wallet", "primary")) +
    `<div class="kpi-grid">
      <div class="card kpi"><div><div class="kpi-label">Nhân sự hiện tại</div><div class="kpi-value">${F.headcount.total}</div>
        <div class="kpi-hint">Tính đến 30/09/2026</div></div><span class="kpi-icon">${icon("users")}</span></div>
      <div class="card kpi"><div><div class="kpi-label">Tuyển mới</div><div class="kpi-value">${T.joined}</div>
        <div class="kpi-hint">${T.period}</div></div><span class="kpi-icon green">${icon("userPlus")}</span></div>
      <div class="card kpi"><div><div class="kpi-label">Nghỉ việc</div><div class="kpi-value">${T.left}</div>
        <div class="kpi-hint">Tăng ròng +${T.net} nhân sự</div></div><span class="kpi-icon amber">${icon("report")}</span></div>
      <div class="card kpi"><div><div class="kpi-label">Tỷ lệ nghỉ việc</div><div class="kpi-value">${T.rate.toLocaleString("vi-VN")}%</div>
        <div class="kpi-hint">Trên nhân sự bình quân 9 tháng</div></div><span class="kpi-icon violet">${icon("trend")}</span></div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="card-head"><div><div class="card-title">Tuyển mới và nghỉ việc theo tháng</div>
          <div class="card-sub">${T.period} · số người</div></div>${badge("9 tháng", "slate")}</div>
        <div class="card-body">
          <div class="legend"><span><i class="dotc" style="background:#134cc9"></i>Tuyển mới</span>
            <span><i class="dotc" style="background:#f59e0b"></i>Nghỉ việc</span></div>
          <div class="gbars">${bars}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">Lý do nghỉ việc</div>
          <div class="card-sub">Theo phỏng vấn thôi việc · ${T.left} trường hợp</div></div></div>
        <div class="card-body dist">${reasons}
          <div class="note" style="margin-top:4px">${icon("trend")}
            <div>Phòng <b>Chăm sóc khách hàng</b> có tỷ lệ nghỉ việc cao nhất — đề xuất rà soát chế độ ca kíp.</div></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Biến động theo phòng ban</div>
        <a class="btn sm ghost" href="#">Xem chi tiết</a></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Phòng ban</th><th class="num">Nhân sự</th><th class="num">Tuyển mới</th><th class="num">Nghỉ việc</th>
          <th class="num">Tăng ròng</th><th class="num">Tỷ lệ nghỉ việc</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>`
  );
};

/* ---------- render ---------- */
const SCREENS = {
  overview: screenOverview,
  employees: screenEmployees,
  "employee-detail": screenEmployeeDetail,
  attendance: screenAttendance,
  payroll: screenPayroll,
  leave: screenLeave,
  org: screenOrg,
  proposals: screenProposals,
  directory: screenDirectory,
  recruitment: screenRecruitment,
  contracts: screenContracts,
  kpi: screenKpi,
  turnover: screenTurnover,
};

const render = SCREENS[SCREEN] || SCREENS.overview;
document.getElementById("stage").innerHTML = render();
document.title = `NTA HRM · ${SCREEN}`;
window.__READY__ = true;
