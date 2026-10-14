# Spec Validation Report — CR-031 feature/content-database (PRE-PLAN, round 1)

Agent: spec-validator
Date: 2026-10-14 · Branch: main · Mode: Spec validation (pre-plan) · READ-ONLY (chỉ ghi report này)

**Sources validated against:** `spec/changes/2026-10-14-content-database.md` (8 quyết định + 5 acceptance),
`git diff SPECIFICATIONS.md` (4.1.0 → 4.2.0), `spec/updates/2026-10-14-content-database.md`, `spec/CHANGELOG.md:52`,
`git diff .context/project-config.md`, `tasks/feature-content-database/README.md` + 9 task file,
`docs/content-bot/08-data-model.md`, `.github/workflows/deploy.yml`, `AGENTS.md` (migration safety, commit/push).

Không đề nghị hỏi lại 8 quyết định đã chốt (PostgreSQL container riêng, toàn bộ nội dung, không admin web,
chỉ DB prod, Drizzle, src/content làm seed).

## Verdict: ❌ FAIL (round 1) — 0 BLOCKER · 3 MAJOR · 7 MINOR

Lý do FAIL: theo luật `.agent/spec-validator.md` (≥3 ⚠️ → FAIL). Không có ❌ requirement thiếu, không có conflict HIGH
chưa giải. 3 MAJOR đều sửa nhanh trong plan/spec (không đổi quyết định user) → validate lại round 2.

## 1. Coverage — acceptance change doc ↔ requirement ↔ task

| # | Acceptance (change doc) | Requirement | Task | Status | Note |
|---|---|---|---|---|---|
| A1 | Mọi trang hiện có hiển thị y hệt (vi+en, cùng URL) | R-16 (SPECIFICATIONS.md:383-391) | p3-t01, p3-t02, p4-t01 §1 (crawl sitemap + HTML chuẩn hoá + status code) | ✅ | Testable qua parity crawl. Phụ thuộc gap M3 (phạm vi "toàn bộ") |
| A2 | Sửa DB → lên web không build lại | R-15a (:374-379), R-16 | p3-t03, p4-t01 §3 (E2E trên prod) | ✅ | |
| A3 | Migration versioned + committed (Drizzle), thẳng DB prod | R-16c (:397-401) | p1-t01, p1-t02 §3-4 | ✅ | Xem m2 (thời điểm migrate prod) |
| A4 | Backup tự động + cách khôi phục | R-16b (:395-396) | p1-t02 §2,5,6, p4-t01 §4 | ✅ | |
| A5 | Lịch sử phiên bản để rollback | R-16a | p1-t01 (bảng `content_versions`), p2-t02, p4-t01 §3 | ✅ | |

Quyết định user: #1 (bot sửa ngay, không lưu form) → R-16/R-15a ✅ · #2 → R-27/p1-t02 ✅ · #3 → R-16 ⚠️ (M3) ·
#4 → Scope Out ✅ · #5/#8 → R-16c + config ngoại lệ ✅ · #6 → Tech Stack/R-16c ✅ · #7 → R-16, p3-t01 §3 ✅.

## 2. Gaps

### MAJOR

**M1 — Cơ chế "giữ push" task 5–7 trên `main` không an toàn với `auto_push_after_pass: true`.**
- Nguồn: `tasks/feature-content-database/README.md:20-28`; `.context/project-config.md:21` (`auto_push_after_pass: true`);
  `.github/workflows/deploy.yml:7-8` (push main → deploy prod).
- Kịch bản lỗi: task 5–7 commit local trên `main` → bất kỳ lần push `main` nào khác (close-out CR khác, CR-030, hotfix nội dung,
  hoặc agent close-out mặc định theo CLAUDE.md) sẽ đẩy luôn các commit này → prod build web đọc DB khi DB prod chưa migrate/import
  → toàn site 500. Không có cờ máy-đọc-được nào chặn auto-push; chỉ là ghi chú văn xuôi.
- Đề xuất (chọn 1, ghi decisions.md): (a) **feature flag** `CONTENT_SOURCE=file|db` (mặc định `file`, server-only), loader
  giữ cả 2 nguồn tới cutover → task 5–7 push an toàn, task 8 chỉ bật flag; hoặc (b) làm task 5–7 trên branch
  `feature/content-database` (user yêu cầu rõ), merge ở task 8; hoặc tối thiểu (c) ghi `pushHold: true` vào
  `.context/progress.json` + Run Journal và mọi close-out phải kiểm cờ trước khi push, đồng thời đóng băng CR khác đụng `main`.
  Khuyến nghị (a) — đồng thời là kế hoạch lùi rẻ hơn `git revert` ở p4-t01 §5.

**M2 — Requirement/task yêu cầu "test PASS" nhưng project không có test framework / test command.**
- Nguồn: `.context/project-config.md:36,112` (`test_command: null`); `phase-2-task-02.md:15,18`; `phase-3-task-03.md:13`;
  `phase-1-task-02.md:30` (test gate destructive); `phase-1-task-01.md:28`.
- Hệ quả: reviewer không có lệnh verify chuẩn → "test PASS" không kiểm được độc lập; p1-t01 scope "Không thêm lib khác" chặn luôn việc thêm runner.
- Đề xuất: chốt cách test trước phase 1 — vd script `tools/db/*.test.ts` chạy bằng `node --test` (built-in, không thêm dep) hoặc
  thêm `vitest` qua `/brainstorm verify`; ghi `test_command` + DB test (Postgres Docker local) vào project-config; sửa p1-t01 §1 cho phép.

**M3 — "Toàn bộ nội dung" (quyết định #3) vs loại trừ mặc định `src/i18n/messages` / `company-info.ts` / `public/images` còn treo.**
- Nguồn: SPECIFICATIONS.md:388-389 ("trừ khi user chốt khác"); `spec/updates/2026-10-14-content-database.md:11-12` ("chờ user xác nhận");
  `docs/content-bot/08-data-model.md:87-89` — hero About, giá trị, con người, tiêu đề khối trang chủ, footer nằm trong
  `messages/*.json`; meta title/description trang chủ + about nằm trong code.
- Hệ quả: user chọn "about" + "trang chủ" nhưng phần lớn chữ hiển thị của 2 trang này sẽ **không** sửa được qua DB/bot.
  Nếu user chốt khác **sau** phase 1, `collection` CHECK ở p1-t01:12 phải đổi (DROP/ADD CONSTRAINT → dính gate destructive p1-t02 §4).
- Đề xuất: lấy xác nhận user về 3 loại trừ **trước khi chạy p1-t01** (là xác nhận phạm vi, không phải hỏi lại quyết định);
  ghi kết quả vào change doc mục Quyết định. Ảnh (`public/images`) nên ghi rõ thuộc CR-030 hay ngoài phạm vi.

### MINOR

- **m1 — Seed import vs AGENTS.md "Cấm … seed/reset … cho staging/prod".** Ngoại lệ chỉ ghi ở `.context/project-config.md` (mục Ngoại lệ (4))
  và R-16c (SPECIFICATIONS.md:400-401); change doc quyết định #7 hàm ý import nhưng không nói rõ "user cho phép import vào prod".
  Đề xuất: ghi 1 dòng trong change doc mục Quyết định: "import seed 1 lần, chỉ chèn, vào DB prod — user chấp thuận 14/10/2026"
  + append `.context/decisions.md`. p4-t01 đã có checkpoint user xác nhận → giữ.
- **m2 — Migration 0000 chạy lên prod ngay khi push task 2, trước checkpoint cutover.** `phase-1-task-02.md:18-20` đưa backup→gate→migrate vào
  mọi lần deploy; `phase-4-task-01.md:12-13` lại coi "migrate 0000" là bước cutover có user duyệt. Đề xuất: ghi rõ migrate additive chạy tự động
  từ task 2 (README:25-27) và bỏ "migrate 0000" khỏi bước cutover, hoặc giữ `nta-migrate` không gọi trong deploy tới task 8.
- **m3 — `nta-web depends_on nta-db (service_healthy)` từ task 2** (`phase-1-task-02.md:14`) làm web prod phụ thuộc DB trước khi web đọc DB;
  DB lỗi → web không up. Đề xuất: chỉ thêm `depends_on` ở task 8 (hoặc khi flag `db` bật).
- **m4 — Dependency task 4 → task 7:** CLI `revalidate` (`phase-2-task-02.md:14`) gọi R-15a (task 7). Đề xuất: dời subcommand `revalidate` sang p3-t03 hoặc ghi phụ thuộc.
- **m5 — Ràng buộc I-7/I-8 không có trong write-path.** `phase-2-task-01.md:17` + `phase-2-task-02.md:12` chỉ giữ I-1..I-6
  (`08-data-model.md:80-81`: ảnh tồn tại, xoá/đổi slug → 301). Với DB, xoá mềm 1 slug public → 404 không redirect (redirect ở `next.config.ts` cần build).
  Đề xuất: R-16a/R-16 ghi rõ xoá/đổi slug public vẫn phải có 301 (cơ chế: chặn ở write-path hoặc thuộc CR-030).
- **m6 — R-16c thiếu điều khoản thay "verify staging".** Config (Ngoại lệ, cuối) yêu cầu HIGH_RISK: restore backup vào DB tạm + chạy thử migration;
  R-16c (SPECIFICATIONS.md:397-401) không nêu → spec ≠ config. Đề xuất bổ sung 1 câu vào R-16c.
- **m7 — Non-functional / edge-case chưa có target:** DB down → R-16 không nói hành vi (p3-t01 §4 chọn 500) trong khi R-27 (SPECIFICATIONS.md:458)
  availability ≥ 99.5% nay phụ thuộc DB; p3-t02 §4 đo TTFB nhưng không có ngưỡng. Đề xuất: ghi hành vi khi DB lỗi (vd giữ bản cache cũ nếu có, không cache lỗi)
  + ngưỡng TTFB chấp nhận (vd không tệ hơn X% so với SSG hiện tại). Cosmetic: dòng nguồn `[reverse-engineered from docs] … ERD.md:16-22,34`
  (SPECIFICATIONS.md:402) nay nằm dưới R-16c, nên chuyển lên ngay sau R-16.

## 3. Cross-document conflicts

| Conflict | Source A | Source B | Impact | Trạng thái |
|---|---|---|---|---|
| staging_db ≠ prod_db | AGENTS.md (Non-negotiables) | config Ngoại lệ + R-16c | MED | Chấp nhận — quyết định user #5/#8; cần append decisions.md |
| Cấm seed prod | AGENTS.md | R-16c / config (4) | MED | m1 |
| Docs as-built "không có DB" | `docs/ERD.md`, `docs/content-bot/08-data-model.md:1-6` | R-16 4.2.0 | LOW | Đúng lịch: reconcile ở p5-t01 sau cutover |
| HIGH_RISK "không promote production" | AGENTS.md | R-16c "chỉ chạy khi user duyệt" | LOW | Chỉ prod nên user duyệt = gate; m6 |

## 4. Testability

R-15a (401/400/200, no GET, no-store) ✅ · R-16 (parity crawl + status code) ✅ · R-16a (version, transaction, rollback) ✅ nhưng cần runner (M2) ·
R-16b (≥14 bản, restore drill) ✅ · R-16c (gate destructive có test cases) ✅ nhưng cần runner (M2) · R-27 (không publish port: `docker compose config`) ✅ ·
Hiệu năng / DB-down ⚠️ chưa có tiêu chí (m7).

## 5. Dependency / thứ tự

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 hợp lý; 3 (import) tách `file-source` để parity ở 8 dùng lại ✅.
Rủi ro chính là push (M1) và thời điểm migrate prod (m2, m3); phụ thuộc ngầm 4→7 (m4).

## Đề xuất sửa ngắn (cho change-request / planner)

1. Chọn cơ chế M1 (khuyến nghị feature flag `CONTENT_SOURCE`) → sửa README + p3-t01/p3-t02/p4-t01.
2. Chốt test runner (M2) → cập nhật project-config `test_command`, p1-t01 §1.
3. Xác nhận phạm vi loại trừ với user trước p1-t01 (M3) → ghi change doc; cân nhắc collection không dùng CHECK cứng.
4. MINOR m1–m7: chỉnh câu chữ spec/task; không chặn plan.

Rerun spec-validator round 2 sau khi sửa M1–M3.

---

# Round 2 — 2026-10-14

Agent: spec-validator · Nguồn kiểm lại: `git diff SPECIFICATIONS.md .context/project-config.md`, `tasks/feature-content-database/README.md`,
phase-1-task-01/02, phase-2-task-02, phase-3-task-01/02/03, phase-4-task-01, phase-5-task-01.

## Verdict: ✅ PASS — 0 BLOCKER · 0 MAJOR · 4 MINOR (không chặn plan)

## Trạng thái gap round 1

| Gap | Trạng thái | Bằng chứng |
|---|---|---|
| M1 push hold | ✅ Đã sửa | Cờ `CONTENT_SOURCE=file\|db` mặc định `file`: README:24-29, phase-3-task-01.md:12-15, phase-4-task-01.md:12-16 (lùi = đặt lại `file`), phase-5-task-01.md:9 (bỏ cờ sau cutover ổn định), R-16 (diff: "Chuyển nguồn có cờ …") |
| M2 test runner | ✅ Đã sửa | phase-1-task-01.md:22-23 (`node --test` + `tsx`, `npm test`, ghi `test_command`). Xem r2-4 |
| M3 phạm vi | ✅ Không còn chặn | phase-1-task-01.md:12 (`collection` text không CHECK, whitelist ở app) → mở rộng phạm vi sau không cần migration destructive. Câu hỏi messages/company-info/ảnh vẫn là **open item cho user ở checkpoint** |
| m1 seed prod | ✅ Chấp nhận | Xác nhận của user ở checkpoint task 8 (phase-4-task-01.md:12-13); agent không tự ghi chấp thuận — đúng |
| m2 migrate 0000 | ✅ | README:28-29, phase-4-task-01.md:12 |
| m3 depends_on | ✅ | phase-1-task-02.md:14, phase-4-task-01.md:13 |
| m4 CLI revalidate | ✅ | phase-2-task-02.md:16, phase-3-task-03.md:13 |
| m5 I-7/I-8 | ✅ | phase-2-task-02.md:13 |
| m6 thay verify staging | ✅ | R-16c (diff: "Thay cho 'verify staging' … restore backup mới nhất vào DB tạm …") khớp config Ngoại lệ |
| m7 TTFB/DB lỗi/dòng nguồn | ✅ | R-16 (diff: TTFB cache hit ≤ +20%, DB lỗi → trang đã cache vẫn phục vụ); dòng nguồn đã về R-16; phase-3-task-02.md:18 |

## Gap còn lại (MINOR)

- **r2-1 — Chiến lược render đổi ngay cả ở chế độ `file`.** phase-3-task-02.md:13-16 chuyển `[slug]` sang `generateStaticParams: []` + `dynamicParams`
  và trang không tham số sang render theo request; commit này được push (README:25-26) → prod đổi cách render (SSG → on-demand) **trước** checkpoint task 8,
  trái câu "Production không đổi hành vi cho tới task 8" (README:20). Không gây 500 (vẫn đọc file) nhưng ảnh hưởng TTFB/cache.
  Đề xuất: acceptance task 6 thêm "chế độ `file`: crawl sitemap vi+en cùng status code + so HTML trang mẫu + TTFB trong ngưỡng R-16 **trước khi push**".
- **r2-2 — Đoạn cũ mâu thuẫn còn sót** ở README:20-22 ("task 5–7 commit local, chỉ push ở task 8") — trái mục "Lưu ý push" mới (README:25). Đề xuất xoá/sửa đoạn này.
- **r2-3 — Hành vi DB lỗi ở task lệch nhẹ với R-16.** phase-3-task-01.md:16 chỉ nói "500, không trả rỗng"; R-16 mới yêu cầu thêm "trang đã cache vẫn phục vụ".
  Đề xuất bổ sung vào §4 + 1 bước kiểm (tắt DB local → trang đã cache vẫn 200, trang chưa cache báo lỗi, không cache lỗi).
- **r2-4 — `import 'server-only'` trong `src/db/client.ts`** (phase-1-task-01.md:24) sẽ throw khi chạy ngoài Next (`node --test`/`tsx`, `tools/db/*`
  import-seed/parity/CLI) → test task 4 và script task 3 không chạy được. Đề xuất: đặt `server-only` ở `src/lib/content/store.ts` (tầng web),
  để `src/db/client.ts` dùng được từ tools/test; hoặc chạy test với `--conditions=react-server`.

## Open item (không phải gap — chờ user ở checkpoint)
- Phạm vi `src/i18n/messages` / `company-info.ts` / `public/images` (R-16, SPECIFICATIONS.md "trừ khi user chốt khác").
- Xác nhận import seed 1 lần vào DB prod (checkpoint task 8).
