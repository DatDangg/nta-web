# Agent: reviewer — feature-content-database · phase-3-task-05 · round 1

- **CR:** CR-031 · R-16d, R-16b (4.2.0) quyết định #10 · Task: `tasks/feature-content-database/phase-3-task-05.md`
- **Review level:** STRICT
- **Reason:** upload/file access (route đọc volume), path traversal/symlink, DoS dung lượng/kích thước, parser binary header tự viết, write-path DB (`checkRecord` asset, bỏ I-1 cho asset), cấu hình `next/image` dùng chung mọi trang.
- **Blast radius:** mới `src/app/uploads/[...path]/route.ts`, `src/lib/uploads/{serve-upload,image-file,save-image}.ts` (+ `uploads.test.ts`), `tools/db/save-image.test.ts`; sửa `next.config.ts` (`images.localPatterns` → mọi `<Image>`), `src/db/content-rules.ts` (`checkRecord` → mọi ghi DB), `src/db/content-repo.ts` (`localePairWarnings`), `tools/db/content-cli.ts` (lệnh `upload`), `tools/db/content-repo.test.ts`, `.context/decisions.md`. Bỏ qua theo yêu cầu: `docs/content-bot/`, `spec/changes/2026-10-14-telegram-content-bot.md`, `.context/progress.json`, `.context/runs/*`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | 95 tests: 93 pass, 0 fail, 2 skip (suite `content-repo` / `saveImage` / import cần `TEST_DATABASE_URL` — reviewer không có DB) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn (`src/components/mdx/index.tsx:25`, ngoài diff) |
| `npm run build` | **Không chạy được** trong quyền reviewer: chỉ được chạy đúng `npm run build` (không đặt được env `SWC_NATIVE_BINDING_CACHE`) → `Failed to load native binding`. Dựa evidence Builder (build PASS, `ƒ /uploads/[...path]`, standalone + docker) |
| Test DB (`saveImage` created/reused/restored, version, asset write-path) | Không tự chạy — dựa evidence Builder (112 tests, 111 pass, 1 skip symlink Windows). Đã đọc code test `tools/db/save-image.test.ts` khớp mô tả |

## Skill gates
| Gate | Kết quả |
|---|---|
| aislop (`scan --changes`) | OK — **100/100**, 0 issue (11 file đổi) |
| oxlint (anti-slop) | skip, oxlint not configured |
| ocr | skip, ocr not installed |
| AI-readable | OK — mỗi file 1 trách nhiệm (nhận diện/lưu, phục vụ, saveImage), hàm ngắn, comment nêu WHY |
| blitzstrike | skip, không có môi trường pentest được phép |
| ai-friendly-web / Responsive | N/A — không đổi UI/robots/sitemap |

## (1) Serve `GET /uploads/[...path]` — traversal / symlink / header
- **Whitelist tên trước mọi I/O:** đúng 1 segment, `^([0-9a-f]{64})\.(jpg|png|webp)$` (`serve-upload.ts:30-32`). Next đã decode param → `..%2F`, `%2e%2e`, `\`, chữ hoa, `.svg`, `.png.txt`, nhiều segment đều trượt regex → 404 trước khi chạm đĩa. Test `uploads.test.ts:101-124` phủ đủ.
- **Realpath:** `realpath(root)` + `realpath(join(root, name))`, yêu cầu `dirname(file) === root` + `isFile()` (`serve-upload.ts:22-27`) → symlink ra ngoài / thư mục con / FIFO bị chặn; đọc chính đường đã resolve (TOCTOU chỉ khi kẻ tấn công đã có quyền ghi volume). Đã xác minh Builder chạy symlink trong docker → 404.
- **Lỗi:** ENOENT/ENOTDIR/ELOOP/EACCES → 404 `no-store`; lỗi khác rethrow → 500 trang lỗi Next (prod không in message/đường dẫn). UPLOAD_DIR thiếu/không tồn tại → 404. Không rò path.
- **Header:** Content-Type theo đuôi (đuôi do magic bytes quyết định lúc ghi), `Content-Length`, `Cache-Control: public, max-age=31536000, immutable`, `X-Content-Type-Options: nosniff`. Chỉ export GET → POST/PUT 405 (HEAD Next tự suy từ GET). Không có API upload HTTP — **không mở rộng scope**.
- **Middleware:** matcher `/((?!api|trpc|_next|_vercel|.*\..*).*)` (`src/middleware.ts:7`) loại đường có dấu chấm → `/uploads/<hash>.<ext>` không qua next-intl. Đúng như decisions.
- **Bộ nhớ:** đọc cả file vào RAM (`readFile`) thay vì stream — xem F1 (MINOR, bị chặn trên bởi giới hạn 5 MB ở write-path).

## (2) Parser header `image-file.ts` — bounds / vòng lặp / magic
| Kiểm | Kết quả |
|---|---|
| Thứ tự giới hạn | rỗng → `> 5 MB` → magic → kích thước, **trước** sha256 + ghi (`storeImageFile:125-126`) |
| PNG | signature 8 byte đủ; `byteLength < 24` → null; đọc 16..23 an toàn; IHDR phải ở offset 12 |
| JPEG | `FF D8 FF`; vòng `while (offset + 9 <= len)` bảo đảm mọi `getUint8/16` (tối đa `offset+8`) trong biên; độ dài segment giả 0/1 vẫn tăng `offset` ≥ 2 → **không vòng lặp vô hạn**, số vòng ≤ độ dài buffer; fill `FF FF` tăng 1; gặp SOS/EOI → null → từ chối |
| WebP | `RIFF....WEBP`; `< 30` → null; VP8/VP8L/VP8X đọc tối đa offset 29 → trong biên. Chunk khác → null → từ chối |
| Truncated/cắt cụt | Mọi nhánh trả null → `ImageRejectedError` có kiểm soát, không `RangeError` |
| SVG / text / polyglot đầu file | Không khớp magic → từ chối (test SVG có `<script>`) |
| Kích thước | 0 hoặc > 8192 mỗi cạnh → từ chối (PNG uint32, VP8X uint24 đều so được) |
- Còn lỏng: không kiểm start code VP8 (`9D 01 2A`) / signature VP8L (`0x2F`) / độ dài RIFF → F3 (MINOR). Thiếu test cho buffer cắt cụt / độ dài segment JPEG giả → F4 (MINOR test-coverage). Đã tự dò tay toàn bộ offset: không tìm thấy đường throw không kiểm soát.

## (3) Ghi file atomic + saveImage + R-16a
- Tmp `.tmp-<16 hex random>` **cùng thư mục** đích, `flag: "wx"` (không đè file có sẵn, không theo symlink sẵn có), `mode 0o644`, `rename` cùng FS; lỗi → `rm(temp, {force})` (`image-file.ts:131-139`). Tên tmp không khớp regex serve → không bao giờ bị phục vụ. Hai upload cùng hash song song: rename đè cùng nội dung — vô hại.
- Không `fsync` trước rename + nhánh "đã có file" không kiểm file cũ → F2 (MINOR).
- Thứ tự file trước → DB sau; DB lỗi → file mồ côi theo hash (đã ghi Residual risk).
- **Trùng hash:** asset sống → `reused` (không version mới); asset đã xoá mềm → `rollbackEntry(toVersion = version-1, expectedVersion = version)`. Đã kiểm `softDeleteEntry` (`content-repo.ts:315-323`) tăng version và giữ `data` → snapshot `version-1` là bản sống cuối; `rollbackEntry` (`:328-350`) đặt `deletedAt: null`, validate lại, ghi version mới + lịch sử → **đúng R-16a** (có version, optimistic lock). `createEntry` trên khoá đã xoá mềm báo I-5 (`:265-267`) nên dùng rollback là đúng đường.
- Alt truyền vào khi `reused`/`restored` bị bỏ qua im lặng → F5 (MINOR).
- Xoá mềm không xoá file vật lý (đúng scope) — hệ quả: ảnh đã xoá vẫn truy cập công khai theo URL hash, cache 1 năm → ghi Residual risk.

## (4) `checkRecord` asset + I-1
- `assetProblems` (`content-rules.ts:162-181`): locale = `vi`, slug sha256 hex, `data.sha256 === slug`, `data.path` = `/uploads/` + tên khớp **cùng regex với route serve** và hash = slug (chặn `/uploads/../…`, `.svg`, lệch slug), `mime` khớp đuôi, `bytes` 1..5 MB, `width/height` 1..8192 số nguyên, `alt` object chỉ key `vi|en` giá trị chuỗi (mảng bị `asRecord` loại). Chỉ áp khi `collection === "asset"` → **không đổi** luật collection khác; test seed toàn bộ vẫn PASS.
- `localePairWarnings` bỏ qua chỉ khi `record.collection === "asset"` (`content-repo.ts:173`) — không làm lỏng collection khác (điều kiện đúng-bằng, đặt đầu hàm).
- `registryValidation` I-7 cho bản ghi khác vẫn yêu cầu `/uploads/*` là asset còn sống (`content-repo.ts:135-143`) → bài viết không trỏ được ảnh của asset đã xoá.
- Không giới hạn độ dài `alt`/`originalName` và không chặn key thừa trong `data` → INFO (dữ liệu do saveImage sinh; alt chỉ render như text).

## (5) `images.localPatterns`
- Grep mọi chuỗi ảnh trong `src/**`, `content/**`, `tools/**` (ts/tsx/mdx/md/json): toàn bộ ảnh nội dung/hằng là `/images/...`; ngoài `/images` chỉ có `/uploads/...` trong test. **Không** có static import ảnh, **không** có `remotePatterns`/URL ảnh ngoài domain → đặt `localPatterns` không làm hỏng ảnh hiện có. Bản ghi DB đã import từ chính các file này (parity) nên cùng tập đường dẫn. Builder đã chứng minh `/_next/image?url=/images/brand/logo-lockup.png` 200, url ngoài pattern 400.
- `search` không khai báo → query string cho phép như cũ.

## (6) CLI `upload`
- Gate `--confirm-prod` áp cho `upload` cùng `rollback`, kiểm **trước** khi gọi saveImage (không ghi file lên volume khi bị từ chối) (`content-cli.ts:154`). Không in `DATABASE_URL`/secret; chỉ in path/mime/kích thước/entry. `ImageRejectedError` → `[cli] FAIL` exit 1.
- `readFile(file)` đọc hết file trước khi kiểm 5 MB → F6 (INFO; CLI do operator chạy).

## Findings round 1

### [MINOR] F1 — Serve nạp cả file vào RAM, không stream, không chặn kích thước khi đọc
- **Vị trí:** `src/lib/uploads/serve-upload.ts:36`. Mỗi request (kể cả request nội bộ từ optimizer `next/image`) đọc trọn file vào `Uint8Array`. Với file ≤ 5 MB do saveImage ghi thì trần ~5 MB/request, nhưng nhiều request đồng thời cùng URL nhân bộ nhớ tuyến tính; file đặt tay lên volume (không qua saveImage) không có trần.
- **Đề xuất:** dùng `stat.size` đã có để từ chối file > `MAX_UPLOAD_BYTES` (404) và trả body stream (`Readable.toWeb(createReadStream(file))`) với `Content-Length = stat.size`.

### [MINOR] F2 — Không fsync trước rename; nhánh "trùng hash" tin file cũ không kiểm
- **Vị trí:** `src/lib/uploads/image-file.ts:130`, `:134-135`. Mất điện/kill giữa ghi và flush có thể để lại `<hash>.<ext>` rỗng/cụt; lần upload sau `access()` thấy có file → `written: false`, không bao giờ sửa, trong khi route trả `immutable` 1 năm.
- **Đề xuất:** khi file đích đã tồn tại, so `stat.size === bytes.length` (rẻ) — lệch thì ghi lại qua tmp→rename; tuỳ chọn `fh.sync()` trước rename.

### [MINOR] F3 — Magic WebP chưa chặt
- **Vị trí:** `src/lib/uploads/image-file.ts:73-85`, `:92`. Chỉ kiểm `RIFF`/`WEBP` + FourCC chunk; không kiểm start code VP8 `9D 01 2A` (offset 23), signature VP8L `0x2F` (offset 20), độ dài RIFF ≤ kích thước file. File `RIFF....WEBPVP8X` + rác/HTML vẫn được nhận và lưu. Rủi ro thấp (phục vụ `image/webp` + `nosniff` → trình duyệt không render HTML; sharp lỗi khi tối ưu) nhưng là đường polyglot không cần thiết.
- **Đề xuất:** thêm 2 kiểm signature trên (+ tuỳ chọn RIFF size), 3-4 dòng.

### [MINOR] F4 — Thiếu test parser với dữ liệu cắt cụt / độ dài giả
- **Vị trí:** `src/lib/uploads/uploads.test.ts:48-69`. Không có ca: PNG < 24 byte / IHDR sai vị trí, JPEG chỉ `FF D8 FF`, JPEG độ dài segment 0/1/vượt buffer, chuỗi `FF FF…`, WebP < 30 byte, chunk lạ. Hiện code an toàn (đã dò tay) nhưng logic bounds quan trọng cần test chốt hồi quy.
- **Đề xuất:** thêm 1 test bảng các buffer trên → đều `ImageRejectedError` (không `RangeError`, kết thúc).

### [MINOR] F5 — Alt mới bị bỏ qua im lặng khi `reused`/`restored`
- **Vị trí:** `src/lib/uploads/save-image.ts:61-71`. Upload lại cùng ảnh kèm `--alt-vi/--alt-en` khác (hoặc bot gửi alt mới) không cập nhật alt, người gọi chỉ thấy status. Không phải lỗi dữ liệu.
- **Đề xuất:** ghi rõ trong output CLI/kết quả (vd cảnh báo "alt không đổi — dùng update") hoặc để CR-030 xử lý; ghi chú cho bot.

### [INFO] F6 — CLI đọc hết file trước khi kiểm dung lượng
- **Vị trí:** `tools/db/content-cli.ts:105`. Operator trỏ nhầm file lớn → tốn RAM trước khi bị từ chối. Đề xuất `stat` trước `readFile`. Bot CR-030 nên kiểm `file_size` Telegram trước khi tải.

## Verdict: **PASS**
Không có finding CRITICAL/MAJOR. Traversal/symlink/encoded bị chặn ở 2 lớp (regex tên + realpath), parser không có đường throw/vòng lặp ngoài kiểm soát, giới hạn 5 MB/8192 px kiểm trước hash/ghi, ghi atomic đúng, restore có version đúng R-16a, `checkRecord` asset chặt và không làm lỏng collection khác, `localPatterns` không ảnh hưởng ảnh hiện có, CLI có `--confirm-prod`, không mở API upload HTTP. F1–F5 nên sửa sớm (F2, F3 rẻ) nhưng không chặn commit.

## Residual risk
- `npm run build` và test cần Postgres không tự chạy được trong quyền reviewer — dựa evidence Builder (build/standalone/docker, 112 tests).
- Ảnh asset đã xoá mềm vẫn truy cập công khai theo URL hash (file không xoá, cache `immutable` 1 năm) — đúng scope R-16d nhưng cần ghi runbook nếu có yêu cầu gỡ ảnh thật (xoá file tay + purge cache).
- 8192×8192 (~67 MP) giải nén trong optimizer `next/image` tốn ~270 MB RAM/ảnh lần đầu — chấp nhận vì chỉ CLI/bot tin cậy ghi được; theo dõi khi VPS nhỏ.
- Builder đã ghi: 2 upload đồng thời cùng ảnh mới → lần sau lỗi I-5; file mồ côi khi DB lỗi; quyền uid 1001 thư mục upload.
