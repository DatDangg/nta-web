/**
 * build-crm-fixture.mjs — sinh dữ liệu giả cho các màn hình CRM (Dragon Hotpot CMS).
 *
 * Chạy: node scripts/screenshots/build-crm-fixture.mjs
 * Ra:   scripts/screenshots/fixtures/crm.json
 *
 * Cấu trúc bám đúng API thật đã đo:
 * - customers:  {data:[{id, fullName, phone, loyaltyTier{code,nameVi}, stats{visitCount,lastVisitAt}, zalo{linked,followsOA}}], page, pageSize, total, totalPages}
 * - customerDetail: {..., loyalty{pointsBalance, nextTier, vndToNextTier, recentTransactions[]}, recentVisits[], recentOrders[], totalSpendVnd, orderCount, visitTotalCount}
 * - visits:    {data:[{id, guestName, partySize, reservedFor, status, branch{name}}], page, pageSize, total}
 * - orders:    {data:[{id, code, status, orderedAt, totalVnd, items[{productName, quantity, unitPriceVnd}], branch{name}}]}
 * - dashboard: {totalCustomers, today{...}, byBranch[], growth[], upcomingBirthdays[], lapsedList[]}
 */
import fs from "node:fs";
import path from "node:path";

/* ---------- họ tên giả đa dạng ---------- */
const NAM = ["Trần Quốc Khánh", "Nguyễn Thị Hồng Nhung", "Lê Văn Hùng", "Phạm Minh Châu", "Vũ Đình Hải",
  "Đặng Thu Hà", "Bùi Tiến Dũng", "Hoàng Lan Anh", "Đỗ Thị Thanh Hà", "Ngô Hải Yến",
  "Dương Thu Thảo", "Lý Hoàng Nam", "Võ Trí Dũng", "Trịnh Bích Phượng", "Phan Hữu Phước", "Mai Tuấn Kiệt"];
const NU = ["Trần Thị Bích Ngọc", "Nguyễn Thu Trang", "Lê Thị Mai Anh", "Phạm Khánh Linh", "Vũ Bảo Ngọc",
  "Đặng Thị Lan", "Bùi Ngọc Ánh", "Hoàng Thu Thảo", "Đỗ Hải Yến", "Ngô Thanh Mai"];

/* ---------- branches ---------- */
const BRANCHES = [
  { id: "br1", name: "Hồng Phúc Nướng & Lẩu – Cao Thắng" },
  { id: "br2", name: "Hồng Phúc Nướng & Lẩu – Trần Quang Khải" },
  { id: "br3", name: "Hồng Phúc Nướng & Lẩu – Thảo Điền" },
].map((b, i) => ({
  ...b,
  address: ["Số 19 đường Cao Thắng, phường 5, quận 3, TP. Hồ Chí Minh",
            "Số 88 Trần Quang Khải, phường Tân Định, quận 1, TP. Hồ Chí Minh",
            "Số 42 Nguyễn Ư Dĩ, phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"][i],
  phone: ["028 7300 1901", "028 7300 1902", "028 7300 1903"][i],
  isActive: true,
  cukcukBranchId: `ck${1000 + i}`,
  cukcukBranchCode: `CS${i + 1}`,
  createdAt: "2026-01-05T03:00:00.000Z",
  updatedAt: "2026-09-01T03:00:00.000Z",
  hours: [],
  isOpenNow: true,
}));

/* ---------- customers ---------- */
const TIERS = [
  { code: "MEMBER", nameVi: "Thành Viên", rank: 0 },
  { code: "GOLD", nameVi: "Vàng", rank: 1 },
  { code: "PLATINUM", nameVi: "Bạch Kim", rank: 2 },
];
const fmtPhone = (i) => `09${12 + (i % 8)} *** ${String(100 + i * 17).slice(-3)}`;

const pick = (arr, i) => arr[i % arr.length];
const dob = (i) => `19${80 + (i % 22)}-0${1 + (i % 9)}-${String(3 + (i * 2) % 25).padStart(2, "0")}`;
const pad2 = (n) => String(n).padStart(2, "0");

const customers = Array.from({ length: 12 }, (_, i) => {
  const isMale = i % 2 === 0;
  const fullName = i < 8 ? pick(NAM, i) : pick(NU, i - 8);
  const tier = TIERS[i % 3];
  const visits = 2 + ((i * 5) % 21);
  const spend = 300_000 + visits * (150_000 + (i % 5) * 90_000);
  const lastVisit = `2026-${pad2(8 + (i % 3))}-${pad2(2 + (i * 3) % 26)}T${pad2(10 + (i % 10))}:20:00.000Z`;
  return {
    id: `cus_${String(i + 1).padStart(3, "0")}`,
    fullName,
    phone: `+84${fmtPhone(i).replace(/\s/g, "")}`,
    dob: i % 4 === 0 ? dob(i) : null,
    gender: isMale ? "MALE" : "FEMALE",
    email: i % 3 === 0 ? `${isMale ? "anh" : "chi"}${i + 1}@example.com` : null,
    address: i % 3 === 1 ? `Số ${12 + i} đường Cao Thắng, phường 5, quận 3, TP. Hồ Chí Minh` : null,
    source: i % 5 === 0 ? "WALK_IN" : "CUKCUK",
    loyaltyTier: tier,
    loyaltyTierId: tier.code,
    loyaltyTierSince: "2026-06-01T00:00:00.000Z",
    loyaltyTierEvaluatedAt: "2026-09-01T00:00:00.000Z",
    tags: [],
    favoriteDishes: [],
    favoriteFlavors: [],
    favoriteToppings: [],
    notes: null,
    district: i % 3 === 1 ? "Quận 3" : null,
    city: i % 3 === 1 ? "TP. Hồ Chí Minh" : null,
    originBranchId: BRANCHES[i % 3].id,
    cukcukCustomerCode: `CK${2000 + i}`,
    cukcukSyncedAt: "2026-09-30T02:00:00.000Z",
    updatedAt: "2026-10-01T02:00:00.000Z",
    stats: { visitCount: visits, lastVisitAt: lastVisit },
    zalo: {
      linked: i % 3 !== 1,
      followsOA: i % 3 === 0,
      hasPushAddress: i % 4 === 0,
    },
    isBlacklisted: false,
    createdAt: `2026-${pad2(5 + (i % 5))}-${pad2(10 + (i % 10))}T08:00:00.000Z`,
  };
});

/* ---------- 1 khách hàng chi tiết ---------- */
const detailCustomer = customers[1];
const dVisits = [
  { id: "v1", status: "COMPLETED", visitCode: "LH-0912", partySize: 4, reservedFor: "2026-10-03T11:30:00.000Z", visitedAt: "2026-10-03T11:30:00.000Z", checkedInAt: "2026-10-03T11:30:00.000Z", totalSpendVnd: 1_250_000, notes: null, branchId: BRANCHES[0].id, branch: BRANCHES[0] },
  { id: "v2", status: "COMPLETED", visitCode: "LH-0884", partySize: 2, reservedFor: "2026-09-20T18:10:00.000Z", visitedAt: "2026-09-20T18:10:00.000Z", checkedInAt: "2026-09-20T18:10:00.000Z", totalSpendVnd: 686_000, notes: null, branchId: BRANCHES[1].id, branch: BRANCHES[1] },
  { id: "v3", status: "COMPLETED", visitCode: "LH-0801", partySize: 6, reservedFor: "2026-08-16T12:05:00.000Z", visitedAt: "2026-08-16T12:05:00.000Z", checkedInAt: "2026-08-16T12:05:00.000Z", totalSpendVnd: 2_140_000, notes: null, branchId: BRANCHES[0].id, branch: BRANCHES[0] },
];
const dOrders = [
  { id: "o1", code: "HP-10248", status: "PAID", orderedAt: "2026-10-03T11:30:00.000Z", totalVnd: 1_250_000, items: [{ productName: "Set lẩu Thái chua cay (2 người)", quantity: 2, unitPriceVnd: 429_000 }] },
  { id: "o2", code: "HP-09912", status: "PAID", orderedAt: "2026-09-20T18:10:00.000Z", totalVnd: 686_000, items: [{ productName: "Set lẩu Malay cho 1 người", quantity: 2, unitPriceVnd: 245_000 }] },
  { id: "o3", code: "HP-09755", status: "CANCELLED", orderedAt: "2026-08-16T12:05:00.000Z", totalVnd: 2_140_000, items: [{ productName: "Set tiệc lẩu 6 người", quantity: 1, unitPriceVnd: 2_140_000 }] },
];
const dTxns = [
  { id: "t1", type: "EARN", points: 1520, createdAt: "2026-10-03T12:00:00.000Z", note: "Tích điểm đơn HP-10248" },
  { id: "t2", type: "REDEEM", points: -500, createdAt: "2026-09-20T19:00:00.000Z", note: "Đổi tráng miệng" },
  { id: "t3", type: "EARN", points: 680, createdAt: "2026-08-16T13:00:00.000Z", note: "Tích điểm đơn HP-09755" },
];

const customerDetail = {
  ...detailCustomer,
  orderCount: dOrders.length,
  visitTotalCount: dVisits.length,
  totalSpendVnd: dOrders.filter((o) => o.status === "PAID").reduce((s, o) => s + o.totalVnd, 0),
  openComplaints: 0,
  feedbackCount: 1,
  careNoteCount: 3,
  loyalty: {
    pointsBalance: 1700,
    eligibleSpendVnd: dOrders[0].totalVnd,
    loyaltyTier: TIERS[1],
    loyaltyTierSince: "2026-09-01T00:00:00.000Z",
    nextTier: TIERS[2],
    vndToNextTier: 5_000_000,
    expiringSoonPoints: 0,
    recentTransactions: dTxns,
  },
  recentVisits: dVisits,
  recentOrders: dOrders,
  recentFeedback: [{ id: "f1", kind: "PRAISE", rating: 5, content: "Nhân viên nhiệt tình, nước lẩu đậm đà, sẽ quay lại.", createdAt: "2026-10-03T12:30:00.000Z" }],
};

/* ---------- reservations (visits) — bám schema thật của GET /api/visits ---------- */
const RES_STATUS = ["RESERVED", "RESERVED", "SEATED", "RESERVED", "COMPLETED", "RESERVED", "NO_SHOW", "RESERVED", "COMPLETED", "RESERVED"];
const RES_TIME = ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
const reservations = Array.from({ length: 10 }, (_, i) => {
  const status = RES_STATUS[i % RES_STATUS.length];
  const branch = BRANCHES[i % 3];
  const reservedFor = `2026-10-${pad2(14 + i)}T${RES_TIME[i % RES_TIME.length]}:00.000Z`;
  return {
    id: `res_${String(i + 1).padStart(3, "0")}`,
    customerId: i % 2 === 0 ? customers[i].id : null,
    guestName: i < 6 ? pick(NAM, i + 1) : pick(NU, i),
    guestPhone: i % 3 === 0 ? fmtPhone(i + 2) : null,
    branchId: branch.id,
    status,
    reservedFor,
    visitedAt: ["SEATED", "COMPLETED"].includes(status) ? reservedFor : null,
    partySize: 2 + (i % 6),
    notes: i === 2 ? "Khách yêu cầu bàn gần cửa sổ" : null,
    createdById: "usr_001",
    deletedAt: null,
    orderId: null,
    createdAt: `2026-10-${pad2(10 + (i % 4))}T09:${pad2(15 + i)}:00.000Z`,
    updatedAt: `2026-10-${pad2(12 + (i % 4))}T11:${pad2(20 + i)}:00.000Z`,
    branch,
    customer: {
      id: customers[i].id,
      fullName: customers[i].fullName,
      phone: customers[i].phone,
      favoriteDishes: [],
      favoriteFlavors: [],
      favoriteToppings: [],
      visitCount: customers[i].stats.visitCount,
    },
    order: null,
  };
});

/* ---------- orders ---------- */
const MENU = [
  ["Set lẩu Thái chua cay (2 người)", 429_000],
  ["Set lẩu Malay cho 1 người", 245_000],
  ["Bò Mỹ tảng (200g)", 189_000],
  ["Bắp bò Hàn Quốc (150g)", 169_000],
  ["Nấm đùi gà", 45_000],
  ["Rau muống xào tỏi", 65_000],
  ["Đậu phụ non chiên", 39_000],
  ["Trà chanh pha sẵn", 35_000],
  ["Chè khúc bạch", 45_000],
];
const ORDER_STATUS = ["PAID", "PAYMENT_REQUESTED", "PAID", "CANCELLED", "SERVING", "PAID", "DELIVERED"];
const ORDER_CHANNEL = ["CUKCUK", "POS", "IN_STORE", "CUKCUK", "CALL", "POS", "CUKCUK", "OTHER", "CUKCUK", "POS", "CUKCUK", "IN_STORE"];
const orders = Array.from({ length: 12 }, (_, i) => {
  const itemCount = 2 + (i % 3);
  const items = [];
  for (let k = 0; k < itemCount; k++) {
    const [productName, unitPriceVnd] = MENU[(i * 3 + k) % MENU.length];
    const quantity = 1 + ((i + k) % 2);
    items.push({ id: `oi${i}_${k}`, productName, quantity, unitPriceVnd, lineTotalVnd: quantity * unitPriceVnd });
  }
  const subtotalVnd = items.reduce((s, it) => s + it.lineTotalVnd, 0);
  const discountVnd = i === 3 ? 50_000 : 0;
  return {
    id: `ord_${String(i + 1).padStart(3, "0")}`,
    code: `HP-10${String(247 + i)}`,
    customerId: i % 3 === 0 ? customers[i].id : null,
    branchId: BRANCHES[i % 3].id,
    branch: BRANCHES[i % 3],
    channel: ORDER_CHANNEL[i],
    cukcukServiceType: i % 3 === 0 ? "TAKEAWAY" : "DINE_IN",
    status: ORDER_STATUS[i % ORDER_STATUS.length],
    orderedAt: `2026-10-${pad2(2 + i)}T${pad2(10 + (i % 10))}:${pad2(10 + i * 2)}:00.000Z`,
    guestCount: 1 + (i % 5),
    subtotalVnd, discountVnd, totalVnd: subtotalVnd - discountVnd, voucherDiscountVnd: 0,
    note: i === 5 ? "Khách báo trước 30 phút" : null,
    loyaltyExcluded: false,
    itemsSyncDirty: false,
    createdById: "usr_001",
    deletedAt: null,
    createdAt: `2026-10-${pad2(2 + i)}T${pad2(10 + (i % 10))}:${pad2(10 + i * 2)}:00.000Z`,
    updatedAt: `2026-10-${pad2(2 + i)}T${pad2(11 + (i % 10))}:${pad2(20 + i * 2)}:00.000Z`,
    items,
    customer: i % 3 === 0 ? { id: customers[i].id, fullName: customers[i].fullName } : null,
  };
});

/* ---------- dashboard summary ---------- */
const growth = [
  { weekStart: "2026-08-16", count: 24 }, { weekStart: "2026-08-23", count: 42 },
  { weekStart: "2026-08-30", count: 31 }, { weekStart: "2026-09-06", count: 20 },
  { weekStart: "2026-09-13", count: 16 }, { weekStart: "2026-09-20", count: 9 },
  { weekStart: "2026-09-27", count: 12 }, { weekStart: "2026-10-04", count: 18 },
];
const upcomingBirthdays = [
  { id: customers[2].id, fullName: customers[2].fullName, dob: "1996-10-11", daysUntil: 1, turningAge: 30 },
  { id: customers[4].id, fullName: customers[4].fullName, dob: "1991-10-12", daysUntil: 2, turningAge: 35 },
  { id: customers[6].id, fullName: customers[6].fullName, dob: "1988-10-14", daysUntil: 4, turningAge: 38 },
  { id: customers[8].id, fullName: customers[8].fullName, dob: "1998-10-15", daysUntil: 5, turningAge: 28 },
  { id: customers[10].id, fullName: customers[10].fullName, dob: "1993-10-16", daysUntil: 6, turningAge: 33 },
];
const lapsedList = [
  { id: customers[1].id, fullName: customers[1].fullName, daysSince: 68, lastVisitAt: "2026-08-03T10:58:34.423Z" },
  { id: customers[3].id, fullName: customers[3].fullName, daysSince: 64, lastVisitAt: "2026-08-07T18:06:13.172Z" },
  { id: customers[5].id, fullName: customers[5].fullName, daysSince: 61, lastVisitAt: "2026-08-10T09:52:08.529Z" },
];
const dashboard = {
  totalCustomers: 1286,
  newThisWeek: 18,
  newThisMonth: 26,
  genderBreakdown: [{ gender: "MALE", count: 620 }, { gender: "FEMALE", count: 651 }, { gender: "OTHER", count: 3 }, { gender: "UNKNOWN", count: 12 }],
  byBranch: BRANCHES.map((b, i) => ({ branchId: b.id, branchName: b.name, count: [742, 381, 163][i] })),
  growth,
  upcomingBirthdays,
  birthdaysThisMonth: 236,
  returningCustomers: 96,
  lapsedCustomers: 24,
  lapsedDays: 60,
  lapsedList,
  reservationsToday: 4,
  reservationsUpcoming: 10,
  upcomingReservations: reservations.filter((r) => r.status === "RESERVED").slice(0, 4),
  openComplaints: 2,
  complaintsThisMonth: 3,
  guestsToday: 128,
  ordersToday: 86,
  revenueTodayVnd: 44_854_864,
  generatedAt: "2026-10-11T10:00:00.000Z",
};

const fixture = {
  meta: {
    chain: "Hồng Phúc Nướng & Lẩu",
    loggedInUser: "Trần Quốc Khánh",
    note: "Dữ liệu giả để chụp ảnh minh hoạ trang giải pháp CRM.",
  },
  branches: BRANCHES,
  customers,
  customerDetail,
  reservations,
  orders,
  dashboard,
};

const out = path.resolve("scripts/screenshots/fixtures/crm.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(fixture, null, 2));
console.log("wrote", out, "| customers:", customers.length, "| orders:", orders.length);
