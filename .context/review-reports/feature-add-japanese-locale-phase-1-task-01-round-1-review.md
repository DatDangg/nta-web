Agent: reviewer

# Review — feature-add-japanese-locale · phase-1-task-01 · round 1 (CR-044)

- **Review level:** STRICT
- **Reason:** đổi DB schema + migration prod (`drizzle/0002`, DROP/ADD CHECK), write-path nội dung dùng chung (content-rules, content-repo I-1) cho bot/CLI/cron AI news, shared type `SeedRecord.locale`.
- **Blast radius:** bảng `content_entries` (CHECK locale) trên DB prod duy nhất (R-16c, không staging); `src/db/{schema,content-rules,content-repo}.ts` (CLI + bot CR-030); `src/lib/uploads/save-image.ts` (`ImageAlt`, `assetData`) dùng bởi content-cli upload + publish-post; `tools/db/{file-source,parity-check,content-cli,publish-post,seed-db}` (seed/parity/cron AI news). Web (`src/app`, `src/i18n`, store) không đổi; `ContentLocale` rộng hơn nhưng web chỉ truyền vi/en → typecheck PASS.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (exit 0) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26` no-img-element (ngoài diff) |
| `npm test` | 1 fail: `tools/db/content-rules.test.ts:25` "toàn bộ nội dung file … ảnh tồn tại". Đã đọc test + output: assertion fail ở dòng 29 (`missing` = danh sách `/uploads/<sha>.jpg|png` không có trong `public/` local); `checkRecord` cho mọi bản ghi (dòng 27) đều qua. Không liên quan diff → **pre-existing, môi trường**. Mọi test mới PASS; suite Postgres skip (không `TEST_DATABASE_URL`). |
| `npx oxlint src/db tools/db deploy/db src/lib/uploads` | không in finding (builder báo PASS) |
| `npm run build` | không chạy (builder báo lỗi native binding môi trường; task không đổi web) |

## Kiểm trọng tâm
- **SQL 0002:** đúng 2 câu `ALTER TABLE "content_entries" DROP CONSTRAINT "content_entries_locale_check"` + `ADD CONSTRAINT … CHECK (… IN ('vi','en','ja'))`. Không DROP bảng/cột, không đổi dữ liệu; CHECK mới là tập cha → mọi hàng vi/en cũ thoả. OK.
- **Dòng duyệt:** `-- HIGH_RISK_MIGRATION: approved 2026-11-09 by Bruce` ở dòng 1, khớp `APPROVAL_MARKER_PATTERN` (`deploy/db/migration-gate.ts:9-10`). Test gate trên file thật: findings = `["ALTER TABLE ... DROP"]`, approved, không blocked; bỏ marker → blocked. OK. (Nguồn duyệt: relay qua coordinator/journal — reviewer không kiểm chứng trực tiếp được lời user.)
- **Snapshot/journal:** `0002_snapshot.json` prevId = id của 0001; diff chỉ đổi value CHECK. `_journal.json` idx 2, `when` 1794202252934 > 1791972289179 (0001). OK.
- **SEED_LOCALES vs CONTENT_LOCALES:** CONTENT_LOCALES dùng ở CHECK, I-6 (`content-rules.ts:187`), key `alt`. SEED_LOCALES/isSeedLocale ở readFileSource, compareRecords, checkLocalePairs, countByCollection, localePairWarnings, publish-post. Đúng chỗ.
- **Parity:** `compareRecords` lọc ja cả fileRecords và dbRecords → không "thiếu"/"thừa". `checkEachRecord` + `checkSlugRegistry` vẫn chạy trên hàng ja (rule từng bản ghi giữ). OK.
- **I-1 write-path:** ghi ja → không cảnh báo; ghi vi/en kiểm đúng locale cặp qua `findLiveEntry` (bản ja không thay được). Tương đương hành vi cũ cho vi/en. OK.
- **publish-post:** dùng SEED_LOCALES → vẫn đọc đúng 2 file vi/en, thứ tự kết quả giữ nguyên → cron AI news không vỡ. OK.
- **--alt-ja end-to-end:** OPTIONS `alt-ja` → `saveImage(alt.ja)` → `assetData` giữ `alt.ja` đã trim → `assetProblems` chấp nhận key ja. OK.
- **save-image.ts (ngoài blast radius ghi trong task):** CẦN — thiếu `ja` trong `ImageAlt` thì `content-cli` không typecheck và `assetData` sẽ lặng lẽ bỏ alt.ja. Thay đổi tối thiểu 2 dòng, trace về scope mục 5. Chấp nhận.
- **SeedRecord.locale → ContentLocale:** chỉ nới; `readDatabaseRecords` vốn cast `as ContentLocale`; `countByCollection` có guard `isSeedLocale` trước `row[record.locale]`; `seed-db.importRecords` chỉ nhận bản ghi file (vi/en). Typecheck PASS, không hồi quy thấy được.

## Skill gates
- aislop: skip, `aislop` chưa cài (command not found)
- oxlint (anti-slop): OK (không finding)
- ocr: skip, ocr not installed
- AI-readable: OK — tên rõ (`SEED_LOCALES`, `isSeedLocale`, `pairLocale`), hàm ngắn, comment nêu lý do (WHY); 0 indicator
- ai-friendly-web: N/A (không public-facing)
- blitzstrike: N/A
- Responsive Checklist Gate: N/A (diff không đụng UI)

## Findings
- **[MINOR]** `tools/db/content-cli.test.ts:54-59` — test `--alt-ja` chỉ chứng minh cờ được parse; việc lưu `alt.ja` chỉ được phủ bởi `tools/db/save-image.test.ts:106-117` (suite Postgres, skip local). Đề xuất: chạy suite DB (`TEST_DATABASE_URL`) trong CI/trước deploy để có evidence thật cho alt.ja + test ja ở `tools/db/content-repo.test.ts:185`.
- **[MINOR]** `src/db/content-repo.ts:155-158` + `tools/db/parity-check.ts:87-104` — I-3/I-4 tra registry theo đúng locale → bản `solution`/`product` ja cần hàng `slug_registry` ja tồn tại trước, nếu không bị chặn ở write-path và parity báo I-3. Nhất quán với decisions.md, nhưng P3-T01 (bot/seed ja) phải tạo registry ja trước — ghi vào task P3.
- **[MINOR]** Task file mục Blast radius (`tasks/feature-add-japanese-locale/phase-1-task-01.md:7`) chưa liệt kê `src/lib/uploads/save-image.ts` + `tools/db/save-image.test.ts` — bổ sung khi close-out để commit/manifest khớp.
- Rollout (ghi nhận, không phải defect): DB prod duy nhất → bắt buộc backup + restore DB tạm chạy thử 0002 trước deploy như task đã ghi; không promote khi chưa có bước đó.

## Verdict
✅ **PASS** — không CRITICAL/MAJOR. Fail test duy nhất là pre-existing (thiếu ảnh `public/uploads` local).
