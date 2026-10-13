/**
 * build-lms-fixture.mjs — sinh dữ liệu giả cho các màn hình LMS (iSmartSchool).
 *
 * Chạy: node scripts/screenshots/build-lms-fixture.mjs
 * Ra:   scripts/screenshots/fixtures/lms.json
 *
 * Cấu trúc bám đúng API thật đã đo (envelope {success,data,meta}):
 * - workspace/dashboard: totals + 3 trường giả
 * - students: page 10 bản ghi + meta.pagination
 * - classes/grade-blocks/subjects: bảng chọn trên trang Học sinh
 * - parents, staff: phục vụ tính năng hồ sơ HS–PH–nhân sự
 * - tt27/regular-comments: nhận xét đúng văn phong giá viên + mức đánh giá Thông tư 27
 * - lesson-plans: 11 giáo án, trạng thái Đã duyệt / Đang trình duyệt / Nháp
 * - academic-records: 13 học bạ số, chu trình ký/phát hành
 * - timetables: sinh lịch học 4 khối đầu (Sáng/Chiều × 5 tiết × 5 ngày)
 */
import fs from "node:fs";
import path from "node:path";

/* ---------- họ tên giả đa dạng, không lặp ---------- */
const HOCSINH = [
  ["Nguyễn Bảo Châu", "Nữ", "Lớp 1A"], ["Trần Minh Khôi", "Nam", "Lớp 1A"],
  ["Lê Thu Hà", "Nữ", "Lớp 1A"], ["Phạm Gia Huy", "Nam", "Lớp 1A"],
  ["Vũ Khánh Ngọc", "Nữ", "Lớp 1A"], ["Đặng Anh Thư", "Nữ", "Lớp 2A"],
  ["Hoàng Tuấn Kiệt", "Nam", "Lớp 2A"], ["Bùi Ngọc Ánh", "Nữ", "Lớp 2A"],
  ["Đỗ Quang Vinh", "Nam", "Lớp 3A"], ["Ngô Thanh Mai", "Nữ", "Lớp 3A"],
  ["Dương Hải Đăng", "Nam", "Lớp 4A"], ["Lý Thu Thảo", "Nữ", "Lớp 4A"],
  ["Võ Trí Dũng", "Nam", "Lớp 5A"], ["Trịnh Bích Phượng", "Nữ", "Lớp 5A"],
  ["Phan Hữu Phước", "Nam", "Lớp 5B"], ["Mai Tuấn Kiệt", "Nam", "Lớp 5B"],
  ["Lưu Đình Tuấn", "Nam", "Lớp 4C"], ["Tạ Hồng Quân", "Nam", "Lớp 3C"],
];
const PHUHUYNH = [
  ["Nguyễn Văn Thanh", "Bố", "Nguyễn Bảo Châu"], ["Trần Thị Hồng", "Mẹ", "Trần Minh Khôi"],
  ["Lê Mạnh Cường", "Bố", "Lê Thu Hà"], ["Phạm Thị Sen", "Mẹ", "Phạm Gia Huy"],
  ["Vũ Đình Hải", "Bố", "Vũ Khánh Ngọc"], ["Đặng Thị Lan", "Mẹ", "Đặng Anh Thư"],
  ["Hoàng Văn Sơn", "Bố", "Hoàng Tuấn Kiệt"], ["Bùi Thị Nga", "Mẹ", "Bùi Ngọc Ánh"],
  ["Đỗ Mạnh Dũng", "Bố", "Đỗ Quang Vinh"], ["Ngô Thị Hạnh", "Mẹ", "Ngô Thanh Mai"],
];
const NHANSU = [
  ["Nguyễn Thanh Hà", "Hiệu trưởng", "Ban Giám hiệu", "Thạc sĩ", "Không xác định thời hạn"],
  ["Vũ Gia Hà", "Giáo viên chủ nhiệm", "Tổ Văn – Toán", "Cử nhân Sư phạm", "Không xác định thời hạn"],
  ["Bùi Khánh Phong", "Giáo viên chủ nhiệm", "Tổ Văn – Toán", "Cử nhân Sư phạm", "Không xác định thời hạn"],
  ["Đặng Minh Hân", "Giáo viên chủ nhiệm", "Tổ Tự nhiên – Xã hội", "Cử nhân Sư phạm", "Không xác định thời hạn"],
  ["Lê Thị Kim Oanh", "Giáo viên Tiếng Anh", "Tổ Ngoại ngữ", "Cử nhân", "Xác định thời hạn"],
  ["Phan Quốc Bảo", "Giáo viên Tin học", "Tổ Ngoại ngữ", "Kỹ sư", "Không xác định thời hạn"],
  ["Trịnh Thu Hiền", "Giáo viên Mỹ thuật", "Tổ Năng khiếu", "Cử nhân Mỹ thuật", "Không xác định thời hạn"],
  ["Mai Văn Thành", "Giáo viên Thể chất", "Tổ Năng khiếu", "Cử nhân", "Xác định thời hạn"],
  ["Võ Ngọc Diệp", "Kế toán viên", "Văn phòng", "Cử nhân Kế toán", "Không xác định thời hạn"],
  ["Lý Thị Yến", "Thư viện", "Văn phòng", "Trung cấp", "Xác định thời hạn"],
  ["Tạ Hồng Sơn", "Bảo vệ", "Hành chính", "—", "Theo mùa vụ"],
  ["Đỗ Anh Khoa", "Giáo viên âm nhạc", "Tổ Năng khiếu", "Cử nhân Âm nhạc", "Không xác định thời hạn"],
];

/* ---------- lớp & môn ---------- */
const LOP = [
  ["Lớp 1A", 1, "Vũ Gia Hà"], ["Lớp 1B", 1, "Đặng Minh Hân"], ["Lớp 2A", 2, "Bùi Khánh Phong"],
  ["Lớp 2B", 2, "Nguyễn Thanh Hà"], ["Lớp 3A", 3, "Đặng Minh Hân"], ["Lớp 3B", 3, "Vũ Gia Hà"],
  ["Lớp 3C", 3, "Bùi Khánh Phong"], ["Lớp 4A", 4, "Vũ Gia Hà"], ["Lớp 4B", 4, "Đặng Minh Hân"],
  ["Lớp 4C", 4, "Bùi Khánh Phong"], ["Lớp 5A", 5, "Bùi Khánh Phong"], ["Lớp 5B", 5, "Đặng Minh Hân"],
];
const MON_HOC = [
  ["TOAN", "Toán"], ["VAN", "Tiếng Việt"], ["DAO", "Đạo đức"], ["TNXH", "Tự nhiên và Xã hội"],
  ["LS", "Lịch sử"], ["DL", "Địa lý"], ["KHOA", "Khoa học"], ["CNG", "Công nghệ"],
  ["TIN", "Tin học"], ["ANH", "Tiếng Anh"], ["HDTN", "Hoạt động trải nghiệm"],
  ["GDTC", "Giáo dục thể chất"], ["AM", "Âm nhạc"], ["MT", "Mỹ thuật"],
];

/* ---------- bối cảnh (tenant/campus/năm học) — bám shape thật của API ---------- */
const TENANT = { id: "tenant_mc", code: "TH_MC", name: "Trường Tiểu học Minh Châu" };
const CAMPUS = { id: "campus_mc", tenantId: TENANT.id, name: "Cơ sở chính" };
const AY = {
  id: "ay_2627", tenantId: TENANT.id, name: "2026–2027",
  startDate: "2026-09-05T00:00:00.000Z", endDate: "2027-05-30T00:00:00.000Z", isCurrent: true, status: "ACTIVE",
};
const SEM = {
  id: "sem_1", tenantId: TENANT.id, academicYearId: AY.id, name: "Học kỳ 1", term: 1,
  startDate: "2026-09-05T00:00:00.000Z", endDate: "2027-01-16T00:00:00.000Z",
};
const ROOMS = ["Phòng 101", "Phòng 102", "Phòng 201", "Phòng 202", "Phòng Tin học", "Sân trường"].map((name, i) => ({
  id: `room_${i + 1}`, tenantId: TENANT.id, campusId: CAMPUS.id, name,
  roomType: i === 5 ? "OUTDOOR" : i === 4 ? "LAB" : "CLASSROOM",
  capacity: i === 5 ? 200 : 40, isActive: true,
  createdAt: "2026-08-20T02:00:00.000Z", updatedAt: "2026-09-01T02:00:00.000Z", deletedAt: null,
}));
const iso = (d) => `2026-10-${String(d).padStart(2, "0")}T0${1 + (d % 8)}:00:00.000Z`;
const pad2 = (n) => String(n).padStart(2, "0");

const classRows = LOP.map((l, i) => ({
  id: `cls_${i}`, tenantId: TENANT.id, academicYearId: AY.id,
  name: l[0], gradeLevel: l[1], code: l[0].replace("Lớp ", ""),
  homeroomTeacherId: `st_${String(3 + (i % 8)).padStart(3, "0")}`,
  campusId: CAMPUS.id, maxStudents: 35, status: "ACTIVE",
  createdAt: "2026-08-25T02:00:00.000Z", updatedAt: "2026-09-05T02:00:00.000Z", deletedAt: null,
  campus: { id: CAMPUS.id, name: CAMPUS.name },
  homeroomTeacher: { id: `st_${String(3 + (i % 8)).padStart(3, "0")}`, fullName: l[2], username: `gvnv.minhchau.${String(3 + (i % 8)).padStart(3, "0")}` },
  academicYear: { id: AY.id, name: AY.name },
  _count: { enrollments: 21 + (i % 5) * 2 },
}));

/* ---------- workspace đa trường ---------- */
const schools = [
  { code: "TH_MC", name: "Trường Tiểu học Minh Châu", classes: 16, students: 90, staff: 18 },
  { code: "TH_HP", name: "Trường Tiểu học Hoa Phượng", classes: 10, students: 60, staff: 14 },
  { code: "TH_BM", name: "Trường Tiểu học Bình Minh", classes: 5, students: 35, staff: 8 },
];

/* ---------- nhận xét TT27 (văn phong giáo viên, đúng mức đánh giá) ---------- */
const TT27 = [
  ["Nguyễn Bảo Châu", "Hoàn thành tốt các yêu cầu", "Em chăm làm bài và chủ động phát biểu xây dựng bài. Em nhẩm tính nhanh và chính xác, cần giữ phong độ này nhé."],
  ["Trần Minh Khôi", "Hoàn thành", "Em nắm được kiến thức bài học và làm bài đúng yêu cầu. Em cần tập viết chữ cẩn thận hơn và chú ý nghe giảng."],
  ["Lê Thu Hà", "Hoàn thành tốt các yêu cầu", "Em tích cực tham gia trò chơi toán học, giải quyết vấn đề tốt. Em cần ôn lại bảng nhân chia để tính nhanh hơn."],
  ["Phạm Gia Huy", "Cần cố gắng", "Em đã có tiến bộ trong tháng. Em cần chú ý nghe giảng và làm bài tập về nhà đầy đủ để theo kịp bạn."],
  ["Vũ Khánh Ngọc", "Hoàn thành", "Em làm việc nghiêm túc, bài tập sạch sẽ. Em cần luyện tập thêm phần đo lường để hoàn thành tốt hơn."],
  ["Đặng Anh Thư", "Hoàn thành tốt các yêu cầu", "Em có khả năng quan sát tốt, thường đưa ra cách làm sáng tạo. Em cần tự tin trình bày ý kiến trước lớp."],
];

/* ---------- giáo án điện tử ---------- */
const LESSON_PLANS = [
  ["Giáo án Tin học – bài 1", "Tin học (Khối 5) · 2026–2027 · Tin học 5 – Bài 1 · tuần 1", "Lê Thị Kim Oanh", "Đã duyệt"],
  ["Giáo án Tin học – bài 2", "Tin học (Khối 5) · 2026–2027 · Tin học 5 – Bài 2 · tuần 2", "Lê Thị Kim Oanh", "Đang trình duyệt"],
  ["Giáo án Tin học – bài 3", "Tin học (Khối 5) · 2026–2027 · Tin học 5 – Bài 3 · tuần 3", "Lê Thị Kim Oanh", "Đã duyệt"],
  ["Giáo án Toán – bài 12", "Toán (Khối 5) · 2026–2027 · Toán 5 – Bài 12 · tuần 4", "Bùi Khánh Phong", "Đã duyệt"],
  ["Giáo án Toán – bài 11", "Toán (Khối 5) · 2026–2027 · Toán 5 – Bài 11 · tuần 3", "Bùi Khánh Phong", "Nháp"],
  ["Giáo án Tiếng Việt – bài 9", "Tiếng Việt (Khối 5) · 2026–2027 · Tiếng Việt 5 – Bài 9 · tuần 2", "Vũ Gia Hà", "Đã duyệt"],
  ["Giáo án Tiếng Việt – bài 8", "Tiếng Việt (Khối 5) · 2026–2027 · Tiếng Việt 5 – Bài 8 · tuần 2", "Vũ Gia Hà", "Đang trình duyệt"],
  ["Giáo án Tiếng Anh – bài 3", "Tiếng Anh (Khối 5) · 2026–2027 · Tiếng Anh 5 – Bài 3 · tuần 3", "Lê Thị Kim Oanh", "Đã duyệt"],
  ["Giáo án Lịch sử & Địa lý – bài 4", "Lịch sử và Địa lý (Khối 5) · 2026–2027 · Lịch sử và Địa lý 5 – Bài 4 · tuần 3", "Đặng Minh Hân", "Đã duyệt"],
  ["Giáo án Khoa học – bài 5", "Khoa học (Khối 5) · 2026–2027 · Khoa học 5 – Bài 5 · tuần 5", "Đặng Minh Hân", "Nháp"],
  ["Giáo án Mỹ thuật – bài 2", "Mỹ thuật (Khối 5) · 2026–2027 · Mỹ thuật 5 – Bài 2 · tuần 2", "Trịnh Thu Hiền", "Đang trình duyệt"],
];

/* ---------- học bạ số (bám shape thật GET /v1/academic-records) ---------- */
const REC_STATUS = ["DRAFT", "SIGNING", "INTERNALLY_SEALED", "PUBLISHED"];
const recordRows = HOCSINH.slice(0, 13).map((h, i) => {
  const studentId = `std_${String(i + 1).padStart(3, "0")}`;
  const cls = classRows.find((c) => c.name === h[2]) ?? classRows[0];
  const status = REC_STATUS[i % REC_STATUS.length];
  const version = i % 4 === 3 ? 2 : 1;
  const signerStep = (step, signerId, signerName) => ({
    id: `sg_${i}_${step}`, tenantId: TENANT.id, recordId: `ar_${String(i + 1).padStart(3, "0")}`,
    version, step, signerId, method: "USB_TOKEN", status: step <= (i % 3) + 1 ? "SIGNED" : "PENDING",
    signatureHash: step <= (i % 3) + 1 ? `sha256:${String(1000 + i * 7 + step)}` : null,
    signedAt: step <= (i % 3) + 1 ? iso(6 + i) : null,
    signatureType: "USB_TOKEN", certificateIssuer: "VNPT-CA", certificateSerial: `0100${200 + i}`,
    certificateValidFrom: "2025-01-01T00:00:00.000Z", certificateValidTo: "2027-01-01T00:00:00.000Z",
    certificateAlgorithm: "RSA-SHA256", signatureReference: `ref_${i}_${step}`,
    signer: { id: signerId, fullName: signerName },
  });
  return {
    id: `ar_${String(i + 1).padStart(3, "0")}`,
    tenantId: TENANT.id,
    studentId, classId: cls.id, academicYearId: AY.id,
    status, version,
    content: { asOf: iso(5 + (i % 10)), state: status, source: "CURRICULUM" },
    studentRecordCode: status === "PUBLISHED" ? `HB${String(1200 + i)}` : null,
    checksum: `sha256:${String(9000 + i)}`,
    publishedAt: status === "PUBLISHED" ? iso(8 + (i % 6)) : null,
    publishedById: status === "PUBLISHED" ? "st_001" : null,
    publishPurpose: status === "PUBLISHED" ? "PARENT_VIEW" : null,
    publishRecipient: status === "PUBLISHED" ? "PHU_HUYNH" : null,
    revokedAt: null, revocationReason: null, revokedFromVersion: null,
    sourceRecordId: null, sourceTenantId: null, sourceChecksum: null, sourceSignature: null,
    inheritanceNote: null, inheritedAt: null,
    revokedById: null, revokedBy: null,
    createdAt: iso(3 + (i % 6)), updatedAt: iso(6 + (i % 6)), deletedAt: null,
    student: { id: studentId, fullName: h[0], userCode: `TH_MC-HS${String(i + 1).padStart(3, "0")}`, gender: h[1] === "Nam" ? "MALE" : "FEMALE", dateOfBirth: `20${15 + (i % 5)}-${pad2(1 + (i % 9))}-${pad2(3 + (i % 25))}T00:00:00.000Z` },
    class: { id: cls.id, name: cls.name, gradeLevel: cls.gradeLevel },
    academicYear: { id: AY.id, name: AY.name },
    publishedBy: null,
    signers: [
      signerStep(1, cls.homeroomTeacherId, cls.homeroomTeacher.fullName),
      signerStep(2, "st_001", "Nguyễn Thanh Hà"),
      signerStep(3, "st_002", "Vũ Gia Hà"),
    ],
    versionCount: version,
  };
});

/* ---------- sinh thời khóa biểu (bám shape thật GET /v1/timetables) ---------- */
const timetables = [];
const days = [2, 3, 4, 5, 6]; // Thứ 2..Thứ 6
const sessions = ["MORNING", "AFTERNOON"];
let seed = 7;
const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
const subjectObj = (m, i) => ({
  id: `sj_${m[0]}`, tenantId: TENANT.id, code: m[0], name: m[1],
  gradeLevel: (i % 5) + 1, subjectType: i % 4 === 3 ? "ELECTIVE" : "REQUIRED",
  evaluationType: "COMMENT", weeklyPeriods: 2 + (i % 3), departmentId: `dep_${(i % 4) + 1}`,
  createdAt: "2026-08-20T02:00:00.000Z", updatedAt: "2026-09-01T02:00:00.000Z", deletedAt: null,
});
const teacherObj = (id, fullName) => ({ id, fullName, username: `gvnv.minhchau.${id.replace("st_", "")}` });

classRows.slice(0, 4).forEach((cls, ci) => {
  days.forEach((dow) => {
    sessions.forEach((session) => {
      for (let period = 1; period <= 5; period++) {
        const opening = session === "MORNING" && period === 1; // tiết 1 sáng: chào cờ
        const daycare = session === "AFTERNOON" && period === 5 && ci % 2 === 1; // bán trú
        const si = opening ? 0 : rnd(MON_HOC.length);
        const subject = subjectObj(MON_HOC[si], si);
        const teacher = opening
          ? { id: "st_001", fullName: "—", username: "" }
          : teacherObj(`st_${String(3 + rnd(8)).padStart(3, "0")}`, NHANSU[2 + rnd(6)][0]);
        const room = opening || daycare ? ROOMS[5] : ROOMS[rnd(5)];
        const assignmentId = `ta_${ci}_${si}`;
        timetables.push({
          id: `tt_${ci}_${dow}_${session}_${period}`,
          tenantId: TENANT.id, academicYearId: AY.id, semesterId: SEM.id, campusId: CAMPUS.id,
          classId: cls.id, subjectId: subject.id, teacherId: teacher.id,
          teachingAssignmentId: assignmentId, draftOfId: null, draftAction: null, roomId: room.id,
          status: "PUBLISHED", dayOfWeek: dow, session, period,
          effectiveFrom: AY.startDate, effectiveTo: AY.endDate, isSubstituted: false,
          createdAt: "2026-09-01T02:00:00.000Z", updatedAt: "2026-09-20T02:00:00.000Z",
          class: cls, room, subject, teacher,
          teachingAssignment: {
            id: assignmentId, tenantId: TENANT.id, teacherId: teacher.id, subjectId: subject.id,
            classId: cls.id, academicYearId: AY.id, semesterId: SEM.id, curriculumId: "cur_2018",
            periodsPerWeek: subject.weeklyPeriods, status: "ACTIVE", startDate: AY.startDate, endDate: AY.endDate,
            createdAt: "2026-09-01T02:00:00.000Z", updatedAt: "2026-09-01T02:00:00.000Z", deletedAt: null,
            subject, teacher,
          },
          semester: SEM, academicYear: AY,
        });
      }
    });
  });
});

/* ---------- ghép fixture ---------- */
const fmtPhone = (i) => `09${12 + (i % 8)} *** ${String(100 + i * 13).slice(-3)}`;
const fixture = {
  meta: {
    school: "Trường Tiểu học Minh Châu",
    academicYear: "2026–2027",
    loggedInUser: "Phạm Quang Vinh",
    tenantId: TENANT.id, campusId: CAMPUS.id,
    academicYearId: AY.id, semesterId: SEM.id,
    academicYearRow: AY, semester: SEM,
    campusRow: { ...CAMPUS, code: "CS1", address: "Số 12 phố Giảng Võ, Ba Đình, Hà Nội", isActive: true },
    classId: classRows[0].id, subjectId: "sj_TOAN",
    note: "Dữ liệu giả để chụp ảnh minh hoạ trang giải pháp LMS.",
  },
  workspace: {
    totals: {
      schoolCount: 3, campusCount: 3,
      classCount: schools.reduce((s, x) => s + x.classes, 0),
      studentCount: schools.reduce((s, x) => s + x.students, 0),
      staffCount: schools.reduce((s, x) => s + x.staff, 0),
      attendanceRate: 94.4,
    },
    schools: schools.map((s) => ({
      id: `tenant_${s.code.toLowerCase().replace("th_", "")}`,
      code: s.code, name: s.name, logoUrl: null,
      campusCount: 1, classCount: s.classes, studentCount: s.students, staffCount: s.staff,
      dataStatus: "UP_TO_DATE", status: "ACTIVE",
    })),
    scope: {
      userId: "user_mc_admin",
      allowedTenantIds: ["tenant_mc", "tenant_hp", "tenant_bm"],
      allowedCampusIds: [CAMPUS.id],
      campuses: [{ id: CAMPUS.id, name: CAMPUS.name, tenantId: TENANT.id }],
      rolesByTenant: {}, permissionsByTenant: {}, accessLevelByTenant: {},
      selectedTenantIds: [TENANT.id], selectedCampusIds: [CAMPUS.id],
    },
  },
  students: HOCSINH.map((s, i) => {
    const studentId = `std_${String(i + 1).padStart(3, "0")}`;
    const cls = classRows.find((c) => c.name === s[2]) ?? classRows[0];
    const parent = i < PHUHUYNH.length ? PHUHUYNH[i] : ["Nguyễn Văn An", "Bố", s[0]];
    return {
      id: studentId,
      username: `hs.minhchau.${String(i + 1).padStart(3, "0")}`,
      userCode: `TH_MC-HS${String(i + 1).padStart(3, "0")}`,
      fullName: s[0],
      email: i % 3 === 0 ? `hs.minhchau.${String(i + 1).padStart(3, "0")}@example.com` : null,
      phone: null,
      gender: s[1] === "Nam" ? "MALE" : "FEMALE",
      dateOfBirth: `20${15 + (i % 5)}-${pad2(1 + (i % 9))}-${pad2(3 + (i % 25))}T00:00:00.000Z`,
      placeOfBirth: "Hà Nội",
      nationality: "Việt Nam",
      ethnicity: "Kinh",
      religion: null,
      address: i % 3 === 0 ? `Số ${12 + i} ngõ ${30 + i}, phường Giảng Võ, Hà Nội` : null,
      permanentAddress: null,
      policyCategory: null,
      nationalId: null,
      avatarUrl: null,
      status: i === 16 ? "TRANSFERRED" : "ACTIVE",
      userType: "STUDENT",
      createdAt: "2026-08-25T02:00:00.000Z",
      updatedAt: "2026-09-05T02:00:00.000Z",
      parents: [{
        relationship: parent[1] === "Mẹ" ? "MOTHER" : "FATHER",
        id: `ph_${String((i % PHUHUYNH.length) + 1).padStart(3, "0")}`,
        fullName: parent[0], phone: fmtPhone(i), email: null,
      }],
      enrollments: [{
        id: `en_${String(i + 1).padStart(3, "0")}`, tenantId: TENANT.id, studentId,
        classId: cls.id, academicYearId: AY.id,
        enrollDate: "2026-08-25T00:00:00.000Z", startDate: "2026-09-05T00:00:00.000Z", endDate: null,
        status: i === 16 ? "TRANSFERRED_OUT" : "ACTIVE",
        transferReason: null, reasonCategory: null, admissionType: null, reason: null,
        transferFromClassId: null, transferToClassId: null, note: null,
        createdAt: "2026-08-25T02:00:00.000Z", updatedAt: "2026-09-05T02:00:00.000Z", deletedAt: null,
        class: { id: cls.id, name: cls.name, gradeLevel: cls.gradeLevel },
      }],
      class: { id: cls.id, name: cls.name, gradeLevel: cls.gradeLevel },
      homeroomTeacher: cls.homeroomTeacher,
      parentName: parent[0],
      parentPhone: fmtPhone(i),
    };
  }),
  parents: PHUHUYNH.map((p, i) => ({
    id: `ph_${String(i + 1).padStart(3, "0")}`,
    tenantId: TENANT.id,
    username: `ph.minhchau.${String(i + 1).padStart(3, "0")}`,
    userCode: `TH_MC-PH${String(i + 1).padStart(3, "0")}`,
    fullName: p[0],
    phone: fmtPhone(i),
    email: i % 2 === 0 ? `ph.minhchau.${String(i + 1).padStart(3, "0")}@example.com` : null,
    relationship: p[1] === "Mẹ" ? "MOTHER" : "FATHER",
    userType: "PARENT",
    studentName: p[2],
    studentClass: HOCSINH.find((h) => h[0] === p[2])[2],
    status: "ACTIVE",
  })),
  staff: NHANSU.map((s, i) => ({
    id: `st_${String(i + 1).padStart(3, "0")}`,
    tenantId: TENANT.id,
    username: `gvnv.minhchau.${String(i + 1).padStart(3, "0")}`,
    userCode: `TH_MC-NV${String(i + 1).padStart(3, "0")}`,
    fullName: s[0],
    email: `gvnv.minhchau.${String(i + 1).padStart(3, "0")}@example.com`,
    phone: i % 3 === 0 ? fmtPhone(i) : null,
    userType: i === 0 ? "ADMIN" : i === 8 ? "ACCOUNTANT" : "TEACHER",
    status: "ACTIVE",
    staffProfile: {
      position: s[1],
      qualification: s[3],
      contractType: s[4].includes("Xác định") ? "FIXED_TERM" : "INDEFINITE",
      joinDate: `20${12 + (i % 13)}-${pad2(1 + (i % 12))}-05T00:00:00.000Z`,
      department: { name: s[2] },
      campus: { id: CAMPUS.id, name: CAMPUS.name },
    },
  })),
  classes: classRows,
  gradeBlocks: [1, 2, 3, 4, 5].map((lv) => ({
    id: `gb_${lv}`, tenantId: TENANT.id, level: lv, name: `Khối ${lv}`, maxStudents: 35,
    classCount: LOP.filter((l) => l[1] === lv).length,
    studentCount: LOP.filter((l) => l[1] === lv).length * 21,
    createdAt: "2026-08-20T02:00:00.000Z", updatedAt: "2026-09-01T02:00:00.000Z", deletedAt: null,
  })),
  subjects: MON_HOC.map((m, i) => ({
    id: `sj_${m[0]}`, tenantId: TENANT.id, code: m[0], name: m[1],
    gradeLevel: (i % 5) + 1, subjectType: i % 4 === 3 ? "ELECTIVE" : "REQUIRED",
    evaluationType: m[0] === "ANH" || m[0] === "TIN" ? "COMMENT" : "COMMENT",
    weeklyPeriods: 2 + (i % 3), departmentId: `dep_${(i % 4) + 1}`,
    createdAt: "2026-08-20T02:00:00.000Z", updatedAt: "2026-09-01T02:00:00.000Z", deletedAt: null,
  })),
  tt27Comments: TT27.map((t, i) => {
    const student = HOCSINH.findIndex((h) => h[0] === t[0]);
    const cls = classRows.find((c) => c.name === HOCSINH[student][2]) ?? classRows[0];
    return {
      id: `cm_${String(i + 1).padStart(3, "0")}`,
      tenantId: TENANT.id,
      studentId: `std_${String(student + 1).padStart(3, "0")}`,
      classId: cls.id,
      subjectId: "sj_TOAN",
      term: 1,
      content: t[2],
      level: t[1],
      teacherId: cls.homeroomTeacherId,
      academicYearId: AY.id,
      createdAt: iso(6 + i), updatedAt: iso(6 + i),
    };
  }),
  commentTemplates: MON_HOC.slice(0, 6).flatMap((m, si) =>
    [
      ["Hoàn thành tốt các yêu cầu", "Em chăm làm bài và chủ động phát biểu xây dựng bài."],
      ["Có tiến bộ rõ so với đầu kỳ", "Em đã có tiến bộ rõ rệt so với đầu kỳ."],
      ["Cần rèn thêm kỹ năng trình bày", "Em cần rèn thêm kỹ năng trình bày và viết chữ."],
      ["Chưa hoàn thành", "Em cần hoàn thành đầy đủ bài tập về nhà và ôn lại bài cũ."],
    ].map(([label, text], i) => ({ id: `ct_${si}_${i}`, tenantId: TENANT.id, subjectName: m[1], label, text }))
  ),
  lessonPlans: LESSON_PLANS.map((lp, i) => {
    const status = lp[3] === "Đã duyệt" ? "APPROVED" : lp[3] === "Đang trình duyệt" ? "PENDING" : "DRAFT";
    const teacherId = `st_${String(3 + (i % 8)).padStart(3, "0")}`;
    const lesson = {
      id: `les_${String(i + 1).padStart(3, "0")}`, title: lp[1], weekNumber: (i % 5) + 1,
      orderIndex: i + 1, objectives: "Nắm được kiến thức trọng tâm của bài.",
      curriculum: { id: "cur_2018", name: "Chương trình GDPT 2018" },
    };
    const teacher = { id: teacherId, fullName: lp[2], username: `gvnv.minhchau.${teacherId.replace("st_", "")}` };
    return {
      id: `lp_${String(i + 1).padStart(3, "0")}`, tenantId: TENANT.id,
      lessonId: lesson.id, teacherId,
      title: lp[0],
      content: "<p>Nội dung bài dạy, hoạt động của giáo viên và học sinh.</p>",
      objectives: "Kiến thức, năng lực, phẩm chất theo yêu cầu cần đạt.",
      materials: "Sách giáo khoa, phiếu học tập, máy chiếu.",
      activities: "Khởi động – Hình thành kiến thức – Luyện tập – Vận dụng.",
      objectiveKnowledge: null, objectiveCompetency: null, objectiveQuality: null,
      evaluation: null, teachingProcess: null,
      status,
      submittedAt: status === "DRAFT" ? null : iso(4 + (i % 8)),
      approvedAt: status === "APPROVED" ? iso(6 + (i % 8)) : null,
      approvedById: status === "APPROVED" ? "st_001" : null,
      rejectionReason: null,
      createdAt: iso(2 + (i % 8)), updatedAt: iso(6 + (i % 8)),
      lesson, teacher,
      approvedBy: status === "APPROVED" ? { id: "st_001", fullName: "Nguyễn Thanh Hà" } : null,
    };
  }),
  academicRecords: recordRows,
  rooms: ROOMS,
  timetables,

  // Bảng điều khiển /dashboard: app đọc thẳng `inProgress`, `overdue`, `completionRate`
  // (thiếu key → hiện "—"). `counts` không dùng để render nhưng giữ cho đúng shape API.
  taskStats: {
    counts: { students: HOCSINH.length, overdueTasks: 2, classes: LOP.length, assessments: 3 },
    total: 48,
    overdue: 2,
    completionRate: 68,
    onTimeRate: 82,
    inProgress: 6,
    upcoming: 9,
    byDepartment: [],
    byAssignee: [],
  },
  notifications: {
    items: [],
    page: 1, limit: 6, total: 0, totalPages: 0, hasMore: false, nextCursor: null,
    counters: { unreadCount: 0, needsActionCount: 0, overdueCount: 0, waitingCount: 0, completedCount: 0, sentCount: 0, totalCount: 0 },
  },
};

/* ---------- báo cáo hợp nhất liên trường — GET /consolidated-reporting/{dashboard,runs} ----------
 * API trả object thô (KHÔNG có envelope {success,data}). Số liệu khớp `schools` ở trên
 * (học sinh / nhân sự / lớp) để màn tổng quan và màn liên trường nói cùng một câu chuyện. */
const CR_SCHOOLS = schools.map((s, i) => ({ ...s, id: `school_${s.code.toLowerCase()}`, attendance: [97.6, 96.8, 98.1][i], collection: [94.2, 89.5, 91.8][i], billed: s.students * 4_850_000, assets: [312, 205, 118][i], meals: s.students * 21 - [14, 9, 6][i] }));
const sum = (k) => CR_SCHOOLS.reduce((t, s) => t + s[k], 0);
// [mã, tên hiển thị (app lấy `name` làm tiêu đề thẻ/bảng), nhóm, đơn vị, giá trị theo trường]
const CR_METRICS = [
  ["STUDENT_CURRENT_HEADCOUNT", "Tổng số học sinh", "STUDENT", "học sinh", (s) => s.students],
  ["TOTAL_STAFF", "Tổng nhân sự", "STAFF", "người", (s) => s.staff],
  ["CLASS_COUNT", "Số lớp đang hoạt động", "ACADEMIC", "lớp", (s) => s.classes],
  ["ATTENDANCE_RATE", "Tỷ lệ chuyên cần", "ACADEMIC", "%", (s) => s.attendance],
  ["FINANCE_COLLECTION_RATE", "Tỷ lệ thu học phí", "FINANCE", "%", (s) => s.collection],
  ["FINANCE_OUTSTANDING_RECEIVABLE", "Còn phải thu", "FINANCE", "VND", (s) => Math.round((s.billed * (100 - s.collection)) / 100 / 1000) * 1000],
  ["FINANCE_OVERDUE_RECEIVABLE", "Khoản quá hạn", "FINANCE", "VND", (s) => Math.round((s.billed * (100 - s.collection)) / 400 / 1000) * 1000],
  ["ASSET_TOTAL_COUNT", "Tài sản được quản lý", "OPERATIONS", "tài sản", (s) => s.assets],
  ["MEAL_ACTUAL_COUNT", "Suất ăn thực tế", "OPERATIONS", "suất", (s) => s.meals],
];
const CR_RUN_ID = "run_2627_t10";
const crSystemValue = (code, fn) => {
  if (code === "ATTENDANCE_RATE" || code === "FINANCE_COLLECTION_RATE") {
    const w = sum("students");
    return Math.round((CR_SCHOOLS.reduce((t, s) => t + fn(s) * s.students, 0) / w) * 10) / 10;
  }
  return CR_SCHOOLS.reduce((t, s) => t + fn(s), 0);
};
const crResults = CR_METRICS.flatMap(([code, name, domain, unit, fn], m) => {
  const def = { id: `md_${m}`, code, name, domain, unit };
  const row = (schoolId, value, recordCount) => ({
    id: `res_${m}_${schoolId ?? "all"}`, runId: CR_RUN_ID, metricDefinitionId: def.id, schoolId,
    rawValue: value, adjustmentValue: 0, eliminationValue: 0, consolidatedValue: value,
    numerator: null, denominator: null, recordCount, duplicateCount: 0,
    sourceSystem: "INTERNAL_LMS", sourceSystemId: null, connectorId: null,
    lastSuccessfulSyncAt: "2026-10-12T22:00:00.000Z", dataFreshnessStatus: "UP_TO_DATE", reconciliationStatus: "MATCHED",
    reconciliationRunId: null, details: null, status: "OK", calculatedAt: "2026-10-12T22:05:00.000Z", metricDefinition: def,
  });
  return [
    ...CR_SCHOOLS.map((s) => row(s.id, fn(s), s.students + m * 7)),
    row(null, crSystemValue(code, fn), sum("students") + m * 21),
  ];
});
const crSchoolStatuses = CR_SCHOOLS.map((s, i) => ({
  id: `rss_${i}`, runId: CR_RUN_ID, schoolId: s.id, dataStatus: "UP_TO_DATE", validationStatus: i === 1 ? "WARNING" : "PASSED",
  lastSourceUpdatedAt: "2026-10-12T21:40:00.000Z", sourceRecordCount: s.students * 12 + s.staff * 4, sourceSystem: "INTERNAL_LMS",
  sourceSystemId: null, connectorId: null, lastSuccessfulSyncAt: "2026-10-12T22:00:00.000Z", lastAttemptAt: "2026-10-12T22:00:00.000Z",
  freshnessThresholdMinutes: 1440, reconciliationStatus: "MATCHED", reconciliationRunId: null,
  warningCount: i === 1 ? 1 : 0, errorCount: 0, includedInResult: true, createdAt: "2026-10-12T22:00:00.000Z",
  school: { id: s.id, code: s.code, name: s.name, status: "ACTIVE" },
}));
const crRunBase = (version, status, day, month = 10) => ({
  id: version === 3 ? CR_RUN_ID : `run_2627_v${version}`, tenantId: "tenant_group", reportingScopeId: "scope_lien_truong", academicYearId: AY.id,
  periodStart: "2026-09-05", periodEnd: `2026-${pad2(month)}-${pad2(day)}`, reportDate: `2026-${pad2(month)}-${pad2(day)}`, dataAsOf: `2026-${pad2(month)}-${pad2(day)}T22:00:00.000Z`,
  schoolIds: CR_SCHOOLS.map((s) => s.id), status, version, runNumber: `BC-2627-T${month}-0${version}`,
  startedBy: "usr_bgh", startedAt: `2026-${pad2(month)}-${pad2(day)}T22:00:00.000Z`, completedAt: `2026-${pad2(month)}-${pad2(day)}T22:05:00.000Z`,
  publishedAt: status === "PUBLISHED" ? `2026-${pad2(month)}-${pad2(day + 1)}T01:30:00.000Z` : null, publishedBy: status === "PUBLISHED" ? "usr_bgh" : null,
  createdAt: `2026-${pad2(month)}-${pad2(day)}T22:00:00.000Z`, updatedAt: `2026-${pad2(month)}-${pad2(day + 1)}T01:30:00.000Z`, deletedAt: null,
});
const crValidation = {
  id: "val_1", runId: CR_RUN_ID, schoolId: null, ruleCode: "ATTENDANCE_GAP", ruleName: "Thiếu dữ liệu điểm danh",
  severity: "WARNING", status: "OPEN", affectedCount: 2, message: "2 lớp chưa chốt điểm danh ngày 12/10 tại Trường Tiểu học Hoa Phượng.",
  details: null, createdAt: "2026-10-12T22:05:00.000Z",
};
fixture.consolidatedDashboard = {
  run: { ...crRunBase(3, "PUBLISHED", 12), results: crResults, validations: [crValidation], schoolStatuses: crSchoolStatuses },
  metrics: CR_METRICS.map(([code, name, domain, unit, fn]) => ({
    code, name, domain, value: crSystemValue(code, fn), rawValue: crSystemValue(code, fn), eliminationValue: 0,
    numerator: null, denominator: null, unit, status: "OK", sourceSystem: "INTERNAL_LMS", sourceSystemId: null, connectorId: null,
    lastSuccessfulSyncAt: "2026-10-12T22:00:00.000Z", dataFreshnessStatus: "UP_TO_DATE", reconciliationStatus: "MATCHED", reconciliationRunId: null,
    details: { source: "INTERNAL_LMS", schoolIds: CR_SCHOOLS.map((s) => s.id), aggregation: "SUM", sourceBacked: true },
  })),
  validations: [crValidation],
  schoolStatuses: crSchoolStatuses,
};
fixture.consolidatedRuns = [crRunBase(3, "PUBLISHED", 12), crRunBase(2, "COMPLETED_WITH_WARNINGS", 5), crRunBase(1, "PUBLISHED", 28, 9)]
  .map((r) => ({ ...r, schoolStatuses: crSchoolStatuses, snapshots: [], _count: { results: crResults.length, validations: 1 } }));

/* ---------- so sánh liên trường — GET /consolidated-reporting/comparison (object thô) ----------
 * App chọn sẵn `metrics[0]` → đặt "Tỷ lệ chuyên cần" lên đầu để bảng mở ra đã có số liệu ý nghĩa. */
const CMP_ORDER = ["ATTENDANCE_RATE", ...CR_METRICS.map(([code]) => code).filter((c) => c !== "ATTENDANCE_RATE")];
const cmpMetric = (code) => CR_METRICS.find(([c]) => c === code);
const cmpSchool = (s) => ({ id: s.id, code: s.code, name: s.name, status: "ACTIVE" });
fixture.consolidatedComparison = {
  run: { ...crRunBase(3, "PUBLISHED", 12), results: crResults, schoolStatuses: crSchoolStatuses },
  metrics: CMP_ORDER.map((code, i) => {
    const [, name, domain, unit] = cmpMetric(code);
    return { id: `md_cmp_${i}`, code, name, description: name, domain, aggregationType: "SUM", calculationStrategy: "SOURCE", formulaDescription: "", distinctKey: null, unit, includedStatuses: null, excludedStatuses: null, version: 1, status: "ACTIVE", createdAt: "2026-08-01T00:00:00.000Z", updatedAt: "2026-08-01T00:00:00.000Z" };
  }),
  schools: CR_SCHOOLS.map(cmpSchool),
  rows: CR_SCHOOLS.map((s) => ({ school: cmpSchool(s), metrics: Object.fromEntries(CR_METRICS.map(([code, , , , fn]) => [code, fn(s)])) })),
  consolidated: Object.fromEntries(CR_METRICS.map(([code, , , , fn]) => [code, crSystemValue(code, fn)])),
};

const out = path.resolve("scripts/screenshots/fixtures/lms.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(fixture, null, 2));
console.log("wrote", out, "| timetables:", timetables.length, "| students:", fixture.students.length);
