---
id: ai-solution-content
type: feature
status: pending
created: 2026-10-09
---

# Add/Update nội dung Giải pháp AI (Talvra, Box AI, Flycam) + Case Study Óc Eo

## Yêu cầu

Bổ sung + cập nhật nội dung thật (content-driven) cho website NTA, gồm 3 phần:

### 1. Giải pháp AI — AI tùy chỉnh (Custom AI) = Talvra
- Trang "AI tùy chỉnh" (thuộc Module 4: Giải pháp AI, `FR-030`) dùng **nội dung Talvra ở phần A bên dưới** làm nội dung chính.
- Nội dung đã nhúng sẵn (nguồn: `projects/talvra/GAMMA_PROMPT_TALVRA_OVERVIEW.md` — marketing non-technical — và `projects/talvra/README.md` — business context, đã lọc bỏ credentials/infra).

### 2. Giải pháp AI — Box AI + Flycam
- Trang "BoxAI" và "Flycam/Drone" (thuộc `FR-030`) dùng **nội dung ở phần B bên dưới** (proposal AI camera + flycam bản chính thức trình khách 08/10/2026) + dự án **triển khai thực tế tại Đền Bảo Hà** làm nội dung.
- **Đền Bảo Hà:** nếu cần chi tiết hiện trường (số camera, thiết bị, ngày triển khai) → hỏi anh Tuấn Anh confirm, KHÔNG tự bịa số liệu.

### 3. Case Study — Sửa "Số hoá quản lý đào tạo tại Óc Eo"
- Case study Óc Eo hiện tại (`FR-050`) bị ghi là **"Số hoá quản lý đào tạo tại Óc Eo"** → cần **sửa lại** cho đúng context Óc Eo (phần C bên dưới): dự án AI camera + flycam tại khu di tích Óc Eo – Ba Thê.

## Bối cảnh
- Website đang ở giai đoạn khởi tạo spec (chưa build xong phần content thật) — SPECIFICATIONS.md chưa có nội dung cụ thể, chỉ có framework từ BRIEF/BRD.
- `docs/BRD.md` mô tả Module 4 (Giải pháp AI) và Module 6 (Case Study) nhưng chưa có nội dung thật từ các dự án/tài liệu kinh doanh NTA.
- Mục tiêu: đưa content thật (Talvra, AI box/flycam proposal, Óc Eo) vào spec để builder render được trang web hoàn chỉnh.

## Acceptance (bắt buộc)
- [ ] Trang "Giải pháp AI / AI tùy chỉnh" có nội dung Talvra (mô tả platform, template, lợi ích, use case) — đủ để render thật không phải placeholder.
- [ ] Trang "Giải pháp AI / BoxAI" có nội dung từ phần B (kiến trúc, thuật toán, lợi ích, ứng dụng ngành) + đề cập triển khai Đền Bảo Hà.
- [ ] Trang "Giải pháp AI / Flycam" có nội dung flycam từ phần B (DJI Dock 2, phạm vi phủ, thermal, use case).
- [ ] Case Study Óc Eo được **sửa** từ "Số hoá quản lý đào tạo" sang đúng nội dung dự án AI camera + flycam tại khu di tích (phần C), đúng format vấn đề → giải pháp → kết quả.
- [ ] Nội dung song ngữ VI/EN (theo `BRIEF.md`) — tối thiểu bản VI hoàn chỉnh.

## Ghi chú
- **Toàn bộ content nguồn đã nhúng trực tiếp vào file này (phần A/B/C dưới đây).** Agent KHÔNG cần và KHÔNG được truy cập file ngoài repo — máy clone repo về là đủ context để chạy `/change`.
- **Đền Bảo Hà:** chi tiết hiện trường (số camera, thiết bị, ngày triển khai) chưa có → hỏi anh Tuấn Anh confirm trước khi đưa số liệu, KHÔNG tự bịa.
- Đây là change ADDITIVE/MODIFY cho content pages — sau khi spec update cần `spec-publish` + sinh `spec/test-scope/current.json` đúng quy trình.

---

# 📦 CONTENT NGUỒN (nhúng sẵn — dùng làm context duy nhất)

## A. CONTENT TALVRA

### A.1. Talvra Overview — nội dung marketing non-technical (tiếng Anh, phù hợp làm cả bản VI/EN)

**Talvra — Practical AI Assistants for Everyday Businesses**

*Subtitle:* Helping small and medium businesses put a smart, reliable AI assistant to work — fast, without the tech headache.

**The Problem (Why Talvra Exists)**

Most small and medium businesses want to use AI, but they hit the same walls:

- **Too complicated** — building an AI assistant from scratch needs engineers, time, and money most SMEs don't have.
- **Too generic** — off-the-shelf chatbots don't understand their products, customers, or the way they work.
- **Too risky** — owners worry the bot will say the wrong thing, or won't know when to hand a conversation to a real person.
- **Too slow to see value** — big "AI transformation" projects take months before anything useful happens.

*One-line takeaway:* Businesses don't need "more AI." They need an assistant that actually helps, starting next week.

**What Is Talvra? (Plain-Language Definition)**

Talvra is a **platform that creates and runs ready-made AI assistants** for businesses.

Think of it like this:
- Instead of building a car from raw metal, you pick a proven model and drive it out of the showroom.
- Talvra gives businesses a **template** (a support bot, a sales bot, or an ecommerce bot), customizes it to their business, and puts it live on the channels their customers already use — like **Zalo** (Vietnam's most popular messaging app).

*The promise:* Start with one real use case, prove it works, then expand.

**The Talvra Philosophy (How We Think)**

Four simple principles guide everything:

1. **Start small, start real** — launch one assistant for one clear job, not a giant system.
2. **Use templates, not blank pages** — reuse what already works instead of reinventing it every time.
3. **Keep humans in control** — the bot always knows when to hand off to a real person.
4. **Earn the next step** — only expand after the first assistant proves its value.

*Why it matters:* This keeps cost low, risk low, and trust high.

**The Three Assistant Types (Templates)**

Talvra offers three proven "starter" assistants:

- **🎧 Support Assistant** — answers customer questions, handles FAQs, and reduces the load on your support team.
- **💬 Sales Assistant** — greets leads, answers product questions, and helps turn interest into orders.
- **🛒 Ecommerce Assistant** — helps customers browse products, check orders, and complete purchases.

*Key point:* Each one is pre-built and ready to customize — no coding required by the business.

**How It Works (The Customer Journey)**

A simple, guided path from "interested" to "up and running":

1. **Fill a short form** — the business answers a few plain questions about what they need.
2. **Talvra builds the config** — answers are automatically turned into a ready-to-launch setup.
3. **Human review & approval** — a person checks it before anything goes live (safety first).
4. **Launch** — the assistant goes live on the chosen channel (e.g., Zalo).
5. **Monitor & improve** — Talvra keeps an eye on health and performance.
6. **Hand off to the team** — the business's own people take over day-to-day.

*Analogy:* Like ordering a tailored suit — you give your measurements, it gets fitted and checked, then it's ready to wear.

**Where Your Customers Already Are (Channels & Integrations)**

Talvra meets customers on the platforms they already use:

- **Zalo** — Vietnam's leading messaging app (primary channel).
- **KioskViet** — connects with point-of-sale / retail systems.
- **Telegram** — used for testing and backup.

*Takeaway:* No need to force customers onto a new app — the assistant works where conversations already happen.

**What Makes Talvra Different**

- **Fast to value** — go live in days, not months.
- **Built for non-tech users** — a simple form replaces complex setup.
- **Safe by design** — human approval before launch, and clear rules for when the bot hands off to a person.
- **Grows with you** — start with one assistant, add more as you grow.
- **Local-first** — designed around Vietnamese businesses and the tools they use (Zalo, KioskViet).

**Trust, Safety & Control**

Businesses stay in charge the whole time:

- **Human approval** before any assistant goes live.
- **Clear handoff rules** — the bot knows its limits and passes tricky cases to real staff.
- **Permissions are explicit** — the assistant only does what it's allowed to do.
- **Health monitoring** — Talvra watches for issues so problems get caught early.

*Reassurance line:* AI does the repetitive work; people stay in control of what matters.

**Real Progress (Where We Are Today)**

Talvra is past the idea stage — the foundation is built and working:

- ✅ **Foundation complete** — brand, website skeleton, and the three assistant templates are ready.
- ✅ **First pilot customer live** — a real business (Market Ops use case) is already onboarded.
- 🔄 **Now: launch readiness** — polishing the experience and strengthening the onboarding flow.
- ⏳ **Next: productization** — smoother onboarding and rolling out to more pilot customers.

*Message:* This is real and moving — not a concept on paper.

**The Roadmap (Simple View)**

- **Phase 1 — Foundation** ✅ Done: templates, brand, first customer setup.
- **Phase 2 — Launch Readiness** 🔄 In progress: better website, stronger lead capture, smoother provisioning.
- **Phase 3 — Productization** ⏳ Next: easy self-serve onboarding, more pilot rollouts.
- **Phase 4 — Scale** 🚀 Future: more assistant types, more integrations, and an operations dashboard.

**Who It's For**

- **Small & medium businesses** that want AI help without a tech team.
- **Retailers & service businesses** already using Zalo or KioskViet.
- **Owners & managers** who want quick, safe wins — not risky, expensive projects.

**The Vision**

Talvra's goal is simple:

> **Make a capable, trustworthy AI assistant as easy to get as opening a new sales channel.**

Start with one real assistant. Prove the value. Grow from there — one confident step at a time.

**Call to Action**

**Ready to see what an AI assistant could do for your business?**

- Start with one use case.
- Go live in days.
- Keep full control.

---

### A.2. Talvra — Business Context (phần công khai được, đã lọc bỏ credentials/infra)

**Nền tảng**

Talvra là nền tảng tạo và vận hành trợ lý AI riêng cho doanh nghiệp — mỗi bot là một instance chạy trên Docker Swarm, phục vụ một khách hàng cụ thể.

**Luồng đơn hàng với Talvra**

```
Khách → Facebook Fanpage → Nhân viên chat + tư vấn
→ Talvra tạo đơn từ thông tin chat
→ Gửi thẳng vào Cukcuk + CRM
→ Bếp xử lý → Thanh toán → CRM cập nhật
```

**Vai trò Talvra trong hệ sinh thái**

- Talvra = AI assistant trên Facebook Fanpage
- Nhân viên chat với khách, Talvra hỗ trợ tạo đơn
- Đơn được push trực tiếp sang Cukcuk (POS) + CRM
- CRM sync trạng thái từ Cukcuk

**Templates (kiểu bot)**

- `support-bot` — Bot hỗ trợ khách hàng
- `sales-bot` — Bot bán hàng
- `ecommerce-bot` — Bot thương mại điện tử

**Model Providers hỗ trợ**

- `fridayai`
- `openai`
- `aihub-claude`
- `khoapi-dev`

**Channels hỗ trợ**: `telegram` · **Environments**: `staging` / `pilot` / `production`

**API Endpoints (tóm tắt)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/instances` | List all instances |
| GET | `/instances/{id}` | Instance detail |
| GET | `/instances/{id}/logs` | Instance logs |
| POST | `/instances/provision` | Provision new bot |
| PATCH | `/instances/{id}` | Update instance (token, provider) |
| POST | `/instances/{id}/stop` | Stop instance |
| POST | `/instances/{id}/restart` | Restart instance |
| DELETE | `/instances/{id}` | Delete permanently |

**Provision Flow (tóm tắt)**

1. Tạo workspace & state dirs (copy từ default-origin template)
2. Launch instance trên swarm manager node
3. Attach vào overlay network
4. Add Traefik labels (routing tên miền + TLS Let's Encrypt)
5. Add ALLOWED_ORIGINS (CORS)
6. Approve device pairing (lần đầu login)

**Mount Points & Persistent Config**

| Mount | Purpose |
|-------|---------|
| `/root/.openclaw/workspace` | Workspace (bind mount từ host) |
| `/root/.openclaw/state` | State: devices + cron jobs (bind mount) |
| `/var/lib/openclaw/data` | Data persistence (named volume) |
| `/var/lib/openclaw/state` | State persistence (named volume) |

**MCP Tools (công cụ vận hành)**

- Instance Management: `list_instances`, `instance_detail`, `instance_logs`, `restart_instance`, `stop_instance`, `start_instance`, `delete_instance`
- Swarm & Docker: `swarm_services`, `swarm_nodes`, `docker_exec`
- Config & Workspace: `container_config`, `workspace_files`, `read_workspace_file`, `write_workspace_file`
- Debug & Diagnostics: `check_bot_token`, `check_polling_conflict`, `diagnose_409`, `fix_secret_mismatch`, `approve_pairing`, `update_allowed_origins`, `system_health`

**Troubleshooting**

- Telegram 409 Conflict: `diagnose_409(instance_id=...)` → nếu `token_match: false` → `fix_secret_mismatch(...)`; nếu vẫn 409 → stop, đợi 15s, start lại.
- Dashboard Pairing Required: `approve_pairing(instance_id=...)`; nếu origin not allowed → `update_allowed_origins(instance_id=..., origins=[...])`.

---

## B. CONTENT BOX AI + FLYCAM (proposal v3 — 08/10/2026, bản trình khách)

**Giải pháp Tổng hợp An ninh AI: Camera cố định + AI Box + Flycam tuần tra** — Đơn vị tư vấn & triển khai: NTA | Bản v3 (trình khách hàng)

### B.1. Tóm tắt điều hành

Giải pháp kết hợp ba tầng công nghệ trong một hệ thống điều hành thống nhất:

- **Tầng Camera cố định + AI Box (NVIDIA Jetson):** xử lý AI tại biên với 21 thuật toán và 3 tính năng nền, gồm phát hiện xâm nhập, đào trộm, đánh nhau, hành vi vi phạm, cháy/khói, nhận diện biển số Việt Nam, động vật xâm nhập, phá hoại, vũ khí, đếm người, tụ tập đông người, vô hiệu hóa camera, vạch ranh giới ảo, danh sách khuôn mặt, bám đuổi tự động bằng PTZ, phát hiện drone lạ.
- **Tầng Flycam tự động (DJI Dock 2 + Matrice 3TD):** trạm bay không người vận hành tại chỗ, phủ bán kính làm việc hiệu quả 6 km (tối đa 10 km), thời gian sẵn sàng cất cánh khoảng 45 giây, tuần tra theo lịch và route waypoint thiết kế sẵn, phản ứng sự kiện từ 1–2 phút trong bán kính 1 km.
- **Tầng Trung tâm điều hành (VMS):** một dashboard duy nhất hiển thị camera, drone, bản đồ, route bay và luồng cảnh báo thống nhất; hỗ trợ quy đổi tọa độ từ camera sang GPS để điều phối drone xác minh hiện trường.

Ưu thế cốt lõi: camera nhiệt phát hiện cháy sớm và nhận diện người/xâm nhập vào ban đêm; flycam phủ các khu vực camera cố định không tiếp cận được; khảo sát 3D phục vụ bảo tồn; hỗ trợ chỉ huy chữa cháy.

NTA cung cấp dịch vụ trọn gói: thiết bị, thiết kế route bay, tích hợp hệ thống, hồ sơ pháp lý bay, đào tạo vận hành, bảo hành và cam kết SLA.

### B.2. Kiến trúc tổng thể

```
[Camera cố định + AI Box (Jetson)]        [Trạm DJI Dock 2 + Matrice 3TD]
  · 21 thuật toán + 3 tính năng nền         · route bay + lịch tự động
  · 16 kênh decode/box (theo ngân sách AI)  · thermal 640x512 → 1280x1024 UHR
        |                                          |
        v                                          v
[Event bus MQTT/TLS + Webhook]  <-- trigger -- [DJI FlightHub 2 / Cloud API]
        |                                          |
        +---------------------+--------------------+
                              v
        [Trung tâm điều hành - VMS + Dashboard]
        · Live view: camera + drone trên một màn hình
        · Bản đồ: camera + vùng bay + route + sự kiện
        · Một luồng cảnh báo thống nhất (AI box hoặc drone)
        · Quy đổi tọa độ: pixel camera -> GPS để điều phối drone
        · Điều khiển: loa/đèn drone, chỉnh route, xem ảnh nhiệt
```

**Nguyên tắc vận hành:**

- AI xử lý tại biên (box đặt cạnh camera) nhằm giảm tải băng thông và duy trì cảnh báo cục bộ khi mất kết nối trung tâm.
- Flycam đóng vai trò bổ trợ - "mắt di động" - không thay thế camera cố định, tập trung phủ các khu vực camera yếu và phản ứng nhanh khi có sự kiện.
- Trigger chéo có kiểm soát: khi AI box phát hiện sự kiện đạt tiêu chuẩn, hệ thống tự động ra lệnh trạm mở nắp và drone bay tới tọa độ.
- Pipeline chuẩn: RTSP → NVDEC → TensorRT (INT8) → tracker → event MQTT/TLS → trung tâm.

### B.3. Phần cứng Camera và AI Box

| Hạng mục | Cấu hình | Ghi chú |
|---|---|---|
| Camera IP | 4MP/8MP, H.265, ONVIF S/G, IR ban đêm, WDR, IP66/67 | Camera cố định kết hợp PTZ tại điểm trọng yếu và camera 360 độ tại khu vực tập trung |
| AI Box chủ lực | NVIDIA Jetson Orin NX 16GB Super - 157 TOPS, decode 18 luồng 1080p30 | 16 kênh 1080p decode/box (khả năng AI theo ngân sách) |
| AI Box phụ (cụm 4–8 camera) | Jetson Orin Nano Super - 67 TOPS | Tối ưu chi phí cho cụm nhỏ |
| Camera 8MP (4K) | 4 camera 8MP full AI/box (H.265) | Giới hạn bởi NVDEC decode, không phải năng lực AI |
| Phần mềm | DeepStream SDK: RTSP → NVDEC → TensorRT INT8 → tracker → MQTT/Webhook | Benchmark thực địa lấy mAP/latency làm căn cứ hồ sơ |

### B.4. Ngân sách thuật toán theo kênh

| Loại kênh | Thuật toán chạy | Mức tải | Số kênh tối đa/box (ước tính) |
|---|---|---|---|
| Kênh nhẹ | Detect (người/xe/động vật) + track + intrusion | Nhẹ | 16 kênh |
| Kênh trung bình | Kênh nhẹ + cháy/khói, tampering, tripwire, ANPR (1 luồng/kênh) | Trung bình | 8–12 kênh |
| Kênh nặng | Kênh trung bình + pose (hành vi vi phạm) hoặc action (đánh nhau) hoặc face | Nặng | 4–6 kênh |
| Kênh rất nặng | face + weapon + ANPR + action đồng thời (2–3 thuật toán nặng) | Rất nặng | 2–4 kênh |

Lưu ý: các con số trên là ước tính thiết kế và phải được kiểm chứng bằng benchmark thực địa (mAP và latency theo từng tổ hợp) trước khi đưa vào hồ sơ. Không cam kết "16 kênh chạy đủ 21 thuật toán".

Phân bổ đề xuất cho một box 16 kênh: 8 kênh nhẹ (bao phủ), 4 kênh trung bình (cổng, cháy), 4 kênh nặng (điểm trọng yếu).

### B.5. Danh mục thuật toán (21 thuật toán + 3 tính năng nền)

**Nhóm 1 - Chống phá hoại và trộm cắp**

| # | Thuật toán | Mô tả |
|---|---|---|
| 1 | Chống đào trộm/trộm cắp | Virtual fence + loitering (đứng lâu, cúi, đào bới) tại khu vực tài sản, gò mộ, kho |
| 2 | Camera tampering | Phát hiện camera bị che, xoay, cắt tín hiệu |
| 3 | Object left/removed | Vật lạ để lại; tài sản/hiện vật bị lấy đi |
| 4 | Vandalism/phá hoại | Leo trèo, đập phá, cắt rào, khắc vẽ (pose + action) |
| 5 | Scene/soil disturbance | Thay đổi nền đất (đào xới dù được ngụy trang) - so sánh baseline dài hạn |

**Nhóm 2 - An toàn cháy nổ và sự cố**

| # | Thuật toán | Mô tả |
|---|---|---|
| 6 | Fire detection | Phát hiện lửa, cảnh báo dưới 10 giây kể từ khi lửa xuất hiện trong khung hình |
| 7 | Smoke detection | Phát hiện khói từ xa, sớm hơn lửa |
| 8 | Audio analytics | Mic kết hợp AI nhận diện tiếng nổ, đục đẽo, máy cắt, la hét - bù điểm mù ban đêm |

**Nhóm 3 - Trật tự xã hội**

| # | Thuật toán | Mô tả |
|---|---|---|
| 9 | Fight detection | Phát hiện đánh nhau, bạo lực |
| 10 | Hành vi vi phạm | Pose + ROI: dừng lại tại khu vực cấm, tư thế bất thường |
| 11 | Crowd detection | Phát hiện tụ tập đông người bất thường |

**Nhóm 4 - Kiểm soát ra vào**

| # | Thuật toán | Mô tả |
|---|---|---|
| 12 | People detection + counting | Đếm người, luồng vào/ra |
| 13 | Vehicle + tracking | Phát hiện ô tô, xe máy vào khu vực nội bộ |
| 14 | ANPR biển số Việt Nam | Nhận diện biển số (huấn luyện riêng theo tiêu chuẩn VN) |
| 15 | Line crossing/tripwire | Vạch ranh giới ảo |
| 16 | Face whitelist/blacklist | Nhân viên (whitelist); người lạ xuất hiện lặp lại (blacklist) |

**Nhóm 5 - Xâm nhập và môi trường**

| # | Thuật toán | Mô tả |
|---|---|---|
| 17 | Intrusion/xâm nhập ban đêm | Giám sát vùng cấm 24/7, tăng độ nhạy IR ban đêm |
| 18 | Animal detection | Phát hiện trâu, bò, chó, lợn xâm nhập |
| 19 | Drone detection | Phát hiện flycam quay phim, khảo sát trái phép (bằng camera thường) |

**Nhóm 6 - Điều tra và cao cấp**

| # | Thuật toán | Mô tả |
|---|---|---|
| 20 | PTZ auto-track | Camera PTZ bám đối tượng nghi vấn liên tục |
| 21 | Weapon detection | Phát hiện hung khí (dao, súng); độ chính xác giảm ở khoảng cách xa |

**Ba tính năng nền (tính năng hệ thống, không phải thuật toán AI):**

| Tính năng | Vai trò |
|---|---|
| Analytics dashboard | Heatmap, thống kê sự kiện theo vùng, báo cáo tuần |
| Deterrent/cảnh báo tại chỗ | AI kích hoạt đèn pha, còi, loa nhắc tự động |
| Smart search/forensics | Truy xuất clip theo đặc điểm (màu áo, biển số, khu vực, mốc thời gian) |

Gói thuật toán theo từng ngành: **Phụ lục A (Di tích)**, **Phụ lục B (Rừng/Kiểm lâm)**, **Phụ lục C (KCN/Kho bãi)** — chi tiết ở B.10.

### B.6. Tầng Flycam: thiết bị và thời gian phản ứng thực tế

**Cấu hình thiết bị (kiểm chứng tháng 10/2026):**

| Hạng mục | Thông số |
|---|---|
| Trạm bay | DJI Dock 2: tự cất/hạ cánh, sạc pin 20% → 90% trong 32 phút |
| Drone | DJI Matrice 3TD: camera nhiệt 640x512 → 1280x1024 UHR, zoom 28x, camera góc rộng 48MP, camera tele 12MP |
| Thời gian bay | 50 phút (không gió); một chuyến bay thực tế an toàn 35–40 phút |
| Tốc độ | Tối đa 21 m/s (Sport); khoảng 15 m/s khi thực hiện nhiệm vụ |
| Khả năng chịu gió | Vận hành ≤ 12 m/s; cất/hạ cánh ≤ 8 m/s (trạm tự chặn nếu vượt) |
| Bán kính | Điều khiển tối đa 10 km; bán kính làm việc hiệu quả 6 km (đủ pin đi, về và quan sát) |
| Thời gian sẵn sàng | Cất cánh sau lệnh khoảng 45 giây |
| Định vị | RTK kép, độ chính xác 3 cm |
| Phần mềm | DJI FlightHub 2 / Cloud API, tích hợp VMS |

**Thời gian phản ứng từ lúc nhận cảnh báo đến khi drone tới điểm (tốc độ 15 m/s + 45 giây cất cánh):**

| Khoảng cách từ trạm | Thời gian bay | Cộng cất cánh | Tổng thời gian |
|---|---|---|---|
| 0,5 km | 0,6 phút | 0,75 phút | 1,5 phút |
| 1 km | 1,1 phút | 0,75 phút | 2 phút |
| 3 km | 3,3 phút | 0,75 phút | 4 phút |
| 6 km | 6,7 phút | 0,75 phút | 7–8 phút |
| 10 km | 11,1 phút | 0,75 phút | 12 phút |

Lưu ý: cam kết "phản ứng 1–2 phút" chỉ áp dụng trong bán kính khoảng 1 km quanh trạm. Ngoài phạm vi này, thời gian tăng theo bảng trên. Khi thiết kế route và vị trí đặt trạm phải tính cả thời gian đi, về và quan sát, giữ pin hạ cánh ở mức tối thiểu 20%.

### B.7. Diện tích phủ: phân biệt ba khái niệm

| Khái niệm | Cách tính | Ước tính | Mục đích sử dụng |
|---|---|---|---|
| Vùng có thể với tới | Diện tích hình tròn theo bán kính làm việc | Bán kính 6 km ≈ 11.300 ha; bán kính 10 km ≈ 31.400 ha | Xác định vùng drone có thể tiếp cận (không đồng nghĩa với quét sạch) |
| Diện tích quét mỗi chuyến | Phụ thuộc độ cao, tốc độ, bề rộng ảnh, thời gian bay | 300–500 ha/chuyến (độ cao 80–120 m) | Tính số chuyến cần thiết để phủ vùng ưu tiên |
| Diện tích quét mỗi ngày | Số chuyến/ngày × diện tích/chuyến | Cấp I: 1–2 chuyến ≈ 300–1.000 ha/ngày; cấp III: 3–4 chuyến ≈ 900–2.000 ha/ngày | Cam kết năng lực phủ theo ngày trong hồ sơ |

Khi chào hàng, ghi rõ: một trạm với tới khoảng 11.300 ha, quét 300–500 ha mỗi chuyến, và diện tích quét mỗi ngày phụ thuộc cấp dự báo cháy theo lịch.

### B.8. Route bay và lịch tuần tra theo cấp dự báo cháy

**Bốn loại route bay:**

| Route | Mục đích | Đặc điểm |
|---|---|---|
| A - Tuần tra thường lệ | Giám sát tổng thể | Waypoint cố định dọc ranh giới, đường mòn, bìa rừng, hàng rào |
| B - Trọng điểm giờ cao điểm | Nguy cơ cháy/xâm nhập cao | Tập trung vùng ưu tiên cao lúc 10h–15h, chụp ảnh nhiệt theo chu kỳ |
| C - Tuần tra ban đêm bằng nhiệt | Đốt nương, xâm nhập, trộm cắp | Bay 19h–23h bằng camera nhiệt; bay đêm có thể yêu cầu phép riêng |
| D - Phản ứng sự kiện | Xác minh cảnh báo AI | Bay tới tọa độ sự kiện |

**Chu kỳ hoạt động thực tế của một trạm:**

| Bước | Thời gian |
|---|---|
| Chuyến bay thực tế (giữ biên an toàn pin) | 35–40 phút |
| Sạc pin 20% → 90% | 32 phút |
| Làm mát và kiểm tra trước chuyến | 10–15 phút |
| Chu kỳ trọn vẹn một chuyến | 75–85 phút |

Với một trạm, tối đa khoảng 13–16 chuyến/ngày, tương đương chu kỳ hoạt động khoảng 50%. Phương án "bay liên tục, cách hai giờ một chuyến suốt đêm" không khả thi với một trạm.

**Lịch bay theo cấp dự báo cháy (I–V):**

| Cấp cháy | Số chuyến/ngày | Khung giờ | Route | Yêu cầu hạ tầng |
|---|---|---|---|---|
| I - Thấp | 1–2 | Sáng, chiều | A | 1 trạm |
| II - Trung bình | 2–3 | 7h, 11h, 15h | A + B | 1 trạm |
| III - Cao | 3–4 | 6h, 10h, 13h, 16h | A + B + C | 1 trạm |
| IV - Nguy hiểm | 5–6 | 6h, 9h, 12h, 14h, 16h, 20h | A + B tăng cường + C + D chờ lệnh | 1 trạm kèm pin/drone dự phòng hoặc 2 trạm |
| V - Cực kỳ nguy hiểm | 8–12 | Phủ gần trọn ngày + đêm chọn lọc | Luân phiên liên tục + D ưu tiên | Bắt buộc 2 trạm phủ chồng |

**Quy tắc ưu tiên khi có sự kiện (Route D):**

1. Sự kiện nguy hiểm (cháy, xâm nhập có người) được ưu tiên ngắt tuần tra hiện tại, chuyển drone tới sự kiện.
2. Nếu drone đang bay xa hoặc pin dưới 30%, không chuyển hướng; điều động đội ứng trực qua ứng dụng và dùng drone sau khi hạ cánh nạp pin.
3. Luôn dự trữ tối thiểu một bộ pin sạc đầy cho tình huống khẩn cấp.

### B.9. Bộ lọc trigger (kiểm soát việc phóng drone tự động)

| Tiêu chí | Quy định |
|---|---|
| Loại sự kiện được phóng | Ưu tiên: cháy/khói, xâm nhập vùng cấm, đào trộm, đánh nhau (theo phụ lục ngành) |
| Ngưỡng tin cậy | Từ 0,6 đối với sự kiện thông thường; từ 0,5 đối với cháy (ưu tiên tốc độ) |
| Xác nhận kép | Sự kiện được hai khung hình hoặc hai camera xác nhận liên tiếp trong 3–5 giây, hoặc một khung hình kết hợp người trực xác nhận (chế độ có kiểm soát) |
| Thời gian chờ giữa các lần phóng | Tối thiểu 5 phút cho cùng loại sự kiện tại cùng khu vực |
| Giờ cấm phóng (tùy chọn) | Có thể cấu hình không tự phóng ban đêm nếu chưa có phép bay đêm |
| Ghi nhật ký | Mọi lần phóng/không phóng đều ghi lý do để đối soát |

Người trực vẫn là người quyết định cuối cùng khi hệ thống cấu hình chế độ cần xác nhận. Chế độ tự động hoàn toàn chỉ kích hoạt sau 3–6 tháng vận hành ổn định.

### B.10. Khung chi phí và phụ lục theo ngành

**Phụ lục A - Ngành Di tích** (tham chiếu quy mô: khu di tích ~433 ha, ~200 điểm camera, di tích quốc gia đặc biệt):

- **Rủi ro chính:** đào trộm khảo cổ (ưu tiên số 1: gò mộ, kênh cổ, hoạt động về đêm); phá hoại di tích, khắc vẽ, đập phá; cháy đồng ruộng mùa khô; gia súc xâm nhập gây hư hại gò mộ; trộm hiện vật tại kho, khu vực lễ hội đông người.
- **Gói thuật toán bắt buộc:** đào trộm, tampering, fire, smoke, hành vi vi phạm, đếm người, xâm nhập đêm, động vật (+ dashboard, cảnh báo tại chỗ).
- **Phương án flycam:** Route C ban đêm (19h–23h) quét khu vực gò mộ và kênh cổ bằng camera nhiệt; Route D xác minh khi AI phát hiện đào trộm. Khảo sát 3D phục vụ bảo tồn bằng Matrice 3D/DJI Terra, so sánh định kỳ 6 tháng. Cấu hình đề xuất: một trạm Dock 2 kèm Matrice 3TD đủ phủ 433 ha; khuyến nghị thêm một drone vận hành thủ công (Mavic 3 Enterprise).
- **Khung chi phí:** camera + AI box (200 camera) khoảng 1,5–3,4 tỷ đồng; flycam một trạm hoàn chỉnh khoảng 550–700 triệu; tổng gói ~2,1–4,1 tỷ (chưa VAT, chưa hạ tầng mạng lớn).

**Phụ lục B - Ngành Rừng và Kiểm lâm** (ban quản lý rừng, chi cục kiểm lâm, vườn quốc gia, khu bảo tồn, PCCCR cấp tỉnh):

- **Rủi ro chính:** cháy rừng (mùa khô, đốt nương, cấp I–V); khai thác gỗ trái phép; đốt nương ban đêm; mất rừng, sạt lở.
- **Phương án flycam:** phân vùng ưu tiên P1/P2/P3 theo rủi ro cháy; 4 loại route A/B/C/D; đặc thù rừng núi dùng RTK + waypoint offline; hỗ trợ chữa cháy (dẫn đường đội chữa cháy, đánh giá hướng lan, kiểm tra tàn dư). Cấu hình: khu nhỏ vài trăm ha dùng 1 trạm; 1.000–2.000 ha dùng 2 trạm; rừng lớn từ 3 trạm hoặc máy bay tầm xa (Matrice 30T, M350 RTK).
- **Khung chi phí:** một trạm ~550–700 triệu; hai trạm ~1,1–1,5 tỷ.

**Phụ lục C - Ngành KCN, kho bãi, doanh nghiệp:**

- **Rủi ro chính:** xâm nhập/trộm cắp ban đêm (ưu tiên số 1); cháy nổ kho bãi; mất trật tự (đánh nhau, tụ tập, trộm nội bộ); phá hoại tài sản, vô hiệu hóa camera; quản lý ra vào.
- **Phương án flycam:** Route A tuần tra vành đai và mái kho 2–3 lần mỗi đêm; Route D xác minh sự kiện AI; quét nhiệt mái/nóc kho phát hiện điểm nóng sớm. Một trạm phủ KCN vừa (50–100 ha); khu lớn dùng 2 trạm.
- **Khung chi phí:** camera + AI box (50–100 camera) ~500 triệu – 1,5 tỷ; flycam một trạm ~550–700 triệu.

**Chi phí tham khảo thiết bị (giá quốc tế, kiểm chứng 10/2026, chưa VAT/thuế NK):**

| Hạng mục | Giá (USD) | Quy đổi VNĐ |
|---|---|---|
| Bundle DJI Dock 2 + Matrice 3TD | ~16.000 | ~416 triệu |
| Bundle Dock 2 + Matrice 3D | ~14.000 | ~364 triệu |
| DJI Dock 2 (mua rời) | 10.490 | ~273 triệu |
| Matrice 3TD (mua rời) | 8.000 | ~208 triệu |
| Matrice 3D (mua rời) | 5.500–6.000 | ~143–156 triệu |
| Mavic 3 Enterprise (vận hành thủ công) | 4.509 | ~117 triệu |
| Mavic 3 Thermal | 9.559 | ~248 triệu |
| DJI Care Enterprise | 300–600/năm | ~8–16 triệu |

**Trọn gói một trạm hoạt động tại Việt Nam:** ~550–700 triệu (bundle + thuế NK 10–20% + VAT + lắp đặt 30–80 triệu + tích hợp FlightHub 2/Cloud API).

**TCO vận hành hằng năm (một trạm + một cụm box):** đường truyền 5–15 triệu; điện 3–8 triệu; thay pin drone 8–15 triệu; bảo trì trạm 10–20 triệu; bảo hiểm UAV 5–30 triệu; bảo hành mở rộng 10–20 triệu → **tổng 40–110 triệu/năm (chưa nhân sự)**.

### B.11. Năng lực triển khai của NTA

- Dịch vụ trọn gói: thiết bị, tích hợp VMS/AI, hồ sơ pháp lý bay, đào tạo, bảo hành và cam kết SLA.
- Sẵn sàng hệ AI Box (Jetson) với 21 thuật toán, tự chủ mã nguồn, giấy phép sạch (Apache 2.0 hoặc tự huấn luyện), số liệu benchmark thực địa.
- Một dashboard thống nhất cho camera và drone, trigger chéo có kiểm soát.
- Hồ sơ chuẩn cho khách hàng nhà nước: cấp độ an toàn thông tin (Nghị định 85/2016), bảo vệ dữ liệu cá nhân (Nghị định 13/2023), pháp lý bay (Nghị định 288/2025 và 222/2026), nghiệm thu theo kịch bản kiểm thử.
- Nội địa hóa đúng phạm vi: AI box, phần mềm và tích hợp thực hiện tại Việt Nam; có phương án thiết bị thay thế cho cơ quan nhạy cảm (UAV Viettel High Tech hoặc hãng khác theo khảo sát — chỉ thay SDK điều khiển, kiến trúc phần mềm giữ nguyên).

### B.12. Lộ trình triển khai (4–12 tuần)

| Tuần | Nội dung |
|---|---|
| 1 | Khảo sát hiện trường: vị trí camera, trạm (nguồn điện, mạng, tầm nhìn), ranh giới, phân vùng rủi ro, vùng bay được phép |
| 2 | Báo giá thiết bị (đại lý DJI tại Việt Nam), chốt cấu hình, chuẩn bị hồ sơ pháp lý bay (gồm xác nhận BVLOS và bay đêm) |
| 3–4 | Nhập hàng, lắp đặt hạ tầng (cột, mạng, điện, điện mặt trời, chống sét), lắp đặt camera và box (kèm giải pháp tản nhiệt) |
| 4–6 | Cài đặt DeepStream và mô hình (giấy phép sạch); thiết kế bộ route bay (waypoint GPX/KMZ) theo phân vùng và lịch cấp cháy |
| 6–8 | Cấu hình FlightHub 2 (On-Premise nếu khách hàng nhà nước), tích hợp VMS/Cloud API, trigger chéo, quy đổi tọa độ camera sang GPS; vận hành thử cụm 20–30 camera, tinh chỉnh cảnh báo sai, benchmark mAP/latency |
| 8–10 | Mở rộng toàn bộ; đào tạo vận hành (giấy phép điều khiển), quy trình xử lý cảnh báo và phân cấp leo thang |
| 10–12 | Nghiệm thu theo kịch bản kiểm thử, bàn giao hồ sơ pháp lý và an toàn thông tin, vận hành chính thức, bảo hành và SLA |

### B.13. Chỉ số KPI tóm tắt

| Chỉ số | Mục tiêu |
|---|---|
| Độ trễ phát hiện cháy (từ khi xuất hiện trong khung hình) | Dưới 10 giây |
| Thời gian phát hiện cháy tổng thể (từ lúc phát cháy) | 10–15 phút trong vùng quét theo lịch |
| Thời gian phản ứng drone | 1–2 phút trong bán kính 1 km |
| Tỷ lệ cảnh báo sai | Không quá 1–2 lần/camera/ngày sau tinh chỉnh |
| Diện tích quét hằng ngày | Tối thiểu 80% vùng ưu tiên theo cấp cháy |

**Câu hỏi thường gặp (FAQ):**

- **Flycam có thể thay thế camera cố định không?** Không. Flycam bổ trợ: phủ khu vực camera yếu, phản ứng nhanh khi sự kiện, quan sát nhiệt ban đêm, khảo sát 3D.
- **Thời gian phản ứng 1–2 phút áp dụng trong phạm vi nào?** Trong bán kính ~1 km tính từ trạm. Ngoài ra: 3 km ≈ 4 phút, 6 km ≈ 7–8 phút.
- **Trạm bay có cần người trực tại chỗ không?** Không. Trạm tự động cất/hạ cánh và sạc pin. Người vận hành cần giấy phép điều khiển (Nghị định 288/2025) và giám sát từ trung tâm.
- **Khi mất kết nối trung tâm?** Camera và AI box vẫn xử lý và cảnh báo cục bộ. Trạm drone cần Internet/4G để nhận lệnh; khuyến nghị đường truyền dự phòng.
- **Dữ liệu video lưu ở đâu?** Theo yêu cầu khách hàng: On-Premise (khuyến nghị cho khách nhà nước), mã hóa MQTT/TLS, tuân thủ Nghị định 85/2016 và 13/2023.
- **Mùa mưa bão?** Không bay khi mưa hoặc gió >12 m/s. Hệ camera hoạt động 24/7, lịch bay bù tự động.
- **Thời gian triển khai?** 4–12 tuần tùy quy mô, hiện trường và thủ tục pháp lý.

---

## C. CONTENT CASE STUDY ÓC EO (200 camera — AI camera + flycam khu di tích)

### C.1. Bối cảnh

- **Khu di tích Óc Eo – Ba Thê** (huyện Thoại Sơn, An Giang) — Di tích quốc gia đặc biệt (QĐ 1419/QĐ-TTg 2012), quy mô **~433 ha**.
- Khu A: sườn/chân núi Ba Thê (143,9 ha) — chùa Linh Sơn, gò Danh Sáng, kiến trúc cổ.
- Khu B: cánh đồng Óc Eo (289,3 ha) — hệ thống gò mộ, kênh cổ rải rác.
- Rủi ro điển hình: **đào trộm khảo cổ** (ưu tiên số 1 — gò mộ, kênh cổ, hoạt động về đêm), phá hoại di tích (khắc vẽ, đập phá), cháy đồng mùa khô (đốt rơm, đốt đồng), gia súc xâm nhập phá gò mộ, trộm hiện vật tại kho, mất trật tự mùa lễ hội.

### C.2. Giải pháp (kiến trúc 3 tầng, ~200 camera)

```
[200 Camera IP]  →  [Cụm Edge AI Box]  →  [Trung tâm điều hành]
   H.265/ONVIF       Orin NX 16GB × ~13     Server VMS + Analytics
   IR/night vision   (mỗi box 16 kênh)      Dashboard bản đồ, alert
   PTZ điểm quan trọng                      Lưu trữ 30-90 ngày
        │                                        ▲
        └── Mạng cụm (PoE switch) ── Fiber/Wifi bridge/4G ──┘
        └── Nguồn: điện lưới hoặc Solar + pin cho điểm xa
```

**Nguyên tắc thiết kế:**

- **AI xử lý tại biên (edge)** — 200 cam stream về trung tâm sẽ nghẽn mạng; box AI phân tán tại cụm → chỉ gửi event + clip về trung tâm.
- **Chia cụm theo địa lý** — các điểm di tích xa nhau → gom camera gần nhau thành cụm, mỗi cụm 1 box.
- **Pipeline chuẩn DeepStream** — RTSP → NVDEC → TensorRT (INT8) → tracker → event MQTT/Webhook → VMS trung tâm.
- **Nhiều lớp cảnh báo** — AI phát hiện → xác minh (tránh false alarm) → cảnh báo trực tiếp/kích đèn còi → nhân viên.
- **Không phụ thuộc 1 hãng** — module chuẩn (Orin NX), model Apache 2.0 hoặc tự huấn luyện, tự chủ code.

**Tầng 1 — Camera:** Camera IP 4MP/1080p, H.265, ONVIF S/G, IR ban đêm, WDR, IP66/67. Cố định (bao phủ gò/mộ) + PTZ (điểm trọng yếu: cổng, kho hiện vật, chùa) + vài camera 360° (khu vực tập trung). Vị trí: cột cao ~6–10m, tránh khu khai quật nhạy cảm, giữ thẩm mỹ di tích.

**Tầng 2 — Edge AI Box (mỗi cụm):** Box chủ lực **Jetson Orin NX 16GB Super** (157 TOPS, decode 18×1080p30, 16 kênh full AI/box). Số box ~12–13 (200 cam ÷ 16 kênh) + 1 dự phòng nóng. Box phụ cụm nhỏ (4–8 cam) dùng Orin Nano Super (67 TOPS). Case công nghiệp chống bụi/nước/nhiệt, SSD NVMe 1TB, nguồn DC + chống sét.

**Tầng 3 — Trung tâm điều hành:** Server VMS + Analytics (nhận event, tổng hợp, lưu clip sự kiện), dashboard bản đồ 200 cam, lưu trữ 30–90 ngày (chỉ clip sự kiện + snapshot định kỳ), cảnh báo màn hình trung tâm + app mobile + loa/đèn tại chỗ.

**Hạ tầng hỗ trợ:** Mạng: cáp quang trục chính / wifi bridge 5GHz; trong cụm dùng switch PoE. Nguồn: điện lưới; điểm xa → solar + pin lithium (~200–400W/box+cam). Chống sét + chống ẩm: hộp kỹ thuật IP66, quạt tản nhiệt.

### C.3. Chức năng chính (theo gói)

**Gói Cơ bản (CB — bắt buộc, 10 chức năng):** 1 Chống đào trộm khảo cổ (virtual fence + loitering — đứng lâu/cúi/đào) ⭐ · 2 Camera tampering · 6 Fire detection (<10s) · 7 Smoke detection · 10 Đái bậy detection (pose + ROI) · 12 People counting · 17 Intrusion/xâm nhập ban đêm · 18 Animal detection (trâu/bò/chó/lợn) · 20 Deterrent/cảnh báo tại chỗ · 24 Analytics dashboard.

**Gói Tiêu chuẩn (TC — 8 chức năng):** 3 Object left/removed · 4 Vandalism/phá hoại · 8 Audio analytics · 9 Fight detection · 11 Crowd detection · 13 Vehicle + tracking · 14 ANPR biển số VN · 15 Line crossing/tripwire.

**Gói Cao cấp (CC — 6 chức năng, tùy ngân sách):** 5 Scene/soil disturbance · 16 Face whitelist/blacklist · 19 Drone detection · 21 Smart search/forensics · 22 PTZ auto-track · 23 Weapon detection.

### C.4. Kết quả & số liệu từ phương án

- **Quy hoạch cụm:** Núi Ba Thê (Khu A) ~60–70 cam (xâm nhập, phá hoại, cháy, người/phương tiện, ANPR); Cánh đồng Óc Eo (Khu B) ~110–120 cam (**đào trộm**, thú vật, cháy, đái bậy, xâm nhập đêm); cổng + lối vào + trung tâm đón tiếp + kho hiện vật ~15–20 cam (ANPR, đếm người, cháy nổ). Tổng **~200 camera**.
- **Dự toán sơ bộ:** Box AI Orin NX 16GB ~210–280 triệu (12 + 1 dự phòng); camera ~400 triệu – 1 tỷ (200 cam); switch PoE ~80–150 triệu; truyền dẫn liên cụm ~100–250 triệu; solar + pin ~100–300 triệu; server VMS + lưu trữ ~150–300 triệu; công lắp đặt 15–20% phần cứng → **Tổng gói ~1,2–2,5 tỷ đồng** (khung tham khảo, chốt sau khảo sát + báo giá). Kết hợp flycam một trạm DJI Dock 2 + Matrice 3TD (~550–700 triệu) cho phạm vi mở rộng (phụ lục Di tích của proposal v3: tổng ~2,1–4,1 tỷ).
- **Lộ trình 12 tuần:** 1–2 khảo sát + chốt vị trí · 2–3 thiết kế + dự toán + phê duyệt · 3–6 dựng hạ tầng (cột, mạng, điện/solar, chống sét) · 4–8 lắp box + camera, cài DeepStream + model · 6–8 pilot 1 cụm (20–30 cam) chỉnh false alarm + benchmark · 8–10 mở rộng toàn bộ + tích hợp VMS/dashboard · 10–12 nghiệm thu + đào tạo + bàn giao + bảo hành.

### C.5. Điểm mạnh (thuyết phục ban quản lý)

1. **Edge AI phân tán** — phát hiện tại chỗ, không nghẽn mạng, vẫn chạy khi mất kết nối trung tâm.
2. **Chống đào trộm 24/7** — vấn đề đau đầu nhất của di tích khảo cổ.
3. **Cháy phát hiện sớm** — bảo vệ di tích mùa khô.
4. **Đa năng 1 hạ tầng** — 11 nhóm thuật toán trên cùng hệ camera.
5. **Hồ sơ năng lực đẹp** — NVIDIA + DeepStream + benchmark thực địa (khóa HSMT).
6. **Bảo hành + vận hành rõ ràng** — chủ động phần mềm, không lệ thuộc hãng.

### C.6. Nghiên cứu & chuyển giao năng lực (phụ trợ cho case study độ tin cậy)

- **Kế hoạch nghiên cứu 12 tuần** (1–2 dev AI): tuần 1–2 setup lab + pipeline + TensorRT INT8 benchmark; tuần 3–4 detect người/xe/thú + ROI/loitering (PeopleNet/VehicleNet NGC, RT-DETR, YOLO-NAS — Apache 2.0, tránh AGPL); tuần 5 pose (RTMPose) + đái bậy; tuần 6 fire/smoke (DFire + tự train); tuần 7 ANPR biển VN (VietOCR/PaddleOCR); tuần 8 fight + audio (YAMNet/PANNs); tuần 9–12 object removed, face (InsightFace/ArcFace), drone, weapon, tích hợp hệ thống + test 72h.
- **Lộ trình học từ 0 → code AI camera:** Nhánh A (từ số 0, ~3,5–5 tháng): Python → ML cơ bản (fast.ai) → object detection → Jetson/DeepStream (NVIDIA DLI + deepstream_python_apps) → tự train + logic nghiệp vụ (fence + loitering = "tốt nghiệp"). Nhánh B (biết Python ~2,5–4 tháng), Nhánh C (biết Python + ML ~1,5–2 tháng).
- **Bottleneck thật = DATA** (biển VN, gia súc, khói, drone) → thu data ngay từ tuần 1.
- **Nguồn học "ăn tiền":** NVIDIA DLI (Jetson/DeepStream), deepstream_python_apps, fast.ai, LearnOpenCV/PyImageSearch, SuperGradients/RT-DETR, CS50P.
- **Outputs:** BENCHMARK.md (mọi model trên box thật), 6 pipeline model chính, 10 chức năng CB hoàn thiện + 8 TC + 6 CC prototype, tài liệu cài box + tuning, demo thật cho ban quản lý.
