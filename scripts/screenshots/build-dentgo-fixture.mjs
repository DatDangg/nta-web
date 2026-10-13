/**
 * build-dentgo-fixture.mjs — sinh dữ liệu giả cho các màn hình DentGo Smile.
 *
 * Chạy: node scripts/screenshots/build-dentgo-fixture.mjs
 * Ra:   scripts/screenshots/fixtures/dentgo.json
 *
 * Cấu trúc bám đúng API thật đã đo lại ngày 2026-10-11 (xem README §maintain):
 * - POST /auth/login/password  → đăng nhập thật (KHÔNG chặn)
 * - GET  /auth/me              → {user, permissionOverrides, effectiveModules, effectiveFeatures, effectiveActionPermissions, rolePermissionsConfigured}
 * - GET  /admin/branches       → {branches:[{id, code, name, address, phone, isActive, defaultConsumptionWarehouseId, ...}]}
 * - GET  /subscription/current → {subscription:{...}}
 * - GET  /zalo/conversations   → {conversations:[]}
 * - GET  /support/conversation/unread-count → {unreadCount:0}
 * - GET  /appointments/options → {branches, services, doctors}
 * - GET  /appointments?date|?fromDate&toDate → {appointments:[{id, patientDisplayName, startsAt, endsAt, status, branch{}, patientProfile{}, doctorProfile{}, ...}]}
 * - GET  /visits?date          → {visits:[{id, appointmentId, status, emrStatus, appointment{}, ...}]}
 * - GET  /dashboard/financial-summary?date → {branchId, date, serviceTotalVnd, collectedTotalVnd, invoiceCount, updatedAt}
 * - GET  /patients?visitDate&page&pageSize → {patients:[{...patient, currentVisit{}, medicalInfo{}, totalDebtVnd, paymentStatus}], pagination:{page,pageSize,total,totalPages}}
 * - GET  /patients/{id}/visits → {patientProfile, visits:[], appointments:[]}
 * - GET  /clinical/patients/{id}/dental-record?branchId  → {record:{...odontogram}|null}
 * - GET  /clinical/patients/{id}/dental-records?branchId → {records:[]}
 * - GET  /inventory/items      → {items:[{id, sku, name, type, unit, lowStockThreshold, branch{}, batches:[]}]}
 */
import fs from "node:fs";
import path from "node:path";

/* ---------- id giả nhưng đúng dạng UUID (app/route có thể validate) ---------- */
let _c = 0;
const hex = (v, l) => Math.abs(Math.trunc(v)).toString(16).padStart(l, "0").slice(-l);
const uid = () => {
  _c++;
  return `${hex(_c * 2654435761, 8)}-${hex(_c * 40503, 4)}-4${hex(_c * 2246822519, 3)}-8${hex(_c * 3266489917, 3)}-${hex(_c * 668265263, 12)}`;
};
const iso = (d, t = "08:00:00") => `${d}T${t}.000Z`;

/* ---------- tên giả ---------- */
const BN = [
  ["Nguyễn Thị Lan Hương", "Nữ", 1994], ["Trần Văn Bình", "Nam", 1988],
  ["Phạm Thị Thuý", "Nữ", 1991], ["Lê Quang Hải", "Nam", 1985],
  ["Vũ Thị Nhung", "Nữ", 1996], ["Hoàng Anh Tuấn", "Nam", 1993],
  ["Đỗ Thị Mai", "Nữ", 1990], ["Ngô Văn Thành", "Nam", 1987],
  ["Bùi Thị Thanh Tâm", "Nữ", 1998], ["Đặng Hữu Nghị", "Nam", 1983],
  ["Lý Thị Bích Ngọc", "Nữ", 1995], ["Phan Thành Trung", "Nam", 1992],
];
const DOCTOR_NAMES = ["BS. Nguyễn Hoài An", "BS. Trần Minh Khoa", "BS. Lê Thu Trang"];

/* ---------- chi nhánh ---------- */
const BRANCHES = [
  { id: uid(), code: "MINTAM-HN", name: "Nha khoa Minh Tâm – Trần Duy Hưng", address: "Số 12 Trần Duy Hưng, Cầu Giấy, Hà Nội", phone: "024 7300 0001" },
  { id: uid(), code: "MINTAM-NT", name: "Nha khoa Minh Tâm – Nguyễn Trãi", address: "Số 245 Nguyễn Trãi, Thanh Xuân, Hà Nội", phone: "024 7300 0002" },
].map((b) => ({
  ...b,
  isActive: true,
  createdAt: iso("2025-01-02", "03:00:00"),
  updatedAt: iso("2026-09-01", "03:00:00"),
  deletedAt: null,
  nationalDrugSystemCode: null,
  nationalDrugSystemPassword: null,
  defaultConsumptionWarehouseId: null,
}));

/* ---------- bác sĩ ---------- */
const DOCTORS = DOCTOR_NAMES.map((name, i) => {
  const id = uid();
  const staffId = uid();
  return {
    id, staffProfileId: staffId, specialtyId: null, photoFileId: null, publicBio: null,
    specialty: null, experienceText: null, createdAt: iso("2025-02-01"), updatedAt: iso("2025-02-01"),
    staffProfile: {
      id: staffId, userId: null, branchId: BRANCHES[i % 2].id, fullName: name, avatarUrl: null,
      positionTitle: "Bác sĩ", phone: `0912 000 00${i}`, email: null, status: "ACTIVE", isActive: true,
    },
  };
});

/* ---------- bệnh nhân ---------- */
const PAYMENT = ["PAID", "PARTIALLY_PAID", "UNPAID"];
const VISIT_STATUS = ["WAITING", "IN_PROGRESS", "DONE"];

const patients = BN.map((p, i) => {
  const id = uid();
  const branch = BRANCHES[i % 2];
  const doctor = DOCTORS[i % 3];
  const debt = i % 3 === 0 ? 0 : i % 3 === 1 ? 1_900_000 : 4_500_000;
  const arrived = i % 2 === 0; // 6/12 bệnh nhân đã tiếp nhận trong ngày
  const med = {
    id: uid(), patientProfileId: id,
    allergies: i === 1 ? "Penicillin" : i === 4 ? "Dị ứng thuốc tê Lidocain" : null,
    chronicDiseases: i === 7 ? "Tăng huyết áp" : null,
    medicalHistory: i === 0 ? "Từng điều trị tủy răng 46 (2024)" : null,
    dentalNotes: i === 0 ? "Răng 36 sâu răng, cần theo dõi" : null,
    createdAt: iso("2025-03-10"), updatedAt: iso("2026-09-20"),
  };
  const patient = {
    id,
    patientCode: `BN-${120 + i}`,
    fullName: p[0],
    phone: `09${12 + (i % 8)} 3${String(20 + i).padStart(2, "0")} ${String(100 + i * 23).slice(-3)}`,
    email: i % 3 === 0 ? `benhnhan.${i + 1}@example.com` : null,
    nationalId: i % 4 === 0 ? `012 345 67${String(456 + i)}` : null,
    dateOfBirth: iso(`${p[2]}-0${1 + (i % 9)}-${String(3 + (i * 5) % 25).padStart(2, "0")}`, "00:00:00"),
    gender: p[1],
    address: i % 2 === 0 ? `Số ${12 + i} ngõ ${30 + i} phường Dịch Vọng, quận Cầu Giấy, Hà Nội` : null,
    addressLine: i % 2 === 0 ? `Số ${12 + i} ngõ ${30 + i}` : null,
    province: "Hà Nội", district: i % 2 === 0 ? "Cầu Giấy" : null, ward: null,
    avatarFileId: null, branchId: branch.id, doctorProfileId: doctor.id,
    createdAt: iso(`2025-0${3 + (i % 7)}-1${i % 10}`), updatedAt: iso("2026-09-30"),
    deletedAt: null, sourceId: null, occupationId: null,
    crmSegment: i % 3 === 0 ? "Thân thiết" : "Mới",
    crmNotes: null, mergedIntoPatientProfileId: null, mergedAt: null,
    medicalInfo: med,
    insurancePolicies: i % 5 === 0 ? [{ id: uid(), provider: "BHYT", cardNo: "DN4 01 0123 4567 890", validFrom: "2026-01-01", validTo: "2026-12-31" }] : [],
    emergencyContacts: i % 3 === 0 ? [{ id: uid(), name: `${p[0].split(" ").pop()} (người nhà)`, phone: `098 700 00${i}`, relation: "Vợ/Chồng" }] : [],
    source: null, occupation: null,
    branch: { id: branch.id, code: branch.code, name: branch.name, address: branch.address, phone: branch.phone },
    doctorProfile: { id: doctor.id, staffProfileId: doctor.staffProfileId, staffProfile: { id: doctor.staffProfileId, fullName: doctor.staffProfile.fullName } },
    crmProfile: null, avatarFile: null, debtLedgerEntries: [],
    appointments: [],
    avatarUrl: null,
    profileCompleteness: {
      requiredFields: ["fullName", "phone", "dateOfBirth", "gender", "address", "allergies", "chronicDiseases", "medicalHistory", "emergencyContact"],
      missingFields: ["emergencyContact", ...(med.allergies ? [] : ["allergies"]), ...(med.chronicDiseases ? [] : ["chronicDiseases"])],
      isComplete: false,
    },
    totalDebtVnd: debt,
    paymentStatus: PAYMENT[i % 3],
    arrivalAt: arrived ? iso("2026-10-11", `${String(8 + (i % 4)).padStart(2, "0")}:${String((10 + i * 3) % 60).padStart(2, "0")}:00`) : null,
    currentVisit: null,
  };
  if (arrived) {
    patient.currentVisit = {
      appointmentId: null,
      startsAt: patient.arrivalAt,
      status: VISIT_STATUS[i % 3],
      appointmentStatus: "CONFIRMED",
      queueNumber: 1 + i,
      queueStatus: i % 3 === 0 ? "WAITING" : "IN_SERVICE",
      branch: patient.branch,
      serviceName: ["Khám tổng quát", "Trám răng", "Cạo vôi răng", "Nhổ răng khôn"][i % 4],
      firstProcedureName: null,
      doctorName: doctor.staffProfile.fullName,
      notes: null,
      registrationStatus: "DA_TIEP_NHAN",
    };
  }
  return patient;
});
const byName = (n) => patients.find((p) => p.fullName === n);

/* ---------- lịch hẹn ---------- */
const APT = [
  ["Nguyễn Thị Lan Hương", "2026-10-11", "09:00", "09:30", "CONFIRMED", "Tư vấn chỉnh nha"],
  ["Trần Văn Bình", "2026-10-11", "09:30", "10:15", "CHECKED_IN", "Nhổ răng khôn 48"],
  ["Phạm Thị Thuý", "2026-10-11", "10:00", "10:40", "IN_TREATMENT", "Trám răng 24"],
  ["Lê Quang Hải", "2026-10-11", "10:30", "11:10", "CONFIRMED", "Cạo vôi răng"],
  ["Vũ Thị Nhung", "2026-10-11", "14:00", "14:45", "CONFIRMED", "Bọc răng sứ 15"],
  ["Hoàng Anh Tuấn", "2026-10-11", "14:30", "15:10", "COMPLETED", "Tẩy trắng răng"],
  ["Đỗ Thị Mai", "2026-10-11", "15:00", "15:50", "CONFIRMED", "Niềng răng – kiểm tra định kỳ"],
  ["Ngô Văn Thành", "2026-10-11", "15:30", "16:20", "CHECKED_IN", "Nhổ răng sữa"],
  ["Bùi Thị Thanh Tâm", "2026-10-12", "16:00", "16:40", "CONFIRMED", "Điều trị tủy 36"],
  ["Đặng Hữu Nghị", "2026-10-13", "16:30", "17:10", "CANCELLED", "Cạo vôi răng"],
  ["Lý Thị Bích Ngọc", "2026-10-09", "08:30", "09:00", "COMPLETED", "Khám tổng quát"],
  ["Phan Thành Trung", "2026-10-14", "13:30", "14:00", "CONFIRMED", "Lấy dấu phục hình"],
  ["Nguyễn Thị Lan Hương", "2026-10-16", "09:00", "09:30", "CONFIRMED", "Siết khí chỉnh nha"],
  ["Vũ Thị Nhung", "2026-10-18", "10:00", "10:45", "CONFIRMED", "Gắn răng sứ"],
  ["Hoàng Anh Tuấn", "2026-10-20", "15:30", "16:00", "CONFIRMED", "Tái khám trám răng"],
  ["Trần Văn Bình", "2026-10-22", "09:00", "09:40", "CONFIRMED", "Cắt chỉ sau nhổ răng"],
];
const appointments = APT.map((a, i) => {
  const patient = byName(a[0]);
  const doctor = DOCTORS[i % 3];
  const branch = BRANCHES[i % 2];
  return {
    id: uid(), branchId: branch.id, patientProfileId: patient.id, doctorProfileId: doctor.id,
    chairId: null, serviceId: null,
    patientDisplayName: patient.fullName,
    startsAt: iso(a[1], `${a[2]}:00`), endsAt: iso(a[1], `${a[3]}:00`), status: a[4],
    holdExpiresAt: null, confirmedAt: iso(a[1], `${a[2]}:00`),
    checkedInAt: a[4] === "CHECKED_IN" ? iso(a[1], `${a[2]}:00`) : null,
    cancelledAt: a[4] === "CANCELLED" ? iso(a[1], `${a[2]}:00`) : null,
    cancellationReason: a[4] === "CANCELLED" ? "Bệnh nhân báo bận" : null,
    noShowAt: null,
    notes: a[5],
    serviceTitle: a[5],
    serviceName: a[5],
    doctorName: doctor.staffProfile.fullName,
    isDirectVisit: false,
    createdAt: iso("2026-10-01", "08:00:00"), updatedAt: iso(a[1], `${a[2]}:00`),
    branch: { id: branch.id, code: branch.code, name: branch.name, address: branch.address, phone: branch.phone, isActive: true },
    patientProfile: {
      id: patient.id, patientCode: patient.patientCode, fullName: patient.fullName, phone: patient.phone,
      gender: patient.gender, dateOfBirth: patient.dateOfBirth, medicalInfo: patient.medicalInfo,
      insurancePolicies: patient.insurancePolicies, emergencyContacts: patient.emergencyContacts,
      totalDebtVnd: patient.totalDebtVnd,
    },
    doctorProfile: { id: doctor.id, staffProfileId: doctor.staffProfileId, staffProfile: { id: doctor.staffProfileId, fullName: doctor.staffProfile.fullName } },
  };
});
for (const p of patients) p.appointments = appointments.filter((a) => a.patientProfileId === p.id);

/* ---------- ca khám (visits) trong ngày ---------- */
const visits = appointments
  .filter((a) => a.startsAt.startsWith("2026-10-11") && a.status !== "CANCELLED")
  .map((a) => ({
    id: uid(), appointmentId: a.id,
    status: a.status === "CHECKED_IN" ? "CHECKED_IN" : a.status === "IN_TREATMENT" ? "IN_PROGRESS" : "SCHEDULED",
    checkedInAt: a.checkedInAt, startedAt: a.status === "IN_TREATMENT" ? a.startsAt : null,
    pendingPaymentAt: null, completedAt: a.status === "COMPLETED" ? a.endsAt : null,
    createdAt: a.createdAt, updatedAt: a.updatedAt,
    emrStatus: "OPEN", clinicalRecord: null, adviceRecords: [], labOrders: [],
    diagnosticOrders: [], prescriptions: [], invoice: null, serviceProposals: [],
    externalLabWorkOrders: [], appointment: a,
  }));

/* ---------- hồ sơ RHM/EMR (odontogram) ---------- */
const TOOTH_STATUS = [
  ["16", "CARIES", ["Sâu răng"], "Sâu ngà mặt nhai", "Trám composite", "Đã trám composite"],
  ["26", "FILLED", ["Đã trám"], null, null, null],
  ["36", "DECAYED", ["Sâu răng"], "Sâu răng mặt nhai", "Điều trị tủy + chụp sứ", null],
  ["46", "CROWN", ["Chụp sứ"], "Răng đã điều trị tủy", "Theo dõi định kỳ", null],
  ["11", "HEALTHY", [], null, null, null],
  ["21", "MISSING", ["Mất răng"], "Mất răng cối lớn", "Cấy implant", null],
];
const dentalRecord = {
  id: uid(), visitId: null, patientProfileId: patients[0].id,
  dentition: "PERMANENT",
  chiefComplaint: "Ê buốt răng hàm trên phải khi ăn đồ lạnh",
  extraOralExam: "Không phát hiện bất thường",
  intraOralExam: "Vệ sinh răng miệng trung bình, cao răng vùng cửa dưới",
  occlusion: "Khớp cắn Angle I",
  diagnosis: "Sâu ngà răng 16; viêm nha chu nhẹ vùng răng trước dưới",
  treatmentPlan: "Trám composite răng 16; lấy cao răng + đánh bóng toàn hàm; hẹn tái khám 3 tháng",
  performedTreatment: "Trám composite răng 16 hoàn tất, khớp cắn ổn định",
  followUpNote: "Tái khám sau 3 tháng để kiểm tra miếng trám và nha chu",
  createdAt: iso("2026-09-20", "09:20:00"), updatedAt: iso("2026-10-05", "09:20:00"),
  teeth: TOOTH_STATUS.map((t) => ({
    id: uid(), odontogramId: null, toothNumber: t[0], status: t[1], mobility: 0,
    conditionCodes: t[2], diagnosis: t[3], plannedTreatment: t[4], performedTreatment: t[5],
    notes: null, createdAt: iso("2026-09-20", "09:20:00"), updatedAt: iso("2026-10-05", "09:20:00"), surfaces: [],
  })),
  periodontalMeasurements: [],
  visit: null,
};
for (const t of dentalRecord.teeth) t.odontogramId = dentalRecord.id;

/* ---------- kho vật tư ---------- */
const INV = [
  ["VT001", "Găng tay latex size M", "MATERIAL", "Hộp", 50, 98_000, 135_000, null, "Găng tay y tế dùng 1 lần"],
  ["VT002", "Khẩu trang y tế 3 lớp", "MATERIAL", "Hộp", 40, 45_000, 70_000, null, "Khẩu trang phòng khám"],
  ["VT003", "Bông gòn y tế", "MATERIAL", "Gói", 30, 18_000, 32_000, null, "Sát khuẩn, lau dụng cụ"],
  ["DC001", "Kim tiêm nha khoa 27G", "MATERIAL", "Hộp", 60, 42_000, 68_000, null, "Gây tê tại chỗ"],
  ["DC002", "Mũi khoan tròn carbide", "MATERIAL", "Cái", 100, 28_000, 45_000, null, "Dùng cho tay khoan"],
  ["TH001", "Lidocaine 2% – ống 1.8ml", "MEDICATION", "Hộp", 15, 185_000, 280_000, "VN-21548-19", "Thuốc tê"],
  ["TH002", "Amoxicillin 500mg", "MEDICATION", "Hộp", 20, 120_000, 190_000, "VN-11223-20", "Kháng sinh sau nhổ răng"],
  ["TH003", "Nước súc miệng Chlorhexidine 0,12%", "MEDICATION", "Chai", 24, 62_000, 95_000, "VN-19342-17", "Súc miệng sau phẫu thuật"],
  ["VT004", "Composite A2 4g", "MATERIAL", "Ống", 20, 420_000, 690_000, null, "Trám răng thẩm mỹ"],
  ["VT005", "Xi măng GIC phục hồi", "MATERIAL", "Bộ", 10, 380_000, 560_000, null, "Trám răng sữa"],
];
const inventory = INV.map((it, i) => {
  const branch = BRANCHES[i % 2];
  return {
    id: uid(), sku: it[0], name: it[1], type: it[2], categoryId: null, branchId: branch.id,
    unit: it[3], baseUomId: null, quantityPrecision: 0, lowStockThreshold: it[4],
    latestPurchaseCostVnd: it[5], sellingPriceVnd: it[6], importPriceVnd: it[5], exportPriceVnd: it[6],
    amountVnd: null, warranty: null, activeIngredient: null,
    nationalDrugCode: it[7], nationalDrugName: null, nationalActiveIngredient: null,
    usage: it[8], instructions: null, sortPosition: i, currency: "VND", note: null,
    taxCategoryId: null, supplierId: null, isActive: true,
    createdAt: iso("2025-06-11", "03:28:00"), updatedAt: iso("2026-09-30", "03:28:00"),
    category: null,
    branch: { id: branch.id, code: branch.code, name: branch.name },
    supplier: null,
    batches: [],
  };
});

/* ---------- tài chính ngày ---------- */
const financial = {
  branchId: null, date: "2026-10-11",
  serviceTotalVnd: 24_500_000,
  collectedTotalVnd: 21_300_000,
  invoiceCount: 9,
  updatedAt: iso("2026-10-11", "10:00:00"),
};

/* ---------- đóng gói ---------- */
const fixture = {
  meta: {
    clinic: "Nha khoa Minh Tâm",
    loggedInUser: DOCTORS[1].staffProfile.fullName,
    note: "Dữ liệu giả để chụp ảnh minh hoạ trang giải pháp DentGo.",
  },
  authMe: {
    user: {
      id: uid(), username: "admin@minhtam", phone: "0912 000 345", role: "ADMIN",
      staffProfile: {
        id: DOCTORS[1].staffProfileId, fullName: DOCTORS[1].staffProfile.fullName,
        phone: "0912 000 345", email: null, managedClinicName: null,
        branch: { id: BRANCHES[1].id, code: BRANCHES[1].code, name: BRANCHES[1].name },
      },
    },
    permissionOverrides: [],
    effectiveModules: ["users", "branches", "patients", "services", "scheduling", "clinical", "customer-care", "billing", "inventory", "suppliers", "reports", "notifications", "support-tickets", "audit", "files", "full-master"],
    effectiveFeatures: ["overview", "appointments", "queue", "waitlist", "reminders", "customer-care", "patients", "visits", "billing", "inventory", "operations", "support-tickets"],
    effectiveActionPermissions: ["141:view", "142:view", "158:create", "158:update"],
    rolePermissionsConfigured: false,
  },
  subscription: {
    subscription: {
      id: uid(), status: "active", storedStatus: "ACTIVE",
      plan: { id: uid(), code: "PRO", name: "Gói chuyên nghiệp" },
      startsAt: iso("2026-01-01", "00:00:00"), currentUntil: iso("2026-12-31", "00:00:00"),
      graceDays: 15, graceEndsAt: null, daysUntilExpiry: 81,
      isAccessBlocked: false, contractCode: null, contractValue: null, currency: "VND",
    },
  },
  zaloConversations: { conversations: [] },
  unread: { unreadCount: 0 },
  appointmentsOptions: {
    branches: BRANCHES,
    services: [
      ["Khám tổng quát", 150_000], ["Cạo vôi răng", 350_000], ["Trám composite", 450_000],
      ["Nhổ răng khôn", 1_500_000], ["Điều trị tủy", 1_800_000], ["Bọc răng sứ", 3_000_000],
      ["Tẩy trắng răng", 2_000_000], ["Niềng răng – kiểm tra", 0],
    ].map(([name, price]) => ({ id: uid(), code: name.toUpperCase().replace(/[^A-Z]/g, "_").slice(0, 20), name, defaultPriceVnd: price, currency: "VND", isActive: true })),
    doctors: DOCTORS,
  },
  financialSummary: financial,
  patients,
  appointments,
  visits,
  dentalRecord,
  inventory,
};

/* ---------- CSKH Zalo (4 quy tắc: danh sách app giới hạn max-h 360px, nhiều hơn sẽ tràn khỏi thẻ khi chụp) — GET /reminders/{templates,rules,deliveries}, /zalo/zca/qr-login ----------
 * Sinh SAU object `fixture` vì `uid()` đếm tuần tự: thêm ở trên sẽ đổi id các bản ghi cũ. */
const REMINDER_PLAN = [
  ["APPOINTMENT_CONFIRMATION", "Zalo - Xác nhận lịch hẹn mới", 0, "Kính chào {patientName}, {branchName} xác nhận lịch hẹn {serviceName} vào {appointmentTime}."],
  ["APPOINTMENT_REMINDER", "Zalo - Nhắc lịch trước", 1440, "Kính chào {patientName}, {branchName} nhắc lịch {serviceName} vào {appointmentTime}. Vui lòng đến trước 10 phút."],
  ["REVISIT_REMINDER", "Zalo - Nhắc tái khám định kỳ", 4320, "Đã 6 tháng kể từ lần cạo vôi gần nhất, {branchName} mời {patientName} đặt lịch kiểm tra định kỳ."],
  ["BIRTHDAY_PROMOTION", "Zalo - Chúc mừng sinh nhật", 0, "Chúc mừng sinh nhật {patientName}! Tặng bạn ưu đãi 20% tẩy trắng răng trong tháng này."],
];
const reminderTemplates = REMINDER_PLAN.map(([scenario, name, , body]) => ({
  id: uid(), branchId: BRANCHES[0].id, channel: "ZALO", scenario, name, body,
  isDefault: true, isActive: true, deletedAt: null, createdAt: iso("2026-08-20", "02:00:00"), updatedAt: iso("2026-09-15", "02:00:00"),
}));
fixture.reminderTemplates = { templates: reminderTemplates };
fixture.reminderRules = {
  rules: REMINDER_PLAN.map(([scenario, , minutesBefore], i) => ({
    id: uid(), branchId: BRANCHES[0].id, templateId: reminderTemplates[i].id, channel: "ZALO", scenario,
    minutesBefore, isActive: scenario !== "BIRTHDAY_PROMOTION", useAiDraft: true, maxAttempts: 3, deletedAt: null,
    createdAt: iso("2026-08-20", "02:10:00"), updatedAt: iso("2026-09-15", "02:10:00"),
    branch: BRANCHES[0], template: reminderTemplates[i],
  })),
};
fixture.reminderDeliveries = {
  deliveries: appointments.slice(0, 6).map((a, i) => ({
    id: uid(), branchId: BRANCHES[0].id, channel: "ZALO", scenario: REMINDER_PLAN[i % 2][0],
    status: i === 3 ? "FAILED" : "SENT", messageBody: `Kính chào ${a.patientDisplayName}, Nha khoa Minh Tâm nhắc lịch khám của bạn.`,
    errorMessage: i === 3 ? "Khách chưa kết bạn Zalo với phòng khám" : null,
    createdAt: a.startsAt, appointment: { id: a.id, startsAt: a.startsAt },
    patientProfile: { id: a.patientProfileId, fullName: a.patientDisplayName }, reminderJob: { id: uid() },
  })),
};
// Trạng thái CONNECTED → app ẩn banner "Quét QR đăng nhập Zalo".
fixture.zaloQrLogin = { sessionId: null, status: "CONNECTED", qrImageDataUrl: null, errorMessage: null, expiresAt: null, accountId: uid(), runtimeMarker: "zca" };

/* ---------- báo cáo thu/chi/chuyển quỹ — /internal/reports/finance ----------
 * GET /reports/cash-transactions → {rows, totalRows}; app tự nhóm theo hướng (thu/chi/chuyển quỹ)
 * và `categoryName`. GET /operations/cashbook chỉ nạp ô lọc (quỹ, nhóm thu chi) — vouchers để rỗng.
 * GET /admin/settings, /files/brand-logo → rỗng (không tải logo/cấu hình phòng khám thật). */
const FUNDS = [["TM", "Tiền mặt quầy lễ tân"], ["CK", "Tài khoản ngân hàng"], ["POS", "Quẹt thẻ POS"]].map(([code, name]) => ({
  id: uid(), branchId: BRANCHES[0].id, code, name, managerText: null, note: null, bankCode: null, bankAccount: null, accountName: null,
  allowCash: code === "TM", allowSwipe: code === "POS", allowTransfer: code === "CK", isProtected: false, currency: "VND",
  openingBalanceVnd: 0, currentBalanceVnd: 0, isActive: true, createdAt: iso("2026-01-02"), updatedAt: iso("2026-09-01"),
}));
const CASH_CATS = [
  ["Thu tiền điều trị", "INCOME", 1], ["Thu tiền đặt cọc niềng răng", "INCOME", 2],
  ["Chi mua vật tư nha khoa", "EXPENSE", 3], ["Chi trả labo phục hình", "EXPENSE", 4], ["Chi điện nước, văn phòng phẩm", "EXPENSE", 5],
].map(([name, type, sortPosition]) => ({
  id: uid(), branchId: BRANCHES[0].id, code: `NC${sortPosition}`, name, type, allowBoth: false, groupName: type === "INCOME" ? "Thu" : "Chi",
  note: null, sortPosition, isActive: true, createdAt: iso("2026-01-02"), updatedAt: iso("2026-09-01"),
}));
fixture.cashbook = { funds: FUNDS, categories: CASH_CATS, vouchers: [], transfers: [] };
const SUPPLIERS = [
  ["Công ty TNHH Vật tư Nha khoa Phương Đông", "Đống Đa, Hà Nội", "024 0000 0181"],
  ["Labo Răng sứ Ánh Dương", "Thanh Xuân, Hà Nội", "024 0000 0182"],
];
const cashRow = (i, date, cat, who, address, phone, amount, fund, reason) => ({
  date, counterpartyName: who, address, phone,
  incomeVnd: cat.type === "INCOME" ? amount : 0, expenseVnd: cat.type === "EXPENSE" ? amount : 0,
  internalIncomeVnd: 0, internalExpenseVnd: 0,
  voucherNo: `${cat.type === "INCOME" ? "PT" : "PC"}-2610${String(i + 1).padStart(3, "0")}`,
  fundName: fund.name, staffName: cat.type === "INCOME" ? "Lê Thị Hồng (Lễ tân)" : "Nguyễn Thu Hà (Kế toán)",
  reason, note: "", categoryName: cat.name, categorySortPosition: cat.sortPosition,
});
const pt = (n) => patients[n];
// SĐT rõ ràng là giả (đầu 0900 000) — tránh dạng số thật có thể trùng thuê bao.
const fakePhone = (n) => `0900 000 ${String(101 + n * 7).padStart(3, "0")}`;
fixture.cashTransactions = (() => {
  const rows = [
    cashRow(0, "2026-10-01", CASH_CATS[0], pt(0).fullName, "Cầu Giấy, Hà Nội", fakePhone(0), 1_500_000, FUNDS[0], "Thanh toán nhổ răng khôn"),
    cashRow(1, "2026-10-02", CASH_CATS[0], pt(1).fullName, "Thanh Xuân, Hà Nội", fakePhone(1), 450_000, FUNDS[2], "Thanh toán trám composite"),
    cashRow(2, "2026-10-03", CASH_CATS[0], pt(3).fullName, "Đống Đa, Hà Nội", fakePhone(3), 3_000_000, FUNDS[1], "Thanh toán bọc răng sứ"),
    cashRow(3, "2026-10-05", CASH_CATS[0], pt(5).fullName, "Hà Đông, Hà Nội", fakePhone(5), 1_800_000, FUNDS[0], "Thanh toán điều trị tuỷ"),
    cashRow(4, "2026-10-06", CASH_CATS[1], pt(8).fullName, "Nam Từ Liêm, Hà Nội", fakePhone(8), 10_000_000, FUNDS[1], "Đặt cọc niềng răng mắc cài"),
    cashRow(5, "2026-10-08", CASH_CATS[0], pt(10).fullName, "Ba Đình, Hà Nội", fakePhone(10), 350_000, FUNDS[0], "Thanh toán cạo vôi răng"),
    cashRow(6, "2026-10-02", CASH_CATS[2], SUPPLIERS[0][0], SUPPLIERS[0][1], SUPPLIERS[0][2], 6_850_000, FUNDS[1], "Nhập composite, kim tiêm, găng tay"),
    cashRow(7, "2026-10-07", CASH_CATS[3], SUPPLIERS[1][0], SUPPLIERS[1][1], SUPPLIERS[1][2], 4_200_000, FUNDS[1], "Thanh toán 3 mão sứ zirconia"),
    cashRow(8, "2026-10-09", CASH_CATS[4], "Cửa hàng văn phòng phẩm Minh Anh", "Hoàn Kiếm, Hà Nội", "024 0000 0183", 620_000, FUNDS[0], "Mua giấy in, mực máy in"),
  ];
  return { rows, totalRows: rows.length };
})();

const out = path.resolve("scripts/screenshots/fixtures/dentgo.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(fixture, null, 2));
console.log("wrote", out, "| patients:", patients.length, "| appointments:", appointments.length, "| visits:", visits.length, "| items:", inventory.length);
