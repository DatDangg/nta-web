#!/usr/bin/env bash
# github-trending.sh — Lấy các repo GitHub chủ đề AI nổi bật trong N ngày gần đây.
# Dùng GitHub Search API public (token tuỳ chọn qua AI_NEWS_GH_TOKEN để nâng rate-limit).
#
# nta-web (đã sửa so với bản in-house):
#   - Log → stderr. STDOUT chỉ chứa markdown sạch; rỗng / rate-limit / lỗi mạng → STDOUT RỖNG.
#   - Lọc chủ đề AI: mỗi topic 1 query (GitHub search không OR được qualifier `topic:`), gộp + dedupe.
#   - Mặc định 7 ngày, ngưỡng stars thấp hơn (cửa sổ ngắn).
#   - Không cần jq: định dạng bằng python3 stdlib.
#
# Env: GITHUB_DAYS (7) · GITHUB_TOP_N (12) · GITHUB_MIN_STARS (50)
#      GITHUB_AI_TOPICS ("ai llm machine-learning generative-ai ai-agents") · AI_NEWS_GH_TOKEN (tuỳ chọn)
set -uo pipefail

API="https://api.github.com/search/repositories"
DAYS="${GITHUB_DAYS:-7}"
TOP_N="${GITHUB_TOP_N:-12}"
MIN_STARS="${GITHUB_MIN_STARS:-50}"
TOPICS="${GITHUB_AI_TOPICS:-ai llm machine-learning generative-ai ai-agents}"
SINCE=$(date -u -d "$DAYS days ago" +%Y-%m-%d)

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [github-trending] $*" >&2; }

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

AUTH_ARGS=()
if [ -n "${AI_NEWS_GH_TOKEN:-}" ]; then
  AUTH_ARGS=(-H "Authorization: Bearer $AI_NEWS_GH_TOKEN")
fi

log "Fetching AI repos (since $SINCE, stars>=$MIN_STARS, topics: $TOPICS)"
for topic in $TOPICS; do
  query="topic:$topic created:>=$SINCE stars:>=$MIN_STARS fork:false archived:false"
  encoded=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$query")
  if curl -fsS --max-time 60 \
      -H "Accept: application/vnd.github+json" \
      -H "User-Agent: nta-web-ai-news/1.0" \
      "${AUTH_ARGS[@]}" \
      -o "$WORK_DIR/$topic.json" \
      "$API?q=$encoded&sort=stars&order=desc&per_page=$TOP_N"; then
    log "  topic:$topic OK"
  else
    log "  topic:$topic lỗi (rate-limit/mạng) — bỏ qua"
    rm -f "$WORK_DIR/$topic.json"
  fi
done

shopt -s nullglob
files=("$WORK_DIR"/*.json)
if [ ${#files[@]} -eq 0 ]; then
  log "Không lấy được topic nào — stdout rỗng."
  exit 0
fi

# Định dạng: chỉ giữ field có cấu trúc; mô tả cắt ngắn, bỏ xuống dòng.
python3 - "$DAYS" "$TOP_N" "${files[@]}" <<'PY'
import json, re, sys

days, top_n, paths = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
repos = {}
for path in paths:
    try:
        with open(path, encoding="utf-8") as fh:
            items = json.load(fh).get("items") or []
    except (OSError, ValueError):
        continue
    for item in items:
        name = item.get("full_name")
        url = item.get("html_url") or ""
        if name and url.startswith("https://github.com/"):
            repos[name] = item

if not repos:
    print("[github-trending] 0 repo khớp — stdout rỗng.", file=sys.stderr)
    sys.exit(0)

def clean(text, limit):
    text = re.sub(r"[\x00-\x1f\x7f]", " ", str(text or ""))
    return re.sub(r"\s+", " ", text).strip()[:limit]

ranked = sorted(repos.values(), key=lambda r: r.get("stargazers_count", 0), reverse=True)[:top_n]
print(f"### Nguồn: GitHub — repo AI nổi bật ({days} ngày gần đây)")
for index, repo in enumerate(ranked, start=1):
    print(f"\n#### Repo {index}: {clean(repo['full_name'], 100)}")
    print(f"- ⭐ {int(repo.get('stargazers_count') or 0)} stars")
    print(f"- 📝 {clean(repo.get('description') or '(không có mô tả)', 200)}")
    print(f"  - URL: {repo['html_url']}")
print(f"[github-trending] {len(ranked)} repo", file=sys.stderr)
PY
exit 0
