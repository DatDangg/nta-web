#!/usr/bin/env node
/**
 * install-claude-bridge.mjs — cài bridge opencode → Claude Code vào repo hiện tại (chạy 1 lần).
 *   cd D:\prj\nta-web
 *   node install-claude-bridge.mjs
 * Ghi: tools/claude-bridge.mjs, CLAUDE.md (merge nếu đã có), .claude/settings.json (merge nếu đã có),
 * rồi chạy bridge sinh .claude/skills (gồm cả lệnh /change...), .claude/agents. KHÔNG commit, KHÔNG push.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const p = (...x) => path.join(ROOT, ...x)
if (!fs.existsSync(p('AGENTS.md')) || !fs.existsSync(p('.opencode'))) {
  console.error('❌ Chạy trong thư mục gốc repo (cần có AGENTS.md và .opencode/). Ví dụ: cd D:\\prj\\nta-web')
  process.exit(1)
}

const BRIDGE = "#!/usr/bin/env node\n/**\n * claude-bridge.mjs — Cho Claude Code dùng được command/agent/skill của opencode-project-template.\n *\n * Sinh ra (KHÔNG sửa file opencode gốc):\n *   .opencode/command/<x>.md  → .claude/skills/<x>/SKILL.md (wrapper trỏ về file gốc, giữ $ARGUMENTS; gọi bằng /<x>,\n *                               chạy được cả Claude Code lẫn Cowork — Cowork không nạp .claude/commands)\n *   .opencode/agent/<x>.md    → .claude/agents/<x>.md     (subagent wrapper trỏ về file gốc)\n *   skills/<x>/               → .claude/skills/<x>/       (copy nguyên, format SKILL.md tương thích)\n *\n * Wrapper chỉ TRỎ về file gốc → template-sync cập nhật nội dung thì Claude Code dùng bản mới ngay.\n * Chỉ cần chạy lại script khi template THÊM/BỚT command/agent/skill (và sau mỗi lần sync cho skills).\n *\n * File nào không còn dòng GEN_MARK (bạn đã tự sửa tay) → script bỏ qua, không ghi đè.\n * Đặt ở tools/ (không phải scripts/) vì scripts/ là path template-managed, `template-sync --prune` sẽ xoá.\n *\n * Dùng:  node tools/claude-bridge.mjs            # sinh/cập nhật\n *        node tools/claude-bridge.mjs --dry-run  # chỉ in ra sẽ làm gì\n */\nimport fs from 'node:fs'\nimport path from 'node:path'\n\nconst ROOT = process.cwd()\nconst DRY = process.argv.includes('--dry-run')\nconst GEN_MARK = '<!-- generated-by: tools/claude-bridge.mjs — xoá dòng này nếu muốn tự sửa tay, script sẽ không ghi đè -->'\nconst ARG = '$' + 'ARGUMENTS' // tránh Claude Code thay thế khi đọc chính file này\n\nconst p = (...xs) => path.join(ROOT, ...xs)\nconst read = (f) => fs.readFileSync(f, 'utf8').replace(/\\r\\n/g, '\\n')\nconst log = (...a) => console.log(...a)\n\nif (!fs.existsSync(p('AGENTS.md')) || !fs.existsSync(p('.opencode'))) {\n  console.error('❌ Chạy script ở thư mục gốc repo (cần có AGENTS.md và .opencode/).')\n  process.exit(1)\n}\n\nfunction description(src, fallbackName) {\n  const fm = src.match(/^---\\n([\\s\\S]*?)\\n---/)\n  if (fm) {\n    const line = fm[1].split('\\n').find((l) => /^description:\\s*/.test(l))\n    if (line) return line.replace(/^description:\\s*/, '').replace(/^[\"']|[\"']$/g, '').trim()\n  }\n  const h = src.match(/^#\\s+(.+)$/m)\n  return h ? h[1].trim() : fallbackName\n}\n\nlet written = 0, skipped = 0\nfunction writeGenerated(file, content) {\n  if (fs.existsSync(file) && !read(file).includes(GEN_MARK)) {\n    log(`  ⏭  giữ nguyên (đã sửa tay): ${path.relative(ROOT, file)}`); skipped++; return\n  }\n  if (fs.existsSync(file) && read(file) === content) return\n  log(`  ✏️  ${path.relative(ROOT, file)}`); written++\n  if (!DRY) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content) }\n}\n\nconst listMd = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : []\n\n// ---- 1. commands → skills ----\n// Sinh dạng skill (.claude/skills/<x>/SKILL.md) thay vì .claude/commands/<x>.md:\n// Claude Code gọi được bằng /<x> như command, và Cowork (app Claude desktop) chỉ nạp skills, không nạp commands.\nlog('\\n[commands] .opencode/command → .claude/skills/<x>/SKILL.md')\nconst cmdNames = []\nconst templateSkills = fs.existsSync(p('skills')) ? fs.readdirSync(p('skills')) : []\nfor (const f of listMd(p('.opencode', 'command'))) {\n  const name = f.replace(/\\.md$/, '')\n  if (templateSkills.includes(name)) { log(`  ⚠️  bỏ qua /${name}: trùng tên skill trong skills/`); skipped++; continue }\n  cmdNames.push(name)\n  const desc = description(read(p('.opencode', 'command', f)), `/${name}`)\n  const dir = p('.claude', 'skills', name)\n  if (fs.existsSync(dir) && !fs.existsSync(path.join(dir, '.bridge-generated'))) {\n    log(`  ⏭  giữ nguyên (không do script tạo): .claude/skills/${name}`); skipped++; continue\n  }\n  writeGenerated(path.join(dir, 'SKILL.md'), `---\nname: ${name}\ndescription: ${JSON.stringify(`Lệnh /${name} của project — CHỈ chạy khi user gõ /${name} hoặc nói rõ muốn chạy lệnh này. ${desc}`)}\nargument-hint: \"[tham số tuỳ chọn]\"\n---\n${GEN_MARK}\n\nBridge opencode → Claude Code / Cowork cho lệnh \\`/${name}\\`.\n\n1. Đọc \\`AGENTS.md\\` (luật cao nhất) nếu chưa đọc trong phiên này.\n2. Đọc file \\`.opencode/command/${f}\\` và thực hiện ĐÚNG quy trình trong đó.\n3. Biến tham số của lệnh (chỗ file gốc ghi dollar-ARGUMENTS) có giá trị: «${ARG}» — rỗng nghĩa là không truyền tham số.\n   Nếu trong «» vẫn là nguyên chữ dollar-ARGUMENTS (môi trường không thay thế) → tham số là phần user gõ sau \\`/${name}\\`.\n4. File gốc / \\`.agent/\\` bảo \"gọi agent/subagent X\" → dùng Task/Agent tool với subagent \\`X\\` (định nghĩa ở \\`.claude/agents/X.md\\`);\n   môi trường không có subagent đó → tự đọc \\`.claude/agents/X.md\\` rồi làm vai X ngay trong phiên.\n5. Frontmatter opencode trong file gốc (agent, model, subtask...) không áp dụng trực tiếp; chỉ dùng làm thông tin.\n`)\n  if (!DRY && fs.existsSync(dir)) fs.writeFileSync(path.join(dir, '.bridge-generated'), 'Sinh từ .opencode/command bởi tools/claude-bridge.mjs. Xoá file này nếu muốn tự quản lý thư mục.\\n')\n}\n\n// ---- 2. agents ----\nlog('\\n[agents] .opencode/agent → .claude/agents')\nconst agentNames = []\nfor (const f of listMd(p('.opencode', 'agent'))) {\n  const name = f.replace(/\\.md$/, ''); agentNames.push(name)\n  const desc = description(read(p('.opencode', 'agent', f)), name)\n  writeGenerated(p('.claude', 'agents', f), `---\nname: ${name}\ndescription: ${JSON.stringify(desc)}\n---\n${GEN_MARK}\n\nBạn là subagent \\`${name}\\` của project này (bridge từ opencode sang Claude Code).\n\n1. Đọc \\`.opencode/agent/${f}\\`. Phần thân (sau frontmatter) là system prompt của bạn — làm theo đúng,\n   kể cả đọc tiếp các file \\`.agent/\\`, \\`skills/\\` mà nó trỏ tới (skill nằm ở \\`.claude/skills/\\` hoặc \\`skills/\\`).\n2. Frontmatter opencode của file đó:\n   - \\`mode\\`, \\`model\\`, \\`temperature\\`: bỏ qua.\n   - \\`steps: N\\`: coi là giới hạn số bước tối đa; chạm giới hạn → dừng và báo cáo.\n   - \\`permission\\`: là LUẬT BẮT BUỘC. Lệnh bash / đường dẫn edit khớp rule \\`deny\\` thì KHÔNG được chạy/ghi;\n     \\`\"*\": deny\\` nghĩa là chỉ được làm những gì có rule \\`allow\\` rõ ràng. Rule viết sau thắng rule viết trước.\n3. \\`AGENTS.md\\` là luật cao nhất; mâu thuẫn → theo AGENTS.md.\n4. Kết thúc: trả về báo cáo ngắn gọn cho agent chính (PASS/FAIL, file đã đổi, lý do).\n`)\n}\n\n// ---- 3. skills ----\nlog('\\n[skills] skills/ → .claude/skills')\nconst skillNames = []\nif (fs.existsSync(p('skills'))) {\n  for (const d of fs.readdirSync(p('skills'))) {\n    const srcDir = p('skills', d)\n    if (!fs.statSync(srcDir).isDirectory() || !fs.existsSync(path.join(srcDir, 'SKILL.md'))) continue\n    skillNames.push(d)\n    const dst = p('.claude', 'skills', d)\n    const marker = path.join(dst, '.bridge-generated')\n    if (fs.existsSync(dst) && !fs.existsSync(marker)) { log(`  ⏭  giữ nguyên (không do script tạo): .claude/skills/${d}`); skipped++; continue }\n    log(`  📁 .claude/skills/${d}`); written++\n    if (!DRY) {\n      fs.rmSync(dst, { recursive: true, force: true })\n      fs.cpSync(srcDir, dst, { recursive: true })\n      fs.writeFileSync(marker, 'Copy từ skills/ bởi tools/claude-bridge.mjs. Xoá file này nếu muốn tự quản lý thư mục.\\n')\n    }\n  }\n}\n\n// ---- 4. dọn wrapper mồ côi (template đã bỏ) ----\nfunction prune(dir, keep, isDir) {\n  if (!fs.existsSync(dir)) return\n  for (const e of fs.readdirSync(dir)) {\n    const name = isDir ? e : e.replace(/\\.md$/, '')\n    if (keep.includes(name)) continue\n    const full = path.join(dir, e)\n    const generated = isDir ? fs.existsSync(path.join(full, '.bridge-generated')) : e.endsWith('.md') && read(full).includes(GEN_MARK)\n    if (!generated) continue\n    log(`  🗑  ${path.relative(ROOT, full)} (không còn dùng)`)\n    if (!DRY) fs.rmSync(full, { recursive: true, force: true })\n  }\n}\nlog('\\n[prune]')\nprune(p('.claude', 'commands'), [], false) // bản cũ sinh command wrapper ở đây → dọn, đã chuyển sang skills\nif (!DRY && fs.existsSync(p('.claude', 'commands')) && fs.readdirSync(p('.claude', 'commands')).length === 0) fs.rmdirSync(p('.claude', 'commands'))\nprune(p('.claude', 'agents'), agentNames, false)\nprune(p('.claude', 'skills'), [...skillNames, ...cmdNames], true)\n\nlog(`\\n${DRY ? '🔎 DRY-RUN — ' : '✅ '}${cmdNames.length} command, ${agentNames.length} agent, ${skillNames.length} skill · ghi ${written} · bỏ qua ${skipped}`)\nif (!fs.existsSync(p('CLAUDE.md'))) log('⚠️  Chưa có CLAUDE.md → Claude Code sẽ KHÔNG tự đọc AGENTS.md. Tạo CLAUDE.md có dòng: @AGENTS.md')\nlog('↻ Mở lại Claude Code / phiên Cowork mới để nhận lệnh /<x>, agent, skill mới.')\n"
const CLAUDE_MD = "# CLAUDE.md — nta-web (Claude Code)\n\n@AGENTS.md\n\n## Chạy template opencode trong Claude Code\n- `AGENTS.md` (import ở trên) là LUẬT CAO NHẤT. Mâu thuẫn với thói quen mặc định → theo AGENTS.md.\n- Lệnh `/change`, `/bug`, `/feature`, `/bug-check`, `/resume`... là skill ở `.claude/skills/<lệnh>/SKILL.md` (chạy được cả Claude Code lẫn Cowork), mỗi file trỏ về `.opencode/command/*.md`.\n- User gõ `/<lệnh>` (vd `/change thêm banner`) mà môi trường không nhận ra lệnh/skill đó → coi như gọi lệnh: đọc `.opencode/command/<lệnh>.md`\n  và làm đúng quy trình, phần chữ sau `/<lệnh>` là tham số (`$ARGUMENTS`). Cowork chỉ nạp `.claude/skills/` lúc MỞ PHIÊN → lệnh mới cần phiên mới.\n- AGENTS.md / `.agent/` nói \"gọi agent/subagent X\" → dùng Task tool với subagent `X` (`.claude/agents/X.md`).\n- Skills: `.claude/skills/` (copy từ `skills/`). Sau mỗi lần template-sync → chạy `node tools/claude-bridge.mjs`.\n- `opencode.jsonc` KHÔNG có hiệu lực trong Claude Code. Quyền thật nằm ở `.claude/settings.json`.\n  Các rule `deny` trong `opencode.jsonc` và frontmatter agent vẫn là luật phải tự tuân thủ, trừ ngoại lệ push bên dưới.\n\n## Luật làm việc\n- Trước MỌI yêu cầu liên quan repo: phân loại intent theo bảng Router trong AGENTS.md TRƯỚC khi đụng code.\n  Không rõ intent → hỏi 1 câu ngắn. Đọc thêm `.agent/` / `.agent/workflows/` khi AGENTS.md trỏ tới.\n\n### Yêu cầu / bug mới (auto-intake)\n- Yêu cầu hoặc bug mới gửi qua chat → thêm 1 dòng vào `spec/changes/BACKLOG.md` (pending)\n  + tạo change doc `spec/changes/YYYY-MM-DD-<slug>.md` (copy `_TEMPLATE.md`), rồi báo user.\n- KHÔNG code ngay. Chỉ xử lý khi user bảo làm hoặc gõ `/change`.\n- Thiếu thông tin (màn hình, bước tái hiện, expected/actual) → hỏi ngắn, không tự đoán, không tự điền trạng thái.\n\n### Khi xử lý change\n- Theo `.agent/change-request.md`: classify → spec delta (nếu đổi behavior) → task → build → review.\n- Cập nhật `.context/progress.json` mỗi khi đổi trạng thái.\n- Xong: đóng change doc (status done → `spec/changes/archive/`) + cập nhật BACKLOG.md (done + ngày).\n\n### Commit / deploy\n- Tự commit theo `.agent/workflows/state-commit.md` §2.8 (1 task = 1 commit), chỉ stage đúng file của task,\n  KHÔNG gộp file user đang sửa dở.\n- Được tự `git push origin main` khi: review PASS + build/typecheck/lint PASS\n  (cần `.context/project-config.md`: `target_branch: main`, `auto_push_after_pass: true`, `forbidden_branch` ≠ main).\n  Có lệnh FAIL → không push, báo user.\n- KHÔNG force push, KHÔNG xoá branch, KHÔNG rewrite history (rebase, amend commit đã push, reset --hard).\n- Sau khi push: báo commit SHA + nội dung đã push.\n\n### Cập nhật template\n- Nguồn: github.com/ocanhdt12-gif/opencode-project-template (main), qua `node scripts/template-sync.mjs`.\n- Chỉ đồng bộ path template quản lý: AGENTS.md, .agent/, .opencode/, scripts/, skills/.\n- Giữ cấu hình riêng (model, verify commands trong `.opencode/agent/*`, `opencode.jsonc`).\n- Không đụng src/, docs/, spec/, tasks/, .context/ trừ khi template thêm file mới cần thiết.\n- Sync xong → `node tools/claude-bridge.mjs` để cập nhật `.claude/`.\n"
const SETTINGS = {
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git add:*)",
      "Bash(git commit -m:*)",
      "Bash(git push origin main)",
      "Bash(node tools/claude-bridge.mjs:*)"
    ],
    "deny": [
      "Bash(git push --force:*)",
      "Bash(git push -f:*)",
      "Bash(git push origin --force:*)",
      "Bash(git push origin -f:*)",
      "Bash(git push origin main --force:*)",
      "Bash(git push origin main -f:*)",
      "Bash(git push origin +main:*)",
      "Bash(git push --all:*)",
      "Bash(git push --mirror:*)",
      "Bash(git push origin --delete:*)",
      "Bash(git push --delete:*)",
      "Bash(git branch -D:*)",
      "Bash(git branch -d:*)",
      "Bash(git branch --delete:*)",
      "Bash(git reset --hard:*)",
      "Bash(git checkout --:*)",
      "Bash(git rebase:*)",
      "Bash(git commit --amend:*)",
      "Bash(git filter-branch:*)",
      "Bash(git filter-repo:*)",
      "Bash(npx prisma db push:*)",
      "Bash(npx prisma migrate reset:*)",
      "Bash(npx prisma db seed:*)",
      "Bash(npx drizzle-kit push:*)",
      "Bash(npx supabase db reset:*)",
      "Bash(pnpm db:push:*)",
      "Bash(pnpm db:reset:*)",
      "Bash(pnpm db:seed:*)",
      "Bash(npm run db:push:*)",
      "Bash(npm run db:reset:*)",
      "Bash(npm run db:seed:*)"
    ]
  }
}

// 1. tools/claude-bridge.mjs
fs.mkdirSync(p('tools'), { recursive: true })
fs.writeFileSync(p('tools', 'claude-bridge.mjs'), BRIDGE)
console.log('✏️  tools/claude-bridge.mjs')

// 2. CLAUDE.md
if (!fs.existsSync(p('CLAUDE.md'))) {
  fs.writeFileSync(p('CLAUDE.md'), CLAUDE_MD)
  console.log('✏️  CLAUDE.md (mới)')
} else {
  const cur = fs.readFileSync(p('CLAUDE.md'), 'utf8')
  if (cur.includes('## Chạy template opencode trong Claude Code')) {
    console.log('⏭  CLAUDE.md đã có phần bridge — giữ nguyên')
  } else {
    fs.copyFileSync(p('CLAUDE.md'), p('CLAUDE.md.bak'))
    const body = CLAUDE_MD.replace(/^# .*\n\n@AGENTS\.md\n/, '')
    const head = /^@AGENTS\.md\s*$/m.test(cur) ? '' : '@AGENTS.md\n\n'
    fs.writeFileSync(p('CLAUDE.md'), head + cur.trimEnd() + '\n' + body)
    console.log('✏️  CLAUDE.md (đã có → nối thêm phần bridge; bản cũ: CLAUDE.md.bak)')
  }
}

// 3. .claude/settings.json (merge permissions, không xoá rule cũ)
fs.mkdirSync(p('.claude'), { recursive: true })
const sp = p('.claude', 'settings.json')
let s = {}
if (fs.existsSync(sp)) {
  try { s = JSON.parse(fs.readFileSync(sp, 'utf8')) }
  catch { console.error('❌ .claude/settings.json hiện tại không phải JSON hợp lệ — sửa tay rồi chạy lại.'); process.exit(1) }
  fs.copyFileSync(sp, p('claude-settings.json.bak'))
}
s.$schema ??= SETTINGS.$schema
s.permissions ??= {}
for (const k of ['allow', 'deny']) {
  const set = new Set(s.permissions[k] || [])
  for (const r of SETTINGS.permissions[k]) set.add(r)
  s.permissions[k] = [...set]
}
fs.writeFileSync(sp, JSON.stringify(s, null, 2) + '\n')
console.log('✏️  .claude/settings.json' + (fs.existsSync(p('claude-settings.json.bak')) ? ' (merge; bản cũ: claude-settings.json.bak)' : ''))

// 4. chạy bridge
console.log('\n▶ node tools/claude-bridge.mjs')
const r = spawnSync(process.execPath, [p('tools', 'claude-bridge.mjs')], { stdio: 'inherit', cwd: ROOT })
if (r.status !== 0) { console.error('❌ bridge lỗi — gửi output này cho Claude.'); process.exit(1) }

console.log(`
✅ Xong. Việc còn lại:
  1. Mở lại Claude Code / phiên Cowork mới trong thư mục này → gõ / để thấy /change, /bug, /feature...
  2. Kiểm tra .context/project-config.md: target_branch: main · auto_push_after_pass: true · forbidden_branch ≠ main
  3. Commit riêng (không lẫn file đang sửa dở):
       git add CLAUDE.md tools/claude-bridge.mjs .claude
       git commit -m "chore: claude code bridge cho opencode template"
  4. Xoá file cài đặt (và file .bak nếu có): del install-claude-bridge.mjs
`)
