#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "==> Menarik kode terbaru dari Git"
git pull --ff-only

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

echo "==> Reload PM2"
pm2 reload "$APP_DIR/ecosystem.config.js" --update-env
pm2 save

echo "==> Deploy selesai"
