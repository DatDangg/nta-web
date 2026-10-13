#!/usr/bin/env bash
# Build/verify Next.js trong VM Linux của Cowork khi repo nằm trên Windows.
# Lý do: node_modules của repo là bản Windows (@next/swc-win32-x64-msvc) → `next build` không chạy trên Linux.
# Cách làm: đồng bộ mã nguồn sang bản sao ở $HOME/nta-build (ngoài thư mục dự án, không đụng file của user),
# cài node_modules Linux 1 lần (cài lại khi package-lock.json đổi), rồi chạy lệnh ở đó.
#
# Dùng (chạy từ gốc repo trong device_bash):
#   bash tools/linux-build.sh verify       # typecheck + lint + build (~1 phút; lần đầu mỗi phiên thêm ~25s npm ci)
#   bash tools/linux-build.sh build|typecheck|lint
#   bash tools/linux-build.sh serve 3100 curl -s --noproxy '*' localhost:3100/blog   # smoke test trên bản build
# LƯU Ý: mỗi lệnh device_bash là 1 sandbox riêng, tiến trình nền chết khi lệnh kết thúc → build + test server
# phải nằm trong CÙNG 1 lệnh (giới hạn ~180s). $HOME/nta-build mất khi sang phiên mới → script tự dựng lại.
# Playwright/Chromium KHÔNG có trong VM (CDN tải browser bị chặn) → test UI/screenshot vẫn chạy ở cloud container.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${NTA_BUILD_DIR:-$HOME/nta-build}"
LOG="$DEST/.build.log"
SYNC_PATHS=(src public package.json package-lock.json next.config.ts tsconfig.json tailwind.config.ts
            postcss.config.mjs .eslintrc.json next-env.d.ts .env.local)

sync() {
  mkdir -p "$DEST"
  local p
  for p in "${SYNC_PATHS[@]}"; do
    [ -e "$REPO/$p" ] || continue
    if [ -d "$REPO/$p" ]; then
      rsync -a --delete "$REPO/$p/" "$DEST/$p/"
    else
      rsync -a "$REPO/$p" "$DEST/$p"
    fi
  done
}

deps() {
  local want have=""
  want="$(sha1sum "$DEST/package-lock.json" | cut -d' ' -f1)"
  [ -f "$DEST/node_modules/.lock-sha" ] && have="$(cat "$DEST/node_modules/.lock-sha")"
  if [ "$want" != "$have" ] || [ ! -d "$DEST/node_modules/next" ]; then
    echo "[linux-build] npm ci (Linux deps)…"
    (cd "$DEST" && npm ci --no-audit --no-fund --loglevel=error)
    unpack_swc
    echo "$want" > "$DEST/node_modules/.lock-sha"
  fi
}

# @swc/core 1.16 (next-intl plugin dùng) ship file .node dạng "carrier": lúc load nó giải nén binary thật
# vào ~/.cache và từ chối nếu thư mục cha không thuộc user/root — VM Cowork có / thuộc `nobody` nên luôn lỗi
# "Failed to load native binding". Giải nén sẵn payload (zstd, ELF) đặt cạnh @swc/core → binding.js load trực tiếp.
unpack_swc() {
  local carrier="$DEST/node_modules/@swc/core-linux-x64-gnu/swc.linux-x64-gnu.node" core
  [ -f "$carrier" ] || return 0
  while IFS= read -r core; do
    [ -f "$core/swc.linux-x64-gnu.node" ] && continue
    python3 - "$carrier" "$core/swc.linux-x64-gnu.node" <<'PY'
import re, subprocess, sys
data = open(sys.argv[1], 'rb').read()
for m in re.finditer(re.escape(b'\x28\xb5\x2f\xfd'), data):
    out = subprocess.run(['zstd', '-dcq'], input=data[m.start():], capture_output=True).stdout
    if out[:4] == b'\x7fELF' and len(out) > 1_000_000:
        open(sys.argv[2], 'wb').write(out); print('[linux-build] unpacked swc ->', sys.argv[2]); break
else:
    sys.exit('[linux-build] không tìm thấy payload ELF trong ' + sys.argv[1])
PY
  done < <(find "$DEST/node_modules" -type d -path '*/@swc/core' -not -path '*/.cache/*')
}

# next/font/google cần fonts.googleapis.com + fonts.gstatic.com — egress của VM chặn 2 host này (403).
# Dùng cơ chế mock có sẵn của Next (NEXT_FONT_GOOGLE_MOCKED_RESPONSES): CSS @font-face trỏ tới file Inter
# variable THẬT lấy từ npm (@fontsource-variable/inter) → build + ảnh chụp vẫn đúng font Inter.
# Chỉ hỗ trợ Inter (font duy nhất repo dùng); thêm font Google khác → build báo "Missing mocked response".
FONT_PKG="@fontsource-variable/inter@5.3.0"
fonts() {
  local dir="$DEST/.fonts"
  if [ ! -f "$dir/package/wght.css" ]; then
    mkdir -p "$dir"
    (cd "$dir" && npm pack "$FONT_PKG" --silent >/dev/null && tar xzf ./*.tgz)
  fi
  node - "$dir/package" "$DEST/.font-mock.js" <<'JS'
const fs = require('fs'), [pkg, out] = process.argv.slice(2);
const css = fs.readFileSync(pkg + '/wght.css', 'utf8')
  .replace(/\/\* inter-(\S+)-wght-normal \*\//g, '/* $1 */')
  .replace(/'Inter Variable'/g, "'Inter'")
  .replace(/url\(\.\/files\//g, 'url(' + pkg + '/files/')
  .replace(/woff2-variations/g, 'woff2');
fs.writeFileSync(out, 'const css = ' + JSON.stringify(css) + ';\n' +
  'module.exports = new Proxy({}, { get: (_, url) => (typeof url === "string" && /family=Inter[:&]/.test(url) ? css : undefined) });\n');
JS
}

export NEXT_TELEMETRY_DISABLED=1 NEXT_FONT_GOOGLE_MOCKED_RESPONSES="$DEST/.font-mock.js"
run() { (cd "$DEST" && npm run --silent "$@"); }

cmd="${1:-build}"; shift || true
case "$cmd" in
  setup)     sync; deps; fonts; echo "[linux-build] ready: $DEST" ;;
  build|typecheck|lint)
             sync; deps; fonts; run "$cmd" ;;
  verify)    sync; deps; fonts
             run typecheck && echo "[verify] typecheck PASS"
             run lint && echo "[verify] lint PASS"
             run build >"$LOG" 2>&1 || { tail -n 40 "$LOG"; echo "[verify] build FAIL"; exit 1; }
             echo "[verify] build PASS" ;;
  serve)     # serve <port> <lệnh...> : next start (bản build gần nhất) → chạy lệnh → tắt server
             port="${1:-3100}"; shift || true
             (cd "$DEST" && exec npx next start -p "$port" >"$DEST/.start.log" 2>&1) & pid=$!
             trap 'kill $pid 2>/dev/null' EXIT
             for _ in $(seq 1 30); do curl -s -o /dev/null --noproxy '*' "http://localhost:$port" && break; sleep 1; done
             "$@" ;;
  *)         echo "usage: $0 setup|build|typecheck|lint|verify|serve <port> <cmd...>" >&2; exit 2 ;;
esac
