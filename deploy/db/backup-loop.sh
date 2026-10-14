#!/bin/sh
# Entrypoint sidecar nta-db-backup: chạy backup.sh daily mỗi ngày lúc BACKUP_HOUR_UTC (mặc định 20 = 03:00 giờ VN).
# Thay cho cron trên host (VPS dùng chung — không sửa crontab hệ thống). Backup lỗi chỉ ghi log, vòng lặp vẫn chạy.
set -eu

HOUR="${BACKUP_HOUR_UTC:-20}"
case "$HOUR" in
  ''|*[!0-9]*) echo "BACKUP_HOUR_UTC phải là số 0-23" >&2; exit 2 ;;
esac
if [ "$HOUR" -gt 23 ]; then
  echo "BACKUP_HOUR_UTC phải là số 0-23" >&2
  exit 2
fi

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) [backup-loop] start — backup hằng ngày lúc ${HOUR}:00 UTC"
while :; do
  now=$(( $(date -u +%s) % 86400 ))
  wait=$(( (HOUR * 3600 - now + 86400) % 86400 ))
  [ "$wait" -eq 0 ] && wait=86400
  sleep "$wait"
  /scripts/backup.sh daily || echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) [backup-loop] backup daily FAILED (xem dòng FAILED phía trên)"
done
