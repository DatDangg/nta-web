Agent: reviewer

# Review — feature-add-japanese-locale · phase-3-task-02 · round 1 (CR-044)

- **Review level:** NORMAL
- **Reason:** Chủ yếu as-built docs + runbook. Code đổi chỉ 2 chỗ hẹp: `next.config.ts` `headers()` (1 rule cache cho file font hash) và `tools/fonts/build-noto-jp.mjs` (script dev chạy tay, không vào runtime). Không đụng auth/API/schema/migration (migration `0002` thuộc task trước, ở đây chỉ được mô tả trong runbook). Builder đã PASS typecheck/lint/test/build + curl header.
- **Blast radius:** `docs/content-bot/*` (11 file — context bot, ảnh hưởng prompt bot khi seed ja), `docs/API_SPEC.md`, `docs/ERD.md`, `docs/DESIGN.md`, `docs/runbook/{db,ai-news}.md`, `.context/decisions.md`; runtime: header Cache-Control cho `/fonts/noto-sans-jp/<16hex>.woff2` (chỉ trang ja tải); dev-only: script tái tạo font.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26` no-img-element (baseline) |
| `npm test` | 231 tests: 228 pass / 1 fail / 2 skipped — fail = baseline `tools/db/content-rules.test.ts:29` "toàn bộ nội dung file … ảnh tồn tại" (thiếu `/uploads/*` local), không liên quan task |
| `npm run build` (cần `SWC_NATIVE_BINDING_CACHE=…`) | Blocked — lệnh có tiền tố env không khớp allowlist reviewer; dựa vào evidence builder (exit 0) |
| `next start` + `curl -sI` header font | Blocked — reviewer không được chạy server/curl; dựa vào evidence builder trong task file (woff2 `public, max-age=31536000, immutable`; css `public, max-age=0`) + đọc config |

## Kiểm theo checklist

1. **Docs khớp code thật — PASS**
   - Key regex `^[a-z_]+/(vi|en|ja)/[A-Za-z0-9-]+$` (`07`) khớp `routing.locales` `src/i18n/routing.ts:4` và `CONTENT_LOCALES` `src/db/schema.ts:46`.
   - CHECK `content_entries_locale_check IN ('vi','en','ja')`: `drizzle/0002_happy_magma.sql:2-3` + `src/db/schema.ts:87` — ERD/08 ghi đúng.
   - I-1: `src/db/content-repo.ts:174` bỏ qua locale ngoài `SEED_LOCALES` (ja không cảnh báo) — ERD/08 đúng. I-3/I-4 cùng locale: `content-repo.ts:156,162,309` (`findLiveEntry(..., record.locale, ...)`) — docs đúng, thứ tự seed `slug_registry/ja` trước `solution|product/ja` (05 §10, db.md §10 bước 5) đúng.
   - I-6: image `nta-tools` cũ từ chối ja — hợp lý vì I-6 dựa trên `CONTENT_LOCALES`.
   - Fallback en theo bản ghi: `src/lib/content/locale-fallback.ts:11` (`needsContentFallback` chỉ ja) — DESIGN/01 đúng; ngoại lệ `slug_registry` đọc `vi`, `ui_messages` ja dùng `ja.json`.
   - Contact `vi|en|ja`: `tools/contact-mail/Code.gs:30,115` `SUPPORTED_LOCALES_` — API_SPEC đúng.
   - `--alt-ja`: `tools/db/content-cli.ts:60,209` — 04/08 đúng.
   - publish-post ja tuỳ chọn: `tools/db/publish-post.ts:99-104,245-247` — db.md §9/ai-news.md đúng.
   - Parity bỏ ja: `tools/db/parity-check.ts:30,67` — ERD đúng.
   - Cron AI news `'0 1 * * 6'` = 08:00 thứ 7 VN: `.github/workflows/ai-news.yml:10` — đúng.
   - deploy.yml thứ tự backup pre-migrate → build migrator → gate → migrate → build/up → health (`.github/workflows/deploy.yml:56-83`) — runbook đúng. Gate regex `deploy/db/migration-gate.ts:10` khớp dòng duyệt `0002:1`.
   - Font: `src/app/[locale]/layout.tsx:74` chỉ link CSS khi `locale === 'ja'` — DESIGN đúng.
2. **Runbook rollout — PASS.** `docs/runbook/db.md` §10 đủ: checklist OFL.txt (user thêm), dán Code.gs, backup tay (lệnh trùng §1/§3), chạy thử `0002` trên DB tạm (`deploy/db/migrate-on-restore.sh` tồn tại, chuỗi `== KẾT QUẢ: PASS` khớp dòng 71), tránh khung 19:50–20:30 UTC; dòng duyệt đã có sẵn; push → deploy.yml; kiểm `__drizzle_migrations` + constraint; smoke `/ja`, `/ja/blog`, `/ja/contact`, `/ja/about`, `/ja/solutions/enterprise` (route tồn tại) + vi/en không có `noto-sans-jp`; rebuild `nta-tools`; bot seed ja; hạn chót trước cron thứ 7. Rollback không cần down migration (0002 chỉ nới CHECK). Thứ tự checklist đặt dán Code.gs trước backup — hợp lệ (script mới nhận tập rộng hơn, vô hại).
3. **Intent docs — PASS.** `SPECIFICATIONS.md`/BRD/PRD không nằm trong diff. G1 (R-20a.6 "next/font") ghi ở task file với câu đề xuất, status open — pending user; quyết định ghi ở `.context/decisions.md`.
4. **N2 — PASS.** Rule `source: '/fonts/noto-sans-jp/:file([0-9a-f]{16}\\.woff2)'` chỉ khớp woff2 tên hash; CSS/README không khớp → giữ mặc định. Thư mục có 126 file = 124 `.woff2` + `noto-sans-jp.css` + `README.md`; CSS có 124 `url(...)` và cả 124 khớp `/fonts/noto-sans-jp/[0-9a-f]{16}\.woff2`; glob tên woff2 chứa ký tự ngoài `[0-9a-f]` → 0 file. Header thật: dựa evidence builder (Blocked phía reviewer).
5. **N1 — PASS.** `tools/fonts/build-noto-jp.mjs:35-39`: `mkdirSync` rồi chỉ `rmSync` các file `*.woff2` + `noto-sans-jp.css`; `README.md`/`OFL.txt` giữ nguyên; `readdirSync` đã import (dòng 14). File con không phải thư mục → `rmSync` không cần `recursive`.
6. **Grep `(vi|en)` / `{vi,en}` — PASS có ngoại lệ.** Còn lại đều có lý do: cột nguồn file seed (ERD:52-53,60; 08:27-31,39 — có ghi chú ja ngay dưới), mô tả `SEED_LOCALES = vi|en` / image cũ `CONTENT_LOCALES = vi|en` (đúng nghĩa), db.md:238 (import seed lịch sử), ai-news.md:180-322 (sự cố w42 lịch sử), screenshots-mapping/reference (ngoài scope bot). Một chỗ hơi lệch — xem m1.

## Findings

### BLOCKER
- Không có.

### MAJOR
- Không có.

### MINOR
- **m1 — `docs/runbook/ai-news.md:324-325`:** đoạn "Dùng lại cho bài khác" (thủ tục CR-038 tái sử dụng) vẫn hướng dẫn 2 dòng `merge` + sửa file seed `src/content/blog/{vi,en}/<slug>.mdx`. Từ CR-044 bài AI weekly mới có thêm bản `ja` (file `blog/ja/` + bản ghi `post/ja/…`) → dùng lại thủ tục cho bài sau CR-044 sẽ bỏ sót bản ja (title/cover ja không được cập nhật). Đề xuất thêm 1 câu "(+ ja nếu bài có bản ja — CR-044)". Không chặn PASS.
- **m2 — `docs/runbook/db.md` §10 Rollback:** "revert commit app" chưa nói rõ CR-044 gồm nhiều commit (P2-T01…P3-T02) → nên ghi "revert dải commit CR-044" hoặc commit cụ thể. Thêm lưu ý: sau revert, `src/db/schema.ts` về CHECK `('vi','en')` trong khi DB đã ở `0002` → nếu sau này ai chạy `drizzle-kit generate` sẽ sinh migration thu hẹp CHECK (fail khi đã có hàng ja / là thao tác phá hoại). Edge-case vận hành, không chặn PASS.

## Verdict: **PASS**
Docs khớp code thật, runbook rollout + rollback đủ bước, intent docs không bị sửa (G1 pending user đúng quy trình), N1/N2 đúng. 2 MINOR có thể sửa kèm hoặc ghi residual.
