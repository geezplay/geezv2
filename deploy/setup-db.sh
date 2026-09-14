#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${DB_NAME:-geezplay}"
DB_USER="${DB_USER:-geezplay_user}"
DB_PASS="${DB_PASS:?Set DB_PASS, contoh: DB_PASS='rahasia' bash deploy/setup-db.sh}"

echo "Menyiapkan database: $DB_NAME (owner: $DB_USER)"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SQL

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
  echo "Database dibuat."
else
  echo "Database sudah ada."
fi

echo
echo "Selesai. Pastikan server/.env memuat:"
echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}?schema=public\""
