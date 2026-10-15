# Spec Validation Report — CR-037 `contact-form-google-sheet` (PRE-PLAN, round 1)

Agent: spec-validator
Ngày: 2026-10-15 · Spec 4.5.0 · test-scope v55 · Class ADDITIVE · Risk HIGH

**Entry Mode:** partial_docs (spec + change doc + docs as-built + code)
**Sources validated against:**
- `spec/changes/2026-10-15-contact-form-google-sheet.md` (acceptance + quyết định user)
- `git diff SPECIFICATIONS.md` (R-13a, ghi chú R-16, OQ#4, C2, 4.5.0), `spec/updates/2026-10-15-contact-form-google-sheet.md`, `spec/test-scope/current.json` (v55)
- `tasks/feature-contact-form-google-sheet/phase-1-task-01.md`, `phase-1-task-02.md`
- Code: `src/app/api/contact/route.ts`, `src/lib/api/forward.ts`, `src/lib/api/contact-schema.ts`, `src/lib/contact/useContactForm.ts`, `.github/workflows/deploy.yml`, `docker-compose.yml`
- Docs: `docs/API_SPEC.md`, `docs/ERD.md`, `docs/BRD.md`, `docs/runbook/deploy-vps.md`, `docs/runbook/db.md`, `docs/runbook/ai-news.md`, `docs/content-bot/10-server.md`, `.context/project-config.md`

## Verdict: ❌ FAIL (round 1)

Không có ❌ Missing, không có HIGH conflict. FAIL vì **5 ⚠️** (ngưỡng ≥3). Tất cả là sửa text plan/spec, không đổi hướng giải pháp — làm rõ xong validate lại round 2.

## Feature Coverage Matrix (acceptance change doc ↔ spec ↔ task)

| # | Acceptance (change doc) | Spec | Task | Status | Note |
|---|---|---|---|---|---|
| 1 | Gửi form `/contact`, `/en/contact` → 1 dòng đủ 8 cột (thời gian, ngôn ngữ, tên, email, SĐT, công ty, nhu cầu, nội dung) | R-13a.1, R-13a.4 | t01 §1 (appendRow, header, giờ VN, nhãn nhu cầu) · t02 §1-2 (`locale`) | ✅ | `useContactForm` dùng chung ContactForm + CTAForm → CTA cũng gửi locale |
| 2 | Sheet/Web App lỗi/timeout → form báo lỗi như hiện tại, không lộ URL | R-13a.2-3 | t02 §3 (thành công chỉ khi 2xx + `{status:"ok"}`, message lỗi không chứa URL/token) | ✅ | `route.ts:41-45` đã trả message chung, không log |
| 3 | URL chỉ ở env server, không commit; chống POST lạ (secret token) | R-13a.2, R-13a.4, R-19 | t01 §1 (so token độ dài + XOR) · t02 §3, §5 (env, chặn `NEXT_PUBLIC_*`, deploy.yml/compose) | ✅ | Env prod đi qua GitHub Secrets → `deploy.yml:19-25` → compose — plan đã ghi đúng. Xem G1, G2 |
| 4 | Mỗi liên hệ → 1 tin Telegram; Telegram lỗi vẫn ghi Sheet | R-13a.5 | t01 §1 (try/catch riêng, luôn ok khi đã ghi), §2 test | ✅ | Không `getUpdates`/`setWebhook`/`deleteWebhook` + grep gate |
| 5 | Có Apps Script + hướng dẫn dựng trong repo | R-13a (đầu mục) | t01 §1, §3 (README a–g) | ✅ | |
| 6 | Cập nhật doc BRD OQ#4, project-config, API_SPEC | R-13a, OQ#4 | t02 Doc impact | ⚠️ | Thiếu `docs/runbook/db.md` §1b + `docs/content-bot/10-server.md` (G1) |
| 7 | Câu hỏi mở "(2) Agent viết sẵn script, user tự deploy — xác nhận?" | R-13a ghi như đã chốt | t01 | ⚠️ | G3 |

## Gaps (đánh số)

### G1 — [PARTIAL] Doc/vận hành env tạm trên VPS không nhận `CONTACT_FORM_TOKEN` — **MEDIUM** ⚠️
- `docs/runbook/db.md:70-71` (script `$ENVF` cho mọi lệnh `docker compose` tay trên VPS) chỉ đọc `CONTACT_FORM_TARGET`, chú thích ngay trên: thiếu dòng thì `up` tạo lại `nta-web` với giá trị rỗng → form mất đích. Sau CR-037, thiếu `CONTACT_FORM_TOKEN` cũng y hệt (compose `${CONTACT_FORM_TOKEN:-}` → rỗng → `forward` 500).
- `docs/content-bot/10-server.md:44` bảng env app chỉ có `CONTACT_FORM_TARGET`; `docs/runbook/ai-news.md:147` liệt env prod.
- task-02 Doc impact chỉ liệt `deploy-vps.md` §4 → **bổ sung** `docs/runbook/db.md` §1b (thêm `read -rs CK && printf 'CONTACT_FORM_TOKEN=%s\n' ...`), `docs/content-bot/10-server.md` bảng env, (tuỳ) `ai-news.md:147`; và `.context/project-config.md:161` `required:` thêm `CONTACT_FORM_TOKEN`.

### G2 — [PARTIAL] Thứ tự rollout với auto-push → deploy chưa có trong plan — **MEDIUM** ⚠️
- `deploy.yml:7-10` trigger `push` main; `project-config.md:21` `auto_push_after_pass: true` → task-02 PASS là deploy prod ngay.
- Sau task-02, `forward` bắt buộc có `CONTACT_FORM_TOKEN`. Nếu secret GitHub chưa đặt (user chưa deploy Web App) → form 500 trên prod. Hiện `deploy-vps.md:106` ghi target "tạm để trống" nên có thể chưa regress, nhưng không xác minh được giá trị secret hiện tại.
- Plan cần ghi rõ 1 trong 2: (a) trước khi push task-02, user đặt xong `CONTACT_FORM_TARGET` + `CONTACT_FORM_TOKEN` (task-01 README bước e) → checkpoint chờ user; hoặc (b) chấp nhận và báo rõ "form trả lỗi tới khi đặt secret". Cũng nên ghi kiểm `deploy.yml` env-level có `CONTACT_FORM_TOKEN` trước khi push (không chỉ build).

### G3 — [AMBIGUOUS] Câu hỏi mở chưa chốt nhưng spec ghi như đã chốt — **LOW** ⚠️
- Change doc dòng 39: "(2) Agent viết sẵn script, user tự deploy — xác nhận?" vẫn mở; R-13a + spec/updates dòng 13-14 ghi "user tự deploy" như quyết định.
- Q2 (timeout 10 s) mở trong task-02 §3 / test-scope notes.
- Cần user xác nhận ở checkpoint duyệt plan và ghi vào change doc "Ghi chú" trước khi build.

### G4 — [CONTRADICTION] Ghi chú C2 còn sót trong R-16 — **LOW** ⚠️
- `SPECIFICATIONS.md:469-470` (khối R-16) vẫn "⚠️ Conflict C2 (ghi nhận) … phụ thuộc Open Question #4 (form gửi về đâu)", trong khi delta đã gạch C2 (`:550`) và OQ#4 (`:543`). Spec tự mâu thuẫn.
- Sửa: gạch/ghi "ĐÃ GIẢI QUYẾT (CR-037, R-13a)" tại `:469-470`.

### G5 — [PARTIAL] Hợp đồng validate t01 ↔ web chưa khớp hoàn toàn — **LOW** ⚠️
- t01 §1 validate `email ≤ 254`; web (`contact-schema.ts:17,38`, `useContactForm.ts:45`) không giới hạn độ dài email → email hợp lệ ở web nhưng > 254 bị script `bad_request` → user nhận 500 chung, không biết lý do. Chọn: thêm giới hạn 254 ở R-13/schema (đổi behavior → ghi spec) hoặc bỏ giới hạn ở script.
- t01 cần ghi rõ validate script **chấp nhận** `phone/company/need` = `null` và `phone` = `''`: `contact-schema.ts:29` trả `phone: ''` khi body gửi `''` → `phone ?? null` (t02 §3) vẫn gửi `''`, không phải `null`.
- Bảng nhãn nhu cầu trong `Code.gs` nhân bản `contact.needs.*` vi + `isContactNeed` (`company-info.ts`) → drift risk; t01 test nên đối chiếu danh sách key với `company-info.ts`.

## Cross-Document Conflicts

| Conflict | Source A | Source B | Impact |
|---|---|---|---|
| C2 còn sót | `SPECIFICATIONS.md:469-470` (chưa giải quyết) | `SPECIFICATIONS.md:550` (đã giải quyết) | LOW (G4) |
| ERD "không lưu DB" | `docs/ERD.md:27,86` | R-13a/R-16 (Sheet, web không DB) | Không conflict — t02 cập nhật ERD mô tả đích Sheet |
| API_SPEC response | `docs/API_SPEC.md:58-67` không có `500` | R-13a.2-3 (`500` khi chưa cấu hình/lỗi) | LOW — t02 reconcile nên thêm `500 {status:"error",message}` + field `locale` vào request (`:42-51`) |
| R-18 guard order | `SPECIFICATIONS.md:479-480`, `route.ts:12-36` | R-13a.6, t02 §4 | Khớp |
| R-19 secret | `SPECIFICATIONS.md:482-483` | R-13a.2 (server-only, chặn `NEXT_PUBLIC_*`) | Khớp |
| R-13 response list | `SPECIFICATIONS.md:390-391` (200/400/429) | R-13a (500) | LOW — tuỳ chọn thêm 500 vào R-13 |

## Hợp đồng payload/response t01 ↔ t02

| Mục | t01 | t02 | Status |
|---|---|---|---|
| Body field | token, submittedAt, locale, name, email, phone\|null, company\|null, need\|null, message | như trên (`?? null`) | ✅ (xem G5 về `phone: ''`) |
| Content-Type | application/json (`e.postData.contents`) | `application/json` | ✅ |
| Success | `{status:"ok"}` sau 302 | `response.ok` + JSON `{status:"ok"}`, `redirect:'follow'` | ✅ (POST→302→GET đúng hành vi Apps Script) |
| Error | `{status:"error",code:unauthorized\|bad_request\|server_error}` | mọi khác `ok` → throw → 500 | ✅ |
| Validate | name≤100, email≤254, message≤2000, company≤150, locale, need key | web: name 2–100, email pattern, message 10–2000, company≤150 | ⚠️ G5 |

## Bảo mật (theo yêu cầu kiểm)

| Rủi ro | Có trong plan | Note |
|---|---|---|
| Token trong body (doPost không đọc header) | ✅ R-13a.2, t01 §1, t02 §3 | So sánh không short-circuit; README xoay token đồng bộ |
| Formula injection | ✅ R-13a.4, t01 §1 + test | Spec liệt `= + - @`; t01/test-scope thêm tab/CR — đề nghị đồng bộ R-13a.4 (suggestion) |
| PII | ✅ t01 §1 (log không PII đầy đủ), README g (Sheet nội bộ) | Telegram nhận PII là quyết định user — chấp nhận |
| Lộ URL/token | ✅ t02 §3, verify grep `.next/static`, không build arg | Suggestion: `console.error` trong Code.gs **không** in `e.message` thô của `UrlFetchApp` (message có thể chứa URL `.../bot<TOKEN>/...`) — thêm 1 case test |
| Telegram vs bot polling | ✅ R-13a.5, t01 §1 + grep gate, README b (không getUpdates lấy chat id) | sendMessage không tạo update cho chính bot → không xung đột |
| Spam / rate-limit / honeypot | ✅ R-13a.6, regression test-scope | Timeout 10 s giữ request lâu hơn; rate-limit vẫn chặn trước validate |
| Env prod qua GitHub Secrets → deploy.yml → compose | ✅ t02 §5, README e | Thiếu đường env tay trên VPS (G1) + thứ tự rollout (G2) |

## Test-scope v55 vs plan
- `changed.files`, `modules`, `impact.direct/regression`, `acceptance` khớp t01 + t02 (Code.gs, code.test.ts, README, schema, forward, hook, env wiring, doc).
- Thiếu: `docs/runbook/db.md` + `docs/content-bot/10-server.md` trong `changed.files` (theo G1); dòng "Form tối giản/CTA vẫn gửi được" ✅.
- `risk: high`, notes STRICT ✅.

## Missing Edge Cases
- Email > 254 ký tự (G5); `phone: ''` (G5).
- Deploy trước khi đặt secret (G2).
- `waitLock(10000)` hết hạn → script trả `server_error` → web 500: đã được bao bởi "mọi trường hợp khác → 500", nên test t01 thêm case lock timeout (suggestion).

## Non-functional Gaps
- Timeout 10 s chưa chốt (G3). Không có alert khi Web App lỗi liên tục (ngoài scope — chỉ ghi nhận).

## Suggestions (không tính vào verdict)
1. t02 reconcile `docs/API_SPEC.md`: thêm `locale` vào request `:42-51`, thêm `500` vào response `:58-67`.
2. Đồng bộ R-13a.4 liệt cả tab/CR như t01 + test-scope.
3. t01 test: lỗi `UrlFetchApp` có message chứa token → log không chứa token.

## Verdict Reasoning
- ❌ Missing: 0 · HIGH conflict: 0 · ⚠️: 5 (G1–G5) → **FAIL** theo ngưỡng ≥3 ⚠️.
- Để PASS round 2: (G1) bổ sung db.md §1b, content-bot/10-server.md, project-config `required` vào Doc impact t02 + test-scope; (G2) thêm bước rollout/checkpoint secret trước push t02; (G3) user xác nhận "user tự deploy" + timeout 10 s, ghi vào change doc; (G4) sửa `SPECIFICATIONS.md:469-470`; (G5) chốt giới hạn email + ghi rõ script chấp nhận `null`/`''`.

---

# Round 2 — 2026-10-15

Agent: spec-validator
**Nguồn kiểm lại:** `git diff SPECIFICATIONS.md spec/test-scope/current.json`, `tasks/feature-contact-form-google-sheet/phase-1-task-01.md`, `phase-1-task-02.md`, `spec/changes/2026-10-15-contact-form-google-sheet.md`; đối chiếu `src/lib/contact/company-info.ts:42`, `package.json:13`, `docs/runbook/db.md:71`, `docs/content-bot/10-server.md:44`, `docs/runbook/deploy-vps.md:106,114,155`.

## Verdict: ✅ PASS (round 2)

❌ Missing: 0 · HIGH conflict: 0 · ⚠️: 1 (N1, LOW) → dưới ngưỡng FAIL (≥3 ⚠️). N1 nên sửa text trước khi gọi builder task-01 (1 câu), không cần validate lại.

## Kiểm lại G1–G5

| Gap | Round 1 | Đã sửa ở | Status R2 | Note |
|---|---|---|---|---|
| G1 doc/env tay VPS | ⚠️ MEDIUM | t02 Doc impact (dòng 7): `docs/runbook/db.md` §1b (`read -rs CTK && printf 'CONTACT_FORM_TOKEN=%s\n'`), `docs/content-bot/10-server.md:44`, `.context/project-config.md` `required:`; test-scope `changed.files` + regression dòng "compose gõ tay theo db.md §1b giữ cả 2 biến" | ✅ | Đích tồn tại thật: `db.md:71`, `10-server.md:44`. `ai-news.md:147` (tuỳ chọn) không thêm — chấp nhận. `deploy-vps.md:114` (danh sách Secret repo) nằm trong phạm vi "deploy-vps §4" của t02 — builder nhớ thêm `CONTACT_FORM_TOKEN` ở đó |
| G2 rollout vs auto-push | ⚠️ MEDIUM | t02 §Rollout (dòng 39-43): checkpoint hỏi user đã đặt 2 GitHub Secrets trước khi push, hoặc user ghi rõ chấp nhận push trước | ✅ | Khẳng định "prod đã 500 vì target trống" khớp `deploy-vps.md:106,155` ("tạm để trống", "Form không gửi"); giá trị secret thật vẫn không xác minh được từ repo — checkpoint đã bao rủi ro này |
| G3 câu hỏi mở | ⚠️ LOW | Change doc dòng 39: câu hỏi (2) gạch + ghi quyết định user 2026-10-15 | ✅ | Timeout 10 s ghi là câu hỏi mở Q2 ở báo cáo plan (t02 §3 dòng 18, test-scope notes) — không chặn, sẽ hỏi ở checkpoint duyệt plan. Nhất quán giữa t02 và test-scope |
| G4 C2 sót trong R-16 | ⚠️ LOW | `SPECIFICATIONS.md` khối R-16: gạch C2 + "Đã giải quyết 4.5.0 (CR-037)" | ✅ | Giờ đồng nhất với OQ#4 (gạch) và mục C2 trong Cross-doc conflicts |
| G5 validate script vs web | ⚠️ LOW | t01 §1 dòng 23: script lỏng hơn web (chuỗi ≤ 5000, `null`/`''` cho phone/company/need, `need` lạ ghi nguyên key); §2 test `null`/`''`, need lạ, đối chiếu bảng nhãn với `CONTACT_NEEDS` | ✅ (xem N1) | Email > 254 hết bị chặn lệch. `CONTACT_NEEDS` tồn tại (`company-info.ts:42`), file không có import → test `tools/**` import được bằng tsx; `npm test` glob có `tools/**/*.test.ts` (`package.json:13`) |

## Gợi ý round 1 — đã áp dụng
| Gợi ý | Status |
|---|---|
| API_SPEC thêm `locale` + response `500` | ✅ t02 Doc impact dòng 7 |
| R-13a.4 liệt tab/CR | ✅ diff SPECIFICATIONS R-13a.4 |
| Code.gs không log nguyên văn lỗi `UrlFetchApp` | ✅ t01 §1 dòng 27 + test dòng 36 |

## Mâu thuẫn mới phát sinh

### N1 — [CONTRADICTION] t01 §1 tự mâu thuẫn về `need` lạ — **LOW** ⚠️
- `phase-1-task-01.md:23`: "**Không** chặn `need` lạ … key lạ → ghi nguyên key".
- `phase-1-task-01.md:25` (câu còn sót từ round 1): "Nhu cầu: key → nhãn tiếng Việt … ; **key lạ đã bị chặn ở validate**."
- Test dòng 34 theo dòng 23 (`need` lạ → ghi nguyên key, ok). Builder đọc dòng 25 có thể thêm chặn → test FAIL hoặc làm mất liên hệ khi bảng lệch.
- Sửa: dòng 25 đổi thành "key lạ → ghi nguyên key (xem validate)".

## Kiểm nhất quán khác (không tính verdict)
- Spec R-13a ↔ t01 §Hợp đồng ↔ t02 §3 ↔ test-scope `impact.direct`: field body, điều kiện thành công (2xx + `{status:"ok"}` sau 302), `NEXT_PUBLIC_*` → 500, Telegram text thuần/không `getUpdates`/`setWebhook` — khớp.
- R-13a.4 có tab/CR, nhưng test t01 dòng 32 chỉ liệt `=HYPERLINK(...)`, `+1`, `-2`, `@x` → **suggestion**: thêm case ô bắt đầu bằng tab và CR (test-scope `impact.direct` đã yêu cầu).
- Test-scope `changed.files` liệt `.context/project-config.md` 2 lần (dòng doc reconcile + dòng riêng) — trùng lặp vô hại.
- Không thấy mâu thuẫn mới giữa change doc / spec / task / test-scope về rollout, secret, PII.

## Verdict Reasoning (round 2)
- G1–G5 đã đóng; 3 gợi ý round 1 đã áp dụng.
- Phát sinh 1 ⚠️ LOW (N1) — dưới ngưỡng → **✅ PASS**. Điều kiện: sửa `phase-1-task-01.md:25` trước khi gọi builder task-01; timeout 10 s (Q2) hỏi user ở checkpoint duyệt plan như đã định.
