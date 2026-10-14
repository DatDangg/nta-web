#!/bin/sh
# Diễn tập / kiểm tra một bản dump: restore vào DB TẠM (mặc định nta_restore_check) rồi in số bản ghi
# để so với DB thật. KHÔNG đụng database nta_web. Chạy trong container nta-db-backup:
#   docker compose run --rm nta-db-backup /scripts/restore-check.sh /backups/<file>.dump [db_tạm]
set -eu

DUMP="${1:?usage: restore-check.sh <file.dump> [db_tạm]}"
TARGET_DB="${2:-nta_restore_check}"

# Script sẽ dropdb DB đích → chỉ cho tên tiền tố nta_restore_ (loại trừ nta_web, postgres, template0/1…).
case "$TARGET_DB" in
  "${PGDATABASE:-nta_web}"|postgres|template0|template1) echo "từ chối: không dùng $TARGET_DB làm DB tạm" >&2; exit 2 ;;
  *[!a-z0-9_]*) echo "tên DB tạm chỉ gồm a-z 0-9 _" >&2; exit 2 ;;
  nta_restore_?*) ;;
  *) echo "từ chối: tên DB tạm phải bắt đầu bằng nta_restore_ ($TARGET_DB)" >&2; exit 2 ;;
esac
[ -f "$DUMP" ] || { echo "không thấy $DUMP" >&2; exit 2; }

dropdb --if-exists "$TARGET_DB"
createdb "$TARGET_DB"
pg_restore --no-owner --exit-on-error -d "$TARGET_DB" "$DUMP"

echo "== restore $(basename "$DUMP") → $TARGET_DB: số bản ghi"
for db in "$TARGET_DB" "${PGDATABASE:-nta_web}"; do
  echo "-- $db"
  psql -d "$db" -At -F ' ' -c "
    select 'content_entries', count(*) from content_entries
    union all select 'content_versions', count(*) from content_versions
    union all select 'drizzle.__drizzle_migrations', count(*) from drizzle.__drizzle_migrations" || true
done
echo "Xong. Kiểm tra xong thì xoá DB tạm: dropdb $TARGET_DB"
