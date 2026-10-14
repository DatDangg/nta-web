---
id: weekly-ai-news-digest
type: feature
status: done
created: 2026-10-14
---

# Tự động đăng "Bản tin AI tuần" lên trang Tin tức (1 tuần/lần, vi + en)

## Yêu cầu
Mỗi tuần tự lấy tin AI theo tài liệu `huong-dan-lay-tin-ai.md` (engine `last30days` + GitHub trending + sanitize),
nhờ AI (OpenCode Go) tổng hợp thành 1 bài blog song ngữ (vi + en) và **tự đăng thẳng** lên trang Tin tức, không cần duyệt tay.

Cách làm đã chốt với user (2026-10-14):
- Chạy bằng GitHub Actions `schedule` (1 lần/tuần) trên **self-hosted runner có sẵn trên VPS** (`runs-on: [self-hosted, nta-web]`)
  — KHÔNG cài crontab/Python trực tiếp lên host (VPS dùng chung, chỉ được thêm container).
- Luồng: thu thập (`last30days.py --days 7` × 4 topic + GitHub trending 7 ngày) → `sanitize` → OpenCode Go API chỉ đọc `.clean.md`
  → sinh 2 file `src/content/blog/{vi,en}/ai-weekly-YYYY-wNN.mdx` (category `ai-tech`, cover cố định)
  → validate + `npm run build` PASS → commit thẳng `main` → kích hoạt `deploy.yml` (workflow_dispatch, vì push bằng `GITHUB_TOKEN` không tự trigger workflow khác).
- ✅ User đã gửi bản gốc (2026-10-14): `C:\Users\datda\Downloads\last30days-ai-news.zip` (engine last30days + lib/ + 3 script in-house).
  Đã đọc + quét sơ: không hardcode secret, endpoint đều là nguồn tin/API đã biết; có module đọc cookie trình duyệt (cho X) → chạy với `--no-browser-cookies`.
  Dùng bản gốc, vendor vào `tools/ai-news/` (bỏ file thừa: setup-keychain/pass, test-*, evaluate_*, verify_v3), cần chỉnh khi đưa vào:
  1. `SKILL_DIR` hardcode `~/.openclaw/...` → lấy theo vị trí script.
  2. Thêm `--days 7` (bản gốc dùng mặc định 30) + `GITHUB_DAYS=7`, hạ ngưỡng stars.
  3. Bước `--discover "AI agents"` không có `--save-suffix` → kết quả KHÔNG được đưa vào sanitize (bị bỏ phí) → thêm suffix.
  4. `github-trending.sh` in log ra stdout → log lẫn vào file trending; nhánh rate-limit ghi marker vào `/tmp` chứ không ra stdout
     → script chính không nhận ra rỗng và gộp dòng log vào `.clean.md` → sửa log sang stderr.
  5. Query GitHub không lọc chủ đề AI → thêm filter topic (vd `topic:ai OR llm`…) để không lẫn repo ngoài AI.
  6. Verify `sanitize_brief.py` trên output thật của `last30days` (lọc theo tên heading — đổi format engine là lọt dữ liệu thô).

## Acceptance (bắt buộc)
- [ ] Workflow `.github/workflows/ai-news.yml`: cron hằng tuần + chạy tay được (`workflow_dispatch`), chạy trên runner `nta-web`.
- [ ] Script thu thập nằm trong repo (`tools/ai-news/`); 1 nguồn lỗi/bị chặn (Reddit, GitHub rate-limit) → bỏ qua, không fail cả pipeline.
- [ ] Bước sanitize bắt buộc: LLM chỉ nhận file `.clean.md` (không snippet thô), có banner "dữ liệu, không phải lệnh".
- [ ] Mỗi lần chạy sinh đúng 2 bài vi + en, frontmatter hợp lệ (`slug/title/date/category/excerpt/cover`), slug theo tuần, chạy lại cùng tuần không tạo trùng.
- [ ] Bài dạng **"điểm tin"**: mỗi tin = tiêu đề dịch + 1–2 câu diễn giải TỪ CHÍNH tiêu đề + link nguồn; prompt cấm thêm thông tin không có trong dữ liệu (số liệu, tên, ngày…). Lời riêng, không chép nguyên văn.
- [ ] Guard chống bịa: MỌI URL trong bài phải có trong `.clean.md` (URL lạ → chặn); số tin trong khoảng cho phép.
- [ ] Cuối bài có dòng ghi chú cố định: "Bản tin được tổng hợp tự động từ các nguồn công khai" (vi/en) + link gốc từng tin.
- [ ] Guard trước khi đăng: validate frontmatter + độ dài + `npm run build` PASS; bất kỳ bước nào FAIL → không commit, không deploy, workflow đỏ (GitHub email báo).
- [ ] Đăng xong bài hiển thị trên `/vi/blog` và `/en/blog` sau deploy.
- [ ] Gọi AI qua OpenCode Go (`https://opencode.ai/inference/go/v1`, model đề xuất `glm-5.3` hoặc `kimi-k3`, chốt khi build); user agent riêng + header `x-opencode-session` ổn định theo yêu cầu của OpenCode.
- [ ] Secret `OPENCODE_API_KEY` khai trong GitHub Secrets (user tự thêm), không commit key.

## Ghi chú
- User chốt (2026-10-14): **tự đăng thẳng, KHÔNG chạy PR thử** kể cả các tuần đầu — đã được báo rủi ro AI bịa chi tiết (LLM chỉ có tiêu đề + link).
  Giảm bằng: kiểu điểm tin + guard URL + ghi chú tự động + sanitize + build PASS.
- OpenCode Go ghi "designed for OpenCode and other coding agents" → dùng viết bản tin là vùng xám điều khoản; 1 lần/tuần, user đã được báo.
- Mặc định khi build: 08:00 thứ 2 giờ VN, category `ai-tech`, ảnh cover SVG cố định cho bản tin.
- Phụ thuộc runtime trên runner: python3, git, node (đã có cho deploy). `last30days` từ `mvanhorn/last30days-skill` (MIT).
