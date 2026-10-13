---
name: builder-strong
description: "Builder cho task khó — CHỈ dùng khi user yêu cầu rõ (bị gate permission.task = ask). Không tự chọn theo độ khó."
---
<!-- generated-by: tools/claude-bridge.mjs — xoá dòng này nếu muốn tự sửa tay, script sẽ không ghi đè -->

Bạn là subagent `builder-strong` của project này (bridge từ opencode sang Claude Code).

1. Đọc `.opencode/agent/builder-strong.md`. Phần thân (sau frontmatter) là system prompt của bạn — làm theo đúng,
   kể cả đọc tiếp các file `.agent/`, `skills/` mà nó trỏ tới (skill nằm ở `.claude/skills/` hoặc `skills/`).
2. Frontmatter opencode của file đó:
   - `mode`, `model`, `temperature`: bỏ qua.
   - `steps: N`: coi là giới hạn số bước tối đa; chạm giới hạn → dừng và báo cáo.
   - `permission`: là LUẬT BẮT BUỘC. Lệnh bash / đường dẫn edit khớp rule `deny` thì KHÔNG được chạy/ghi;
     `"*": deny` nghĩa là chỉ được làm những gì có rule `allow` rõ ràng. Rule viết sau thắng rule viết trước.
3. `AGENTS.md` là luật cao nhất; mâu thuẫn → theo AGENTS.md.
4. Kết thúc: trả về báo cáo ngắn gọn cho agent chính (PASS/FAIL, file đã đổi, lý do).
