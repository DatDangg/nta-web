#!/usr/bin/env node
/**
 * claude-bridge.mjs — Cho Claude Code dùng được command/agent/skill của opencode-project-template.
 *
 * Sinh ra (KHÔNG sửa file opencode gốc):
 *   .opencode/command/<x>.md  → .claude/skills/<x>/SKILL.md (wrapper trỏ về file gốc, giữ $ARGUMENTS; gọi bằng /<x>,
 *                               chạy được cả Claude Code lẫn Cowork — Cowork không nạp .claude/commands)
 *   .opencode/agent/<x>.md    → .claude/agents/<x>.md     (subagent wrapper trỏ về file gốc)
 *   skills/<x>/               → .claude/skills/<x>/       (copy nguyên, format SKILL.md tương thích)
 *
 * Wrapper chỉ TRỎ về file gốc → template-sync cập nhật nội dung thì Claude Code dùng bản mới ngay.
 * Chỉ cần chạy lại script khi template THÊM/BỚT command/agent/skill (và sau mỗi lần sync cho skills).
 *
 * File nào không còn dòng GEN_MARK (bạn đã tự sửa tay) → script bỏ qua, không ghi đè.
 * Đặt ở tools/ (không phải scripts/) vì scripts/ là path template-managed, `template-sync --prune` sẽ xoá.
 *
 * Dùng:  node tools/claude-bridge.mjs            # sinh/cập nhật
 *        node tools/claude-bridge.mjs --dry-run  # chỉ in ra sẽ làm gì
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DRY = process.argv.includes('--dry-run')
const GEN_MARK = '<!-- generated-by: tools/claude-bridge.mjs — xoá dòng này nếu muốn tự sửa tay, script sẽ không ghi đè -->'
const ARG = '$' + 'ARGUMENTS' // tránh Claude Code thay thế khi đọc chính file này

const p = (...xs) => path.join(ROOT, ...xs)
const read = (f) => fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')
const log = (...a) => console.log(...a)

if (!fs.existsSync(p('AGENTS.md')) || !fs.existsSync(p('.opencode'))) {
  console.error('❌ Chạy script ở thư mục gốc repo (cần có AGENTS.md và .opencode/).')
  process.exit(1)
}

function description(src, fallbackName) {
  const fm = src.match(/^---\n([\s\S]*?)\n---/)
  if (fm) {
    const line = fm[1].split('\n').find((l) => /^description:\s*/.test(l))
    if (line) return line.replace(/^description:\s*/, '').replace(/^["']|["']$/g, '').trim()
  }
  const h = src.match(/^#\s+(.+)$/m)
  return h ? h[1].trim() : fallbackName
}

let written = 0, skipped = 0
function writeGenerated(file, content) {
  if (fs.existsSync(file) && !read(file).includes(GEN_MARK)) {
    log(`  ⏭  giữ nguyên (đã sửa tay): ${path.relative(ROOT, file)}`); skipped++; return
  }
  if (fs.existsSync(file) && read(file) === content) return
  log(`  ✏️  ${path.relative(ROOT, file)}`); written++
  if (!DRY) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content) }
}

const listMd = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : []

// ---- 1. commands → skills ----
// Sinh dạng skill (.claude/skills/<x>/SKILL.md) thay vì .claude/commands/<x>.md:
// Claude Code gọi được bằng /<x> như command, và Cowork (app Claude desktop) chỉ nạp skills, không nạp commands.
log('\n[commands] .opencode/command → .claude/skills/<x>/SKILL.md')
const cmdNames = []
const templateSkills = fs.existsSync(p('skills')) ? fs.readdirSync(p('skills')) : []
for (const f of listMd(p('.opencode', 'command'))) {
  const name = f.replace(/\.md$/, '')
  if (templateSkills.includes(name)) { log(`  ⚠️  bỏ qua /${name}: trùng tên skill trong skills/`); skipped++; continue }
  cmdNames.push(name)
  const desc = description(read(p('.opencode', 'command', f)), `/${name}`)
  const dir = p('.claude', 'skills', name)
  if (fs.existsSync(dir) && !fs.existsSync(path.join(dir, '.bridge-generated'))) {
    log(`  ⏭  giữ nguyên (không do script tạo): .claude/skills/${name}`); skipped++; continue
  }
  writeGenerated(path.join(dir, 'SKILL.md'), `---
name: ${name}
description: ${JSON.stringify(`Lệnh /${name} của project — CHỈ chạy khi user gõ /${name} hoặc nói rõ muốn chạy lệnh này. ${desc}`)}
argument-hint: "[tham số tuỳ chọn]"
---
${GEN_MARK}

Bridge opencode → Claude Code / Cowork cho lệnh \`/${name}\`.

1. Đọc \`AGENTS.md\` (luật cao nhất) nếu chưa đọc trong phiên này.
2. Đọc file \`.opencode/command/${f}\` và thực hiện ĐÚNG quy trình trong đó.
3. Biến tham số của lệnh (chỗ file gốc ghi dollar-ARGUMENTS) có giá trị: «${ARG}» — rỗng nghĩa là không truyền tham số.
   Nếu trong «» vẫn là nguyên chữ dollar-ARGUMENTS (môi trường không thay thế) → tham số là phần user gõ sau \`/${name}\`.
4. File gốc / \`.agent/\` bảo "gọi agent/subagent X" → dùng Task/Agent tool với subagent \`X\` (định nghĩa ở \`.claude/agents/X.md\`);
   môi trường không có subagent đó → tự đọc \`.claude/agents/X.md\` rồi làm vai X ngay trong phiên.
5. Frontmatter opencode trong file gốc (agent, model, subtask...) không áp dụng trực tiếp; chỉ dùng làm thông tin.
`)
  if (!DRY && fs.existsSync(dir)) fs.writeFileSync(path.join(dir, '.bridge-generated'), 'Sinh từ .opencode/command bởi tools/claude-bridge.mjs. Xoá file này nếu muốn tự quản lý thư mục.\n')
}

// ---- 2. agents ----
log('\n[agents] .opencode/agent → .claude/agents')
const agentNames = []
for (const f of listMd(p('.opencode', 'agent'))) {
  const name = f.replace(/\.md$/, ''); agentNames.push(name)
  const desc = description(read(p('.opencode', 'agent', f)), name)
  writeGenerated(p('.claude', 'agents', f), `---
name: ${name}
description: ${JSON.stringify(desc)}
---
${GEN_MARK}

Bạn là subagent \`${name}\` của project này (bridge từ opencode sang Claude Code).

1. Đọc \`.opencode/agent/${f}\`. Phần thân (sau frontmatter) là system prompt của bạn — làm theo đúng,
   kể cả đọc tiếp các file \`.agent/\`, \`skills/\` mà nó trỏ tới (skill nằm ở \`.claude/skills/\` hoặc \`skills/\`).
2. Frontmatter opencode của file đó:
   - \`mode\`, \`model\`, \`temperature\`: bỏ qua.
   - \`steps: N\`: coi là giới hạn số bước tối đa; chạm giới hạn → dừng và báo cáo.
   - \`permission\`: là LUẬT BẮT BUỘC. Lệnh bash / đường dẫn edit khớp rule \`deny\` thì KHÔNG được chạy/ghi;
     \`"*": deny\` nghĩa là chỉ được làm những gì có rule \`allow\` rõ ràng. Rule viết sau thắng rule viết trước.
3. \`AGENTS.md\` là luật cao nhất; mâu thuẫn → theo AGENTS.md.
4. Kết thúc: trả về báo cáo ngắn gọn cho agent chính (PASS/FAIL, file đã đổi, lý do).
`)
}

// ---- 3. skills ----
log('\n[skills] skills/ → .claude/skills')
const skillNames = []
if (fs.existsSync(p('skills'))) {
  for (const d of fs.readdirSync(p('skills'))) {
    const srcDir = p('skills', d)
    if (!fs.statSync(srcDir).isDirectory() || !fs.existsSync(path.join(srcDir, 'SKILL.md'))) continue
    skillNames.push(d)
    const dst = p('.claude', 'skills', d)
    const marker = path.join(dst, '.bridge-generated')
    if (fs.existsSync(dst) && !fs.existsSync(marker)) { log(`  ⏭  giữ nguyên (không do script tạo): .claude/skills/${d}`); skipped++; continue }
    log(`  📁 .claude/skills/${d}`); written++
    if (!DRY) {
      fs.rmSync(dst, { recursive: true, force: true })
      fs.cpSync(srcDir, dst, { recursive: true })
      fs.writeFileSync(marker, 'Copy từ skills/ bởi tools/claude-bridge.mjs. Xoá file này nếu muốn tự quản lý thư mục.\n')
    }
  }
}

// ---- 4. dọn wrapper mồ côi (template đã bỏ) ----
function prune(dir, keep, isDir) {
  if (!fs.existsSync(dir)) return
  for (const e of fs.readdirSync(dir)) {
    const name = isDir ? e : e.replace(/\.md$/, '')
    if (keep.includes(name)) continue
    const full = path.join(dir, e)
    const generated = isDir ? fs.existsSync(path.join(full, '.bridge-generated')) : e.endsWith('.md') && read(full).includes(GEN_MARK)
    if (!generated) continue
    log(`  🗑  ${path.relative(ROOT, full)} (không còn dùng)`)
    if (!DRY) fs.rmSync(full, { recursive: true, force: true })
  }
}
log('\n[prune]')
prune(p('.claude', 'commands'), [], false) // bản cũ sinh command wrapper ở đây → dọn, đã chuyển sang skills
if (!DRY && fs.existsSync(p('.claude', 'commands')) && fs.readdirSync(p('.claude', 'commands')).length === 0) fs.rmdirSync(p('.claude', 'commands'))
prune(p('.claude', 'agents'), agentNames, false)
prune(p('.claude', 'skills'), [...skillNames, ...cmdNames], true)

log(`\n${DRY ? '🔎 DRY-RUN — ' : '✅ '}${cmdNames.length} command, ${agentNames.length} agent, ${skillNames.length} skill · ghi ${written} · bỏ qua ${skipped}`)
if (!fs.existsSync(p('CLAUDE.md'))) log('⚠️  Chưa có CLAUDE.md → Claude Code sẽ KHÔNG tự đọc AGENTS.md. Tạo CLAUDE.md có dòng: @AGENTS.md')
log('↻ Mở lại Claude Code / phiên Cowork mới để nhận lệnh /<x>, agent, skill mới.')
