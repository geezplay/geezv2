#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${1:-traefik-traefik-1}"
DYNAMIC_DIR="${2:-/etc/traefik/dynamic}"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/geezplay.yml"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker tidak ditemukan." >&2
  exit 1
fi

ARGS="$(docker inspect "$CONTAINER" --format '{{json .Config.Cmd}}' 2>/dev/null || true)"
if ! echo "$ARGS" | grep -q "providers.file"; then
  cat >&2 <<'EOF'
Traefik belum mengaktifkan file provider.

Edit /docker/traefik/docker-compose.yml lalu tambahkan pada service traefik:

  command:
    # ... flag yang sudah ada ...
    - "--providers.file.directory=/etc/traefik/dynamic"
    - "--providers.file.watch=true"

  volumes:
    - /letsencrypt:/letsencrypt
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - /etc/traefik/dynamic:/etc/traefik/dynamic

Lalu jalankan ulang:
  sudo mkdir -p /etc/traefik/dynamic
  docker compose -f /docker/traefik/docker-compose.yml up -d

Setelah itu jalankan kembali: bash deploy/traefik/install.sh
EOF
  exit 1
fi

NETWORK="$(docker inspect "$CONTAINER" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' | awk '{print $1}')"
GATEWAY="$(docker network inspect "$NETWORK" --format '{{range .IPAM.Config}}{{.Gateway}}{{end}}')"

echo "Container : $CONTAINER"
echo "Network   : $NETWORK"
echo "Gateway   : $GATEWAY"

if [ -z "$GATEWAY" ]; then
  echo "Gagal mendeteksi gateway Docker. Isi IP host secara manual di geezplay.yml" >&2
  exit 1
fi

sudo mkdir -p "$DYNAMIC_DIR"
sed "s|http://127.0.0.1:3000|http://${GATEWAY}:3000|; s|http://127.0.0.1:4000|http://${GATEWAY}:4000|" \
  "$SRC" | sudo tee "$DYNAMIC_DIR/geezplay.yml" >/dev/null

echo "Terpasang : $DYNAMIC_DIR/geezplay.yml"
grep -n "url:" "$DYNAMIC_DIR/geezplay.yml" || true
echo
echo "Cek log Traefik: docker logs --tail 40 $CONTAINER"
echo "Pastikan app PM2 jalan: pm2 status"
