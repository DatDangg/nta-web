# Review — feature-ai-news-item-images · phase-1-task-02 · round 1

Agent: reviewer · CR-035 · 2026-10-15
Task: `tasks/feature-ai-news-item-images/phase-1-task-02.md` — `publish-post --images-dir` (lưu ảnh tin vào /uploads + asset trước khi chèn bài)

## Review level
**STRICT**

## Reason
Ghi DB prod + volume upload tự động (workflow), đầu vào file từ job xử lý nội dung ngoài (og:image), shared write-path (`saveImage`, `createEntry`, I-7), đổi shape trả về của `publishPost`.

## Blast radius
- `tools/db/publish-post.ts` (manifest, prepareImage, planImages, trả `{ posts, images, warnings }`)
- `tools/db/content-cli.ts` (cờ `--images-dir` scoped `publish-post`, in dòng `publish-post image … status=…`)
- Test: `tools/db/publish-post.test.ts`, `tools/db/content-cli.test.ts`; doc: `docs/runbook/db.md`, header `content-cli.ts`.
- Không đổi `saveImage` / `inspectImage` / `content-repo` / schema / lệnh `upload`. Caller của `publishPost`: chỉ `content-cli.ts:218` + test (đã grep) → đổi shape an toàn.
- Gián tiếp: `.github/workflows/ai-news.yml:145` grep ` status=missing$` trên output dry-run.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:25` (ngoài scope) |
| `npm test` (không có `TEST_DATABASE_URL`) | 118 tests, 116 pass, 0 fail, 2 skip; các suite Postgres (`publish-post --images-dir (Postgres)`, `publish-post (Postgres)`, `saveImage`, `content-repo`) bị skip |
| DB test | Reviewer KHÔNG chạy được (không có Postgres test; docker ngoài quyền reviewer). Dựa vào evidence Builder: 34 test tools/db, 33 pass, 1 skip (symlink Windows) |

## Checklist trọng tâm
| Mục | Kết quả | Evidence |
|---|---|---|
| Không đường ghi ảnh nào bỏ qua inspectImage/hash | OK | Ảnh chỉ vào `plan.prepared` qua `prepareImage` (manifest → pattern → lstat → ≤5MB → `inspectImage` + ext khớp → sha256 == tên), `publish-post.ts:143-167`; `saveImage` → `storeImageFile` kiểm lại `inspectImage` + tự tính tên từ hash (`image-file.ts:126-128`) |
| Chỉ ảnh trong manifest, không quét thư mục | OK | Lặp `needUpload` (từ lỗi I-7), tra `manifest.get(fileName)`; không `readdir` |
| symlink / `..` / tên sai | OK | `UPLOAD_FILE_NAME_PATTERN` neo `^…$` → không có `/` hay `..` trong tên; `lstat` + `isSymbolicLink()/isFile()`; `/uploads/../x` bị `imageProblems` báo "đường dẫn ảnh không hợp lệ" (không vào needUpload) — có test |
| TOCTOU kiểm ↔ đọc | Chấp nhận được | Tráo file sau `lstat`: bytes vẫn phải qua `inspectImage` + sha256 == tên → nội dung lưu luôn đúng nội dung đã đặt tên. Còn rủi ro nhỏ về tài nguyên (xem MINOR-2) |
| Dry-run 0 ghi | OK | Nhánh dry-run chỉ `readFile`/`lstat`; return trước vòng `saveImage` (`:243`); test kiểm 0 asset/post + uploadDir rỗng |
| I-7 chỉ nới cho ảnh đã qua kiểm | OK | `resolved` = đúng chuỗi `I-7 ảnh upload không có trong DB: <urlPath>` của ảnh trong `plan.prepared`; lỗi I-7 khác giữ nguyên. Ghi thật: `createEntry` tự kiểm lại I-7 trong transaction |
| Không `--images-dir` = CR-034 | OK | `planImages` không đọc manifest; I-7 vẫn chặn + thêm gợi ý `--images-dir`; bài không ảnh → `images: []`, `warnings: []`, test CR-034 chỉ đổi destructuring |
| Idempotent chạy lại | OK | Bài exists → không vào needUpload, không upload; asset sống → `exists`; trùng hash xoá mềm → `restored` (test) |
| Thứ tự upload → createEntry | OK | `:245-250` trước vòng `createEntry`; lỗi giữa chừng → asset mồ côi, chạy lại `reused` (đúng doc) |
| Cờ chỉ hợp lệ với publish-post | OK | `COMMAND_SCOPED_FLAGS["images-dir"] = ["publish-post"]`; test `upload … --images-dir` → exit 2 |
| Deviation `{posts, images, warnings}` | OK | Mọi caller đã cập nhật (cli + test) |
| Dòng image `status=missing` vs grep workflow | Rủi ro thấp | Image chỉ liệt kê cho locale `missing` (`:204`), và `status=missing` chỉ khi ảnh nằm trong needUpload (sinh từ locale missing) → mỗi khi có dòng image missing thì luôn có dòng post missing; không tạo dương tính giả mới. Ghi thật không grep |
| UPLOAD_DIR thiếu khi ghi | OK | Báo trong `plan.problems` trước mọi ghi (`:216-218`) |

## Findings
- **MINOR-1** `tools/db/publish-post.ts:26` — `I7_MISSING_UPLOAD` sao chép nguyên văn chuỗi lỗi của `src/db/content-repo.ts:143`. Nếu ai đổi câu chữ ở content-repo, `needUpload` rỗng → **fail-closed** (mọi bài có ảnh bị từ chối, không ghi sai), nhưng hỏng tính năng âm thầm. Đề xuất (tuỳ chọn, task sau): export hằng tiền tố từ content-repo hoặc thêm test khoá chuỗi. Không chặn PASS.
- **MINOR-2** `tools/db/publish-post.ts:153-157` — `lstat` rồi `readFile(filePath)` theo đường dẫn (follow symlink). Nội dung được bảo vệ bởi hash check, nhưng nếu file bị tráo thành symlink tới file lớn/đặc biệt giữa hai lệnh, `readFile` có thể đọc file lớn vào RAM trước khi `inspectImage` từ chối. Yêu cầu kẻ tấn công có quyền ghi vào `--images-dir` trên runner trong lúc chạy → rủi ro rất thấp. Cứng hoá tuỳ chọn: `open(O_NOFOLLOW)` + `fstat` + đọc từ fd với giới hạn byte. Không chặn PASS.
- **INFO-1** `tools/db/publish-post.ts:209` — Có `--images-dir` thì manifest luôn được đọc/kiểm slug kể cả khi không ảnh nào cần upload (cả 2 bài exists). Chặt và nhất quán, nhưng T04 phải bảo đảm thư mục ảnh + manifest có mặt ở cả lượt chạy lại (rerun job) — nếu không lượt "exists" sẽ đỏ.
- **INFO-2** Tích hợp: task-01 đã commit sinh `/uploads/<sha>.<ext>` trong MDX; `ai-news.yml:143/157` hiện chưa truyền `--images-dir` → tuần có ảnh, dry-run sẽ đỏ (fail-closed, không ghi) cho tới khi T04 nối cờ + mount. Đúng thứ tự plan, ghi lại để T04 xử lý.
- **INFO-3** Nhánh symlink chỉ test được trên Linux/CI; DB test không được reviewer chạy lại (chỉ evidence Builder) → Residual risk, khuyến nghị chạy suite Postgres trong CI/T04 (`docker compose … --images-dir /in --dry-run` trên DB dev chưa chạy).

Không có finding CRITICAL/MAJOR.

## Verdict
**PASS** (Review level STRICT). Residual risk: DB test + symlink test chỉ có evidence của Builder; dry-run trong container nta-tools chưa chạy (để T04).
