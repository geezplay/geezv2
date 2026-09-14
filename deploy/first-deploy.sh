#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

if [ ! -f ".env.production" ]; then
  echo "Tidak ada .env.production (web). Lihat DEPLOY.md §4.1." >&2
  exit 1
fi
if [ ! -f "server/.env" ]; then
  echo "Tidak ada server/.env (API). Lihat DEPLOY.md §4.2." >&2
  exit 1
fi

echo "==> Build API"
cd "$APP_DIR/server"
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

echo "==> Build Web"
cd "$APP_DIR"
npm ci
npm run build

echo "==> Jalankan PM2"
pm2 delete all >/dev/null 2>&1 || true
pm2 start ecosystem.config.js
pm2 save
pm2 status

echo
echo "Cek: curl -s http://127.0.0.1:4000/api/health && curl -sI http://127.0.0.1:3000"
