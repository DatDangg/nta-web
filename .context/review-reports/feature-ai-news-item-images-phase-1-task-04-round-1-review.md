Agent: reviewer

# Review — feature-ai-news-item-images · phase-1-task-04 · round 1 (CR-035)

- **Review level:** STRICT
- **Reason:** workflow cron không người duyệt ghi DB prod + volume `/uploads` prod; tách phạm vi secret (OPENCODE_API_KEY / POSTGRES_PASSWORD / REVALIDATE_SECRET); dữ liệu ngoài (og:image) đi tới prod; runbook gỡ ảnh theo yêu cầu bản quyền (Q1).
- **Blast radius:** `.github/workflows/ai-news.yml` (job `digest`, `publish-db`), `docs/runbook/ai-news.md`, `docs/DESIGN.md` § Vận hành, `tools/ai-news/README.md`, task file. Không đụng `deploy.yml` / `content-ops.yml` / compose / source.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (reviewer chạy lại) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26` |
| actionlint / `bash -n` / python unittest 76 | Không chạy lại (ngoài quyền bash reviewer) — dùng kết quả Builder ghi trong task file |
| Workflow thật | KHÔNG chạy (đúng yêu cầu) |

## Đối chiếu trọng tâm
| Mục | Kết quả |
|---|---|
| Tách secret: chỉ Generate có `OPENCODE_API_KEY`; Render không key; `digest` không secret DB/revalidate, không docker socket | OK (`ai-news.yml:54-85`, `generate.py:436-437` chặn `--images-out` ngoài `render`) |
| Expression injection trong `run:` | OK — `vars.AI_NEWS_IMAGES`, `steps.dryrun.outputs.images_dir`, slug đều qua `env:`; `${{ }}` chỉ ở `with:`/`env:`. Slug do `week_info()` sinh (`ai-weekly-YYYY-wNN`), không từ LLM |
| Artifact chỉ ảnh + manifest, retention 7, tên theo slug, ignore khi trống | OK (`ai-news.yml:95-107`); glob 1 cấp → manifest nằm gốc artifact, khớp `-f $images_src/manifest.json` |
| publish-db mount `:ro` + `--images-dir` chỉ khi có manifest (T02 INFO-1) | OK (`ai-news.yml:193-198`, `221-225`), mảng bash không truyền cờ rỗng |
| Grep chỉ dòng bài (T02) | OK — `^publish-post post/[a-z]+/[^ ]+ status=missing$` khớp `content-cli.ts:229` (`post/<locale>/<slug>`), không khớp dòng `publish-post image …` (`content-cli.ts:226`) |
| Backup chỉ khi missing (CR-033) | OK (`ai-news.yml:212-214`) |
| Re-run failed jobs / thông báo thiếu artifact | OK — `::error::` khi dry-run lỗi và không có artifact; runbook §5 ghi rõ. Residual: artifact cross-attempt chưa kiểm thật |
| `continue-on-error` download | Chấp nhận — dry-run vẫn chặn nếu bài cần ảnh (I-7 `publish-post.ts:205-206`) |
| `timeout-minutes: 10` Render (T01 r2) | OK (`ai-news.yml:72`); og budget 90 s (`og_image.py:31`) |
| Dọn `$RUNNER_TEMP/ai-news-images` `if: always()` | OK (`ai-news.yml:244-246`) |
| Smoke `/uploads` | OK — regex khớp `upload_path()` (`generate.py:216`, ext jpg/png/webp `image_sniff.py:65-69`); không ảnh → bỏ qua |
| `vars.AI_NEWS_IMAGES=off` → `--no-images` | OK (`ai-news.yml:76-77`) |
| Deviation upload-artifact TRƯỚC commit+push | **Chấp nhận** — upload lỗi thì main chưa có bài trỏ `/uploads`; push lỗi chỉ để artifact thừa; `overwrite: true` xử lý re-run digest cùng run |
| Docs khớp code CLI | Phần lớn khớp: key asset `asset/vi/<sha256>` (`save-image.ts:59`, `ASSET_LOCALE="vi"`), `update --file -`/`delete --expected-version` (`content-cli.ts:17-19`), `originalName = sourceHost` (`publish-post.ts:247`), guard số liệu khớp `og_image.py:29-34`, ≤5 MB (`image-file.ts:8`). Lệch: xem Findings |

## Findings

### MAJOR-1 — Runbook §8 gỡ ảnh thiếu bước xoá cache next/image → ảnh vẫn phục vụ tới 31 ngày
- **File:** `docs/runbook/ai-news.md` §8 bước 3–4 (dòng ~131-135).
- Ảnh tin render qua `next/image` (`src/components/mdx/news-image.tsx:1`, test xác nhận URL `/_next/image?url=%2Fuploads%2F…`), `minimumCacheTTL: 2678400` (31 ngày, `next.config.ts:16`). Cache optimizer nằm ở `/app/.next/cache/images` trong container `nta-web` (ghi được, owner nextjs — `Dockerfile:47`) và chỉ mất khi container bị tạo lại.
- **Failure scenario:** nhận yêu cầu gỡ → làm đủ §8 (sửa bài, xoá mềm asset, `rm` file, revalidate) → `/uploads/<hash>` 404 nhưng `https://ntavietnam.tech/_next/image?url=%2Fuploads%2F<hash>.jpg&w=1080&q=75` vẫn trả ảnh từ cache tới 31 ngày (hoặc tới lần deploy kế tiếp) → gỡ không hoàn tất cho yêu cầu pháp lý (Q1).
- Ngoài ra `/uploads/*` trả `Cache-Control: public, max-age=31536000, immutable` (`src/lib/uploads/serve-upload.ts:45`) — browser/proxy đã tải vẫn giữ; runbook nên ghi rõ giới hạn này.
- **Đề xuất (Builder):** thêm bước sau `rm`: xoá cache optimizer (vd `docker exec nta-web rm -rf /app/.next/cache/images`, hoặc recreate container `nta-web`) rồi kiểm cả URL `/_next/image?url=…` trả lỗi; ghi chú cache browser `immutable` 1 năm ngoài tầm kiểm soát. (Builder tự xác minh đường dẫn cache thực tế trong image standalone.)

### MINOR-1 — Runbook còn tên bước cũ "Generate posts"
- **File:** `docs/runbook/ai-news.md:34`, `docs/runbook/ai-news.md:78`. Bước đã đổi thành "Generate items (LLM + guard)" (`ai-news.yml:54`) → người trực tìm sai tên bước trong log. Sửa tên; cân nhắc chuyển dòng "Render posts + ảnh tin" (dòng 82) lên ngay sau Generate cho đúng thứ tự.

### INFO-1 — Bước dùng mảng bash dựa vào shell mặc định
- `ai-news.yml:192-209`, `221-225` dùng mảng bash; runner mặc định `bash -e {0}` khi có bash nên chạy được. Có thể thêm `shell: bash` cho tường minh. Không chặn.

### INFO-2 — Render tính tuần lại độc lập với Generate
- `generate.py:440` — `render` gọi `week_info(now)` riêng. Dispatch tay sát 00:00 CN→T2 giờ VN có thể sinh items tuần W rồi render slug W+1 (guard theo tuần có thể đỏ). Cron 08:00 T2 không gặp. Ghi nhận, không chặn.

### INFO-3 — Runbook §8 bước 2 "bỏ đúng 2 dòng"
- MDX sinh `tag, "", credit, ""` (`generate.py:222`) → thực tế là 2 dòng nội dung + dòng trống. Có thể ghi "bỏ 2 dòng và dòng trống đi kèm". Không chặn.

## Residual risk
- Chưa chạy workflow thật; download-artifact@v4 ở "Re-run failed jobs" lấy artifact attempt trước — theo hành vi v4 (artifact theo run), chưa kiểm thực tế.
- Quyền đọc file artifact trong container `nta-tools` (uid 1001) qua bind `:ro` — mặc định file 644/dir 755 nên đọc được, chưa kiểm thật.
- Local DB dev end-to-end (verification plan) chưa làm; prod verify chờ lượt cron w43 + user cho phép.

## Verdict: **FAIL**
Lý do: MAJOR-1 (runbook gỡ ảnh — acceptance "Runbook có mục gỡ ảnh (Q1)" — chưa đủ bước để gỡ thật). Workflow YAML đạt toàn bộ trọng tâm STRICT; round 2 chỉ cần sửa docs (MAJOR-1 + MINOR-1).
