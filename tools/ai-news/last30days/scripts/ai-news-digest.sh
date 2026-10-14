#!/usr/bin/env bash
# ai-news-digest.sh — Thu thập tin AI trong tuần (4 topic + GitHub trending) → 1 file .clean.md.
#
# BẢO MẬT: Kết quả engine last30days là nội dung UNTRUSTED (Reddit/HN/web).
# Script tách phần dữ liệu an toàn bằng sanitize_brief.py và ghi ra file
# *.clean.md để LLM chỉ đọc dữ liệu đã lọc, KHÔNG đọc file raw.
#
# nta-web (đã sửa so với bản in-house, xem tools/ai-news/README.md):
#   - SKILL_DIR lấy theo vị trí script (không hardcode ~/.openclaw).
#   - --days 7 (AI_NEWS_DAYS) + GITHUB_DAYS=7; luôn --no-browser-cookies.
#   - Bước --discover có --save-suffix → được đưa vào sanitize.
#   - Log → stderr + file log; STDOUT chỉ in đường dẫn file .clean.md.
#   - Mỗi nguồn/topic lỗi → log + bỏ qua; chỉ fail (exit 3/4) khi KHÔNG còn dữ liệu nào.
#
# Env: LAST30DAYS_MEMORY_DIR (thư mục output) · LAST30DAYS_PYTHON (python3)
#      AI_NEWS_DAYS (7) · AI_NEWS_QUICK=1 (thêm --quick) · AI_NEWS_STEP_TIMEOUT (giây/topic, 900)
#      AI_NEWS_CLEAN_OUT (đường dẫn file .clean.md đầu ra, tuỳ chọn)
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SAVE_DIR="${LAST30DAYS_MEMORY_DIR:-$HOME/Documents/Last30Days}"
PYTHON="${LAST30DAYS_PYTHON:-python3}"
DAYS="${AI_NEWS_DAYS:-7}"
STEP_TIMEOUT="${AI_NEWS_STEP_TIMEOUT:-900}"
SANITIZER="$SCRIPT_DIR/sanitize_brief.py"
export GITHUB_DAYS="${GITHUB_DAYS:-$DAYS}"
mkdir -p "$SAVE_DIR"

RUN_SLUG="ai-digest-$(date +%Y%m%d)"
LOG_FILE="$SAVE_DIR/$RUN_SLUG.log"
CLEAN_FILE="${AI_NEWS_CLEAN_OUT:-$SAVE_DIR/$RUN_SLUG.clean.md}"

ENGINE_FLAGS=(--save-dir="$SAVE_DIR" --emit=compact --days "$DAYS" --no-browser-cookies)
if [ "${AI_NEWS_QUICK:-0}" = "1" ]; then
  ENGINE_FLAGS+=(--quick)
fi

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE" >&2; }

log "=== Bắt đầu thu thập tin AI ($RUN_SLUG, $DAYS ngày) ==="

RESULT_FILES=()

# $1 = nhãn suffix, các tham số còn lại = đối số engine (topic hoặc --discover <domain>)
run_research() {
  local suffix="$1"
  shift
  log "Research [$suffix]: $*"
  timeout "$STEP_TIMEOUT" "$PYTHON" "$SCRIPT_DIR/last30days.py" "$@" \
    "${ENGINE_FLAGS[@]}" --save-suffix="$RUN_SLUG-$suffix" \
    >>"$LOG_FILE" 2>&1
  local exit_code=$?
  local raw
  raw=$(ls -1t "$SAVE_DIR"/*"$RUN_SLUG-$suffix"*.md 2>/dev/null | head -1)
  if [ -n "$raw" ] && [ -f "$raw" ]; then
    RESULT_FILES+=("$raw")
    log "  -> $(basename "$raw") (exit $exit_code)"
  else
    log "  -> warning: không có output cho '$suffix' (exit $exit_code) — bỏ qua"
  fi
}

run_research "discover" --discover "AI agents"
run_research "ai-tools" "AI tools and startups trends"
run_research "ai-models" "new AI models and releases"
run_research "ai-papers" "AI research papers and breakthroughs"

log "Research: GitHub trending repos ($GITHUB_DAYS ngày)"
TREND_FILE="$SAVE_DIR/github-trending-$(date +%Y%m%d).md"
if bash "$SCRIPT_DIR/github-trending.sh" >"$TREND_FILE" 2>>"$LOG_FILE" && [ -s "$TREND_FILE" ]; then
  log "  -> GitHub trending: $(wc -l <"$TREND_FILE") dòng"
else
  log "  -> GitHub trending rỗng/lỗi — bỏ qua"
  TREND_FILE=""
fi

log "=== Sanitize dữ liệu (lọc prompt injection) ==="
SANITIZED=""
if [ ${#RESULT_FILES[@]} -gt 0 ]; then
  SANITIZED=$("$PYTHON" "$SANITIZER" "${RESULT_FILES[@]}" 2>>"$LOG_FILE")
fi

if [ -z "$SANITIZED" ] && [ -z "$TREND_FILE" ]; then
  log "LỖI: không còn dữ liệu nào sau khi thu thập + sanitize."
  exit 3
fi

mkdir -p "$(dirname "$CLEAN_FILE")"
if [ -n "$SANITIZED" ]; then
  printf '%s\n' "$SANITIZED" >"$CLEAN_FILE"
else
  # Chỉ còn GitHub trending: vẫn phải có banner bảo mật ở đầu file.
  "$PYTHON" -c 'import sys; sys.path.insert(0, sys.argv[1]); import sanitize_brief; print(sanitize_brief.HARD_BLOCK)' \
    "$SCRIPT_DIR" >"$CLEAN_FILE"
fi

# GitHub trending đã được định dạng sạch (field có cấu trúc) → gộp cuối file.
if [ -n "$TREND_FILE" ]; then
  printf '\n\n' >>"$CLEAN_FILE"
  cat "$TREND_FILE" >>"$CLEAN_FILE"
fi

if [ ! -s "$CLEAN_FILE" ]; then
  log "LỖI: file sạch rỗng."
  exit 4
fi

log "=== HOÀN TẤT: $CLEAN_FILE ($(wc -l <"$CLEAN_FILE") dòng) ==="
log "LLM chỉ được đọc file .clean.md; KHÔNG đọc các file *raw-*.md trong $SAVE_DIR."
echo "$CLEAN_FILE"
exit 0
