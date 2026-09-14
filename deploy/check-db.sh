#!/usr/bin/env bash
set -uo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$APP_DIR/server/.env"

echo "== PostgreSQL service =="
if systemctl list-unit-files | grep -q '^postgresql'; then
  systemctl is-active postgresql || true
  systemctl status postgresql --no-pager -n 8 || true
else
  echo "PostgreSQL tidak terpasang (unit 'postgresql' tidak ada)."
fi

echo
echo "== server/.env =="
if [ -f "$ENV_FILE" ]; then
  grep -E '^DATABASE_URL=' "$ENV_FILE" | sed -E 's#://([^:]+):[^@]*@#://\1:****@#'
else
  echo "server/.env tidak ditemukan"
fi

echo
echo "== Role & database =="
sudo -u postgres psql -tAc "SELECT rolname FROM pg_roles WHERE rolname='geezplay_user';" 2>/dev/null || echo "(tidak bisa query)"
sudo -u postgres psql -tAc "SELECT datname FROM pg_database WHERE datname='geezplay';" 2>/dev/null || echo "(tidak bisa query)"

echo
echo "== Port 5432 =="
ss -ltnp 2>/dev/null | grep ':5432' || echo "Tidak ada yang mendengarkan di 5432"

echo
echo "== Tes koneksi dari DATABASE_URL =="
URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\"')"
if [ -n "${URL:-}" ]; then
  if psql "$URL" -c "SELECT 1" >/dev/null 2>&1; then
    echo "OK: koneksi berhasil."
  else
    echo "GAGAL: koneksi ditolak. Detail:"
    psql "$URL" -c "SELECT 1" 2>&1 | head -5
  fi
else
  echo "DATABASE_URL kosong/tidak ditemukan."
fi
