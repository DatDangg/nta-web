---
name: design
description: "Lệnh /design của project — CHỈ chạy khi user gõ /design hoặc nói rõ muốn chạy lệnh này. Design — sinh design spec (screen specs) + design tokens trước khi chia layer/code. Thường chạy tự động trong /start; dùng tay để chạy lại/đổi design."
argument-hint: "[tham số tuỳ chọn]"
---
<!-- generated-by: tools/claude-bridge.mjs — xoá dòng này nếu muốn tự sửa tay, script sẽ không ghi đè -->

Bridge opencode → Claude Code / Cowork cho lệnh `/design`.

1. Đọc `AGENTS.md` (luật cao nhất) nếu chưa đọc trong phiên này.
2. Đọc file `.opencode/command/design.md` và thực hiện ĐÚNG quy trình trong đó.
3. Biến tham số của lệnh (chỗ file gốc ghi dollar-ARGUMENTS) có giá trị: «$ARGUMENTS» — rỗng nghĩa là không truyền tham số.
   Nếu trong «» vẫn là nguyên chữ dollar-ARGUMENTS (môi trường không thay thế) → tham số là phần user gõ sau `/design`.
4. File gốc / `.agent/` bảo "gọi agent/subagent X" → dùng Task/Agent tool với subagent `X` (định nghĩa ở `.claude/agents/X.md`);
   môi trường không có subagent đó → tự đọc `.claude/agents/X.md` rồi làm vai X ngay trong phiên.
5. Frontmatter opencode trong file gốc (agent, model, subtask...) không áp dụng trực tiếp; chỉ dùng làm thông tin.
