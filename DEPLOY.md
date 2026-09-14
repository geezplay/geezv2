# Panduan Deploy GeezPlay (VPS + PM2 + Nginx + Certbot)

Arsitektur:

```
geezplay.site      -> Nginx -> Next.js  (127.0.0.1:3000)
api.geezplay.site  -> Nginx -> Express  (127.0.0.1:4000)
PostgreSQL lokal (127.0.0.1:5432)
Penyimpanan: server/uploads/ dan server/storage/
```

Repo ini berisi dua aplikasi:
- **Web** (Next.js) di root repo.
- **API** (Express + Prisma) di folder `server/`.

---

## 1. Prasyarat

- VPS Ubuntu 22.04 / 24.04, akses `sudo`.
- Domain `geezplay.site` dan subdomain `api.geezplay.site`.
- Repo sudah ada di GitHub (Anda push sendiri).

---

## 2. Setup VPS

### 2.1 Paket dasar
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx postgresql fail2ban ufw

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 2.2 Swap (opsional, untuk RAM kecil)
```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2.3 PostgreSQL
```bash
sudo -u postgres psql
```
Di dalam psql:
```sql
CREATE ROLE geezplay_user LOGIN PASSWORD 'GANTI_PASSWORD_KUAT';
CREATE DATABASE geezplay OWNER geezplay_user;
\q
```

---

## 3. Ambil kode dari GitHub
```bash
sudo mkdir -p /var/www
sudo chown -R "$USER":"$USER" /var/www
cd /var/www
git clone https://github.com/USERNAME/REPO.git geezplay
cd geezplay
```
> Gunakan path tanpa spasi (mis. `/var/www/geezplay`).

---

## 4. Konfigurasi environment

### 4.1 Web (root repo)
```bash
cp .env.production.example .env.production
nano .env.production
```
Isi:
```
NEXT_PUBLIC_API_URL=https://api.geezplay.site
NEXT_PUBLIC_SITE_URL=https://geezplay.site
API_INTERNAL_URL=http://127.0.0.1:4000
```

### 4.2 API (`server/`)
```bash
cd server
cp .env.example .env
nano .env
```
Isi:
```
DATABASE_URL="postgresql://geezplay_user:PASSWORD_KUAT@127.0.0.1:5432/geezplay?schema=public"
PORT=4000
JWT_SECRET="SECRET_ACAK_PANJANG_64_KARAKTER"
CORS_ORIGIN="https://geezplay.site,https://www.geezplay.site"
PUBLIC_API_URL="https://api.geezplay.site"
```

> `JWT_SECRET` bisa dibuat dengan: `openssl rand -hex 32`

---

## 5. Build pertama (manual)

### 5.1 API
```bash
cd /var/www/geezplay/server
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

# Buat admin owner (tanpa data demo)
OWNER_EMAIL="owner@geezplay.site" OWNER_PASSWORD="PASSWORD_KUAT" npm run seed:owner
```

### 5.2 Web
```bash
cd /var/www/geezplay
npm ci
npm run build
```

---

## 6. Jalankan dengan PM2
```bash
cd /var/www/geezplay
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME"
# jalankan perintah yang dicetak oleh pm2 startup
```
Cek status & log:
```bash
pm2 status
pm2 logs geezplay-api
pm2 logs geezplay-web
```

---

## 7. Nginx
```bash
sudo cp /var/www/geezplay/deploy/nginx/geezplay.site.conf /etc/nginx/sites-available/geezplay.site
sudo cp /var/www/geezplay/deploy/nginx/api.geezplay.site.conf /etc/nginx/sites-available/api.geezplay.site
sudo ln -sf /etc/nginx/sites-available/geezplay.site /etc/nginx/sites-enabled/geezplay.site
sudo ln -sf /etc/nginx/sites-available/api.geezplay.site /etc/nginx/sites-enabled/api.geezplay.site
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. DNS & SSL

Buat A record di DNS mengarah ke IP VPS:
- `geezplay.site`
- `www.geezplay.site`
- `api.geezplay.site`

Setelah DNS aktif:
```bash
sudo certbot --nginx -d geezplay.site -d www.geezplay.site -d api.geezplay.site
```
Certbot menyunting Nginx otomatis dan mengatur renew. Cek:
```bash
sudo certbot renew --dry-run
```

---

## 9. Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
sudo systemctl enable fail2ban
```

---

## 10. Update aplikasi (via GitHub)

Di komputer lokal:
```bash
git add .
git commit -m "perubahan ..."
git push
```

Di VPS:
```bash
cd /var/www/geezplay
chmod +x deploy/deploy.sh   # sekali saja
./deploy/deploy.sh
```
`deploy.sh` akan: `git pull` → build API & migrate → build web → `pm2 reload`.

> Penting: `NEXT_PUBLIC_*` tertanam saat **build**. Karena build dilakukan di VPS, nilai produksi di `.env.production` akan terpakai.

---

## 11. Backup

Buat folder backup:
```bash
sudo mkdir -p /var/backups/geezplay
```

Contoh script harian `/var/www/geezplay/deploy/backup.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%F_%H%M)
DEST=/var/backups/geezplay
mkdir -p "$DEST"
pg_dump "postgresql://geezplay_user:PASSWORD@127.0.0.1:5432/geezplay" | gzip > "$DEST/db_$STAMP.sql.gz"
tar -czf "$DEST/files_$STAMP.tar.gz" -C /var/www/geezplay/server uploads storage
find "$DEST" -type f -mtime +14 -delete
```

Jadwalkan via cron (`crontab -e`):
```
0 2 * * * /var/www/geezplay/deploy/backup.sh >> /var/log/geezplay-backup.log 2>&1
```

> `server/storage/originals` bersifat **privat** dan tidak boleh diekspos lewat Nginx.

---

## 12. Verifikasi
- API: `curl https://api.geezplay.site/api/health` → `{"status":"ok","database":"up"}`
- Web: buka `https://geezplay.site`
- Admin: `https://geezplay.site/admin` (login pakai `OWNER_EMAIL`).
- Upload foto/brosur, pastikan aset tampil dari `https://api.geezplay.site/...`.

---

## 13. Troubleshooting
- **502 Bad Gateway**: cek `pm2 status` dan `pm2 logs`.
- **CORS error**: pastikan `CORS_ORIGIN` di `server/.env` sama persis dengan `https://geezplay.site`.
- **Gambar tidak muncul**: cek `NEXT_PUBLIC_API_URL` dan rebuild web.
- **Upload gagal**: pastikan `client_max_body_size 30M` di kedua config Nginx.
- **Migrasi gagal**: jalankan `npx prisma migrate deploy` di `server/`.
