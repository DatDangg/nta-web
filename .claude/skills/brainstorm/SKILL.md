---
name: brainstorm
description: "Lệnh /brainstorm của project — CHỈ chạy khi user gõ /brainstorm hoặc nói rõ muốn chạy lệnh này. Brainstorm — đọc spec/code rồi (1) clear/làm rõ yêu cầu qua đối thoại + design doc (skill brainstorming) và (2) hỏi user nhập config dự án (git, package, verify commands, DB, models, deploy, monitoring) ghi .context/project-config.md. Chạy sau /spec-init hoặc chạy lại để update."
argument-hint: "[tham số tuỳ chọn]"
---
<!-- generated-by: tools/claude-bridge.mjs — xoá dòng này nếu muốn tự sửa tay, script sẽ không ghi đè -->

Bridge opencode → Claude Code / Cowork cho lệnh `/brainstorm`.

1. Đọc `AGENTS.md` (luật cao nhất) nếu chưa đọc trong phiên này.
2. Đọc file `.opencode/command/brainstorm.md` và thực hiện ĐÚNG quy trình trong đó.
3. Biến tham số của lệnh (chỗ file gốc ghi dollar-ARGUMENTS) có giá trị: «$ARGUMENTS» — rỗng nghĩa là không truyền tham số.
   Nếu trong «» vẫn là nguyên chữ dollar-ARGUMENTS (môi trường không thay thế) → tham số là phần user gõ sau `/brainstorm`.
4. File gốc / `.agent/` bảo "gọi agent/subagent X" → dùng Task/Agent tool với subagent `X` (định nghĩa ở `.claude/agents/X.md`);
   môi trường không có subagent đó → tự đọc `.claude/agents/X.md` rồi làm vai X ngay trong phiên.
5. Frontmatter opencode trong file gốc (agent, model, subtask...) không áp dụng trực tiếp; chỉ dùng làm thông tin.
