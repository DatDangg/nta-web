# CLAUDE.md — nta-web (Claude Code)

@AGENTS.md

## Chạy template opencode trong Claude Code
- `AGENTS.md` (import ở trên) là LUẬT CAO NHẤT. Mâu thuẫn với thói quen mặc định → theo AGENTS.md.
- Lệnh `/change`, `/bug`, `/feature`, `/bug-check`, `/resume`... là skill ở `.claude/skills/<lệnh>/SKILL.md` (chạy được cả Claude Code lẫn Cowork), mỗi file trỏ về `.opencode/command/*.md`.
- User gõ `/<lệnh>` (vd `/change thêm banner`) mà môi trường không nhận ra lệnh/skill đó → coi như gọi lệnh: đọc `.opencode/command/<lệnh>.md`
  và làm đúng quy trình, phần chữ sau `/<lệnh>` là tham số (`$ARGUMENTS`). Cowork chỉ nạp `.claude/skills/` lúc MỞ PHIÊN → lệnh mới cần phiên mới.
- AGENTS.md / `.agent/` nói "gọi agent/subagent X" → dùng Task tool với subagent `X` (`.claude/agents/X.md`).
- Skills: `.claude/skills/` (copy từ `skills/`). Sau mỗi lần template-sync → chạy `node tools/claude-bridge.mjs`.
- `opencode.jsonc` KHÔNG có hiệu lực trong Claude Code. Quyền thật nằm ở `.claude/settings.json`.
  Các rule `deny` trong `opencode.jsonc` và frontmatter agent vẫn là luật phải tự tuân thủ, trừ ngoại lệ push bên dưới.

## Luật làm việc
- Trước MỌI yêu cầu liên quan repo: phân loại intent theo bảng Router trong AGENTS.md TRƯỚC khi đụng code.
  Không rõ intent → hỏi 1 câu ngắn. Đọc thêm `.agent/` / `.agent/workflows/` khi AGENTS.md trỏ tới.

### Yêu cầu / bug mới (auto-intake)
- Yêu cầu hoặc bug mới gửi qua chat → thêm 1 dòng vào `spec/changes/BACKLOG.md` (pending)
  + tạo change doc `spec/changes/YYYY-MM-DD-<slug>.md` (copy `_TEMPLATE.md`), rồi báo user.
- KHÔNG code ngay. Chỉ xử lý khi user bảo làm hoặc gõ `/change`.
- Thiếu thông tin (màn hình, bước tái hiện, expected/actual) → hỏi ngắn, không tự đoán, không tự điền trạng thái.

### Khi xử lý change
- Theo `.agent/change-request.md`: classify → spec delta (nếu đổi behavior) → task → build → review.
- Cập nhật `.context/progress.json` mỗi khi đổi trạng thái.
- Xong: đóng change doc (status done → `spec/changes/archive/`) + cập nhật BACKLOG.md (done + ngày).

### Commit / deploy
- Tự commit theo `.agent/workflows/state-commit.md` §2.8 (1 task = 1 commit), chỉ stage đúng file của task,
  KHÔNG gộp file user đang sửa dở.
- Được tự `git push origin main` khi: review PASS + build/typecheck/lint PASS
  (cần `.context/project-config.md`: `target_branch: main`, `auto_push_after_pass: true`, `forbidden_branch` ≠ main).
  Có lệnh FAIL → không push, báo user.
- KHÔNG force push, KHÔNG xoá branch, KHÔNG rewrite history (rebase, amend commit đã push, reset --hard).
- Sau khi push: báo commit SHA + nội dung đã push.

### Cập nhật template
- Nguồn: github.com/ocanhdt12-gif/opencode-project-template (main), qua `node scripts/template-sync.mjs`.
- Chỉ đồng bộ path template quản lý: AGENTS.md, .agent/, .opencode/, scripts/, skills/.
- Giữ cấu hình riêng (model, verify commands trong `.opencode/agent/*`, `opencode.jsonc`).
- Không đụng src/, docs/, spec/, tasks/, .context/ trừ khi template thêm file mới cần thiết.
- Sync xong → `node tools/claude-bridge.mjs` để cập nhật `.claude/`.
