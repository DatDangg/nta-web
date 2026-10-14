#!/bin/sh
# Backup PostgreSQL (pg_dump -Fc) [+ thư mục ảnh upload] ra /backups — chạy trong container nta-db-backup.
#   backup.sh daily                → daily-<UTC>.dump + uploads-<UTC>.tar.gz, giữ BACKUP_KEEP bản mỗi loại
#   backup.sh pre-migrate-<id>     → pre-migrate-<id>.dump (chỉ DB), giữ BACKUP_KEEP bản pre-migrate-*
#                                    (deploy: <id> = <sha12>-<run_id>-<run_attempt> → mỗi lần chạy 1 file riêng)
# KHÔNG BAO GIỜ ghi đè file backup đã có: trùng tên → FAILED, exit 1 (giữ nguyên điểm khôi phục cũ).
# Exit ≠ 0 khi dump lỗi (deploy dựa vào exit code để dừng trước migrate).
# Kết nối qua env PGHOST/PGUSER/PGDATABASE/PGPASSWORD (compose cấp) — không in ra log.
set -eu

LABEL="${1:-daily}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
UPLOADS_DIR="${UPLOADS_DIR:-/uploads}"
KEEP="${BACKUP_KEEP:-14}"
MIN_FREE_MB="${BACKUP_MIN_FREE_MB:-2048}"
LOG_FILE="$BACKUP_DIR/backup.log"

case "$LABEL" in
  daily|pre-migrate-*) ;;
  *) echo "usage: backup.sh daily|pre-migrate-<id>" >&2; exit 2 ;;
esac
case "$LABEL" in
  *[!A-Za-z0-9._-]*) echo "label chứa ký tự không hợp lệ" >&2; exit 2 ;;
esac

log() {
  line="$(date -u +%Y-%m-%dT%H:%M:%SZ) [backup:$LABEL] $*"
  echo "$line"
  echo "$line" >> "$LOG_FILE" 2>/dev/null || true
}

# Cảnh báo (không fail) khi dung lượng trống của thư mục backup dưới ngưỡng.
warn_low_disk() {
  free_kb="$(df -Pk "$BACKUP_DIR" | awk 'NR==2 {print $4}')"
  if [ -n "$free_kb" ] && [ "$free_kb" -lt $((MIN_FREE_MB * 1024)) ]; then
    log "WARNING dung lượng trống $((free_kb / 1024)) MB < ngưỡng ${MIN_FREE_MB} MB tại $BACKUP_DIR"
  fi
}

# Giữ KEEP file mới nhất theo mtime cho 1 prefix (vd daily-*.dump).
rotate() {
  # shellcheck disable=SC2012 # tên file do script tự đặt, không có khoảng trắng
  ls -1t "$BACKUP_DIR"/$1 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
    rm -f "$old"
    log "rotate: xoá $(basename "$old")"
  done
}

fail() {
  log "FAILED $*"
  exit 1
}

# Đổi tên file tạm → tên cuối, không bao giờ ghi đè (mv -n + kiểm lại vì có thể có tiến trình khác tạo cùng tên).
publish_file() {
  mv -n "$BACKUP_DIR/$1" "$BACKUP_DIR/$2"
  if [ -e "$BACKUP_DIR/$1" ]; then
    rm -f "$BACKUP_DIR/$1"
    fail "$2 đã tồn tại — không ghi đè"
  fi
}

refuse_existing() {
  [ ! -e "$BACKUP_DIR/$1" ] || fail "$1 đã tồn tại — không ghi đè backup cũ (đổi label/chờ giây kế tiếp)"
}

mkdir -p "$BACKUP_DIR"
warn_low_disk

if [ "$LABEL" = "daily" ]; then
  STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
  DUMP_NAME="daily-$STAMP.dump"
else
  DUMP_NAME="$LABEL.dump"
fi

# Ghi ra file tạm rồi mới đổi tên → dump dở dang không bao giờ mang tên hợp lệ / không lọt vào rotate.
refuse_existing "$DUMP_NAME"
TMP_DUMP="$BACKUP_DIR/.tmp-$DUMP_NAME"
pg_dump -Fc --no-owner -f "$TMP_DUMP" || { rm -f "$TMP_DUMP"; fail "pg_dump lỗi"; }
pg_restore --list "$TMP_DUMP" > /dev/null || { rm -f "$TMP_DUMP"; fail "dump không đọc được (pg_restore --list)"; }
publish_file ".tmp-$DUMP_NAME" "$DUMP_NAME"
log "OK db → $DUMP_NAME ($(du -h "$BACKUP_DIR/$DUMP_NAME" | cut -f1))"

if [ "$LABEL" = "daily" ]; then
  rotate 'daily-*.dump'
  if [ -d "$UPLOADS_DIR" ]; then
    TAR_NAME="uploads-$STAMP.tar.gz"
    refuse_existing "$TAR_NAME"
    tar -czf "$BACKUP_DIR/.tmp-$TAR_NAME" -C "$UPLOADS_DIR" . || { rm -f "$BACKUP_DIR/.tmp-$TAR_NAME"; fail "tar uploads lỗi"; }
    publish_file ".tmp-$TAR_NAME" "$TAR_NAME"
    log "OK uploads → $TAR_NAME ($(du -h "$BACKUP_DIR/$TAR_NAME" | cut -f1))"
    rotate 'uploads-*.tar.gz'
  else
    log "WARNING không thấy $UPLOADS_DIR — bỏ qua backup ảnh upload"
  fi
else
  rotate 'pre-migrate-*.dump'
fi
