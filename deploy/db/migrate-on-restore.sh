#!/bin/sh
# Chạy THỬ migration trên bản restore (thay "verify staging" — R-16c, không có DB staging):
#   restore backup → DB tạm nta_restore_* → gate + migrate với DATABASE_URL trỏ DB tạm → in kết quả → xoá DB tạm.
# KHÔNG đụng database nta_web. Không cần secret GitHub: mật khẩu lấy từ env có sẵn trong container nta-db.
# Chạy trên VPS, đứng trong workspace đã checkout commit cần thử (thư mục có Dockerfile + drizzle/):
#   sh deploy/db/migrate-on-restore.sh                       # backup .dump mới nhất, DB tạm nta_restore_migtest
#   sh deploy/db/migrate-on-restore.sh <file.dump> [nta_restore_xxx]
# Env tuỳ chọn (diễn tập local): NTA_DB_CONTAINER, NTA_BACKUP_CONTAINER, NTA_DB_NETWORK,
#   MIGRATE_IMAGE (bỏ qua bước build image migrator nếu đã có).
set -eu

DB_CONTAINER="${NTA_DB_CONTAINER:-nta-db}"
BACKUP_CONTAINER="${NTA_BACKUP_CONTAINER:-nta-db-backup}"
DUMP_NAME="${1:-}"
TARGET_DB="${2:-nta_restore_migtest}"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Chỉ DB tạm tiền tố nta_restore_ (restore-check.sh cũng chặn lần nữa vì nó dropdb DB đích).
case "$TARGET_DB" in
  *[!a-z0-9_]*) echo "tên DB tạm chỉ gồm a-z 0-9 _" >&2; exit 2 ;;
  nta_restore_?*) ;;
  *) echo "từ chối: tên DB tạm phải bắt đầu bằng nta_restore_ ($TARGET_DB)" >&2; exit 2 ;;
esac

if [ -z "$DUMP_NAME" ]; then
  DUMP_NAME="$(docker exec "$BACKUP_CONTAINER" sh -c 'ls -1t /backups/*.dump 2>/dev/null | head -n 1 | xargs -r basename')"
fi
[ -n "$DUMP_NAME" ] || { echo "không có file .dump trong /backups" >&2; exit 2; }
DUMP_NAME="$(basename "$DUMP_NAME")"
echo "== dump: $DUMP_NAME → DB tạm $TARGET_DB"

cleanup() {
  docker exec "$BACKUP_CONTAINER" dropdb --if-exists "$TARGET_DB" && echo "== đã xoá DB tạm $TARGET_DB"
}
trap cleanup EXIT
# sh không chạy trap EXIT khi bị tín hiệu → đổi tín hiệu thành exit để DB tạm vẫn được xoá (Ctrl-C, mất SSH).
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

docker exec "$BACKUP_CONTAINER" /scripts/restore-check.sh "/backups/$DUMP_NAME" "$TARGET_DB"

NETWORK="${NTA_DB_NETWORK:-$(docker inspect -f '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}' "$DB_CONTAINER" | grep -v '^bridge$' | head -n 1)}"
[ -n "$NETWORK" ] || { echo "không tìm thấy network của $DB_CONTAINER" >&2; exit 2; }

if [ -z "${MIGRATE_IMAGE:-}" ]; then
  MIGRATE_IMAGE="nta-web-migrate:restore-test"
  docker build --quiet --target migrator -t "$MIGRATE_IMAGE" "$REPO_ROOT" > /dev/null
fi

# Đọc user/mật khẩu từ env của container (không in ra). Truyền DATABASE_URL qua env, không qua dòng lệnh (ps).
DB_USER="$(docker exec "$DB_CONTAINER" printenv POSTGRES_USER)"
DB_PASSWORD="$(docker exec "$DB_CONTAINER" printenv POSTGRES_PASSWORD)"
DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_CONTAINER:5432/$TARGET_DB"
export DATABASE_URL

status=0
docker run --rm --network "$NETWORK" -e DATABASE_URL "$MIGRATE_IMAGE" migrate || status=$?
unset DATABASE_URL DB_PASSWORD

echo "== $TARGET_DB sau migrate:"
docker exec "$BACKUP_CONTAINER" psql -d "$TARGET_DB" -At -F ' ' -c "
  select 'drizzle.__drizzle_migrations', count(*) from drizzle.__drizzle_migrations
  union all select 'content_entries', count(*) from content_entries
  union all select 'content_versions', count(*) from content_versions" || true

if [ "$status" -ne 0 ]; then
  echo "== KẾT QUẢ: FAIL (exit $status) — KHÔNG deploy migration này lên prod" >&2
  exit "$status"
fi
echo "== KẾT QUẢ: PASS — migration chạy được trên bản sao dữ liệu prod"
