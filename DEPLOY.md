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

Cek dulu IP publik VPS di server: `curl -4 ifconfig.me`.

Aturan record (pakai IP VPS yang sama untuk semua):
- `A @` (apex)      → IP_VPS
- `A api`           → IP_VPS
- `CNAME www`       → `geezplay.site`  (boleh tetap CNAME, **tidak perlu** A `www`)

Penting:
- **Jangan** membuat dua record `A` dengan nama sama tetapi IP berbeda
  (mis. `@` → 31.97.109.242 **dan** `@` → 2.57.91.91). Edit yang lama, jangan duplikat.
- Jika panel sudah punya `A @`/`A api` bawaan dari hosting, **edit** nilainya ke IP VPS
  Anda — jangan menambah yang baru.
- Isi kolom **Nama** dengan host saja (`@`, `www`, `api`), bukan `www.geezplay.site`.
- Jika memakai **Cloudflare**, set **DNS only (awan abu-abu)** dulu agar verifikasi
  Let's Encrypt (HTTP-01) berhasil.
- Biarkan record `TXT` lain (mis. `google-site-verification`) apa adanya.

Verifikasi propagasi (harus mengembalikan IP VPS):
```bash
dig +short geezplay.site
dig +short www.geezplay.site
dig +short api.geezplay.site
```

Setelah DNS aktif (uji: `ping`/`dig` mengarah ke IP VPS), untuk **Nginx**:
```bash
sudo certbot --nginx -d geezplay.site -d www.geezplay.site -d api.geezplay.site
```
Certbot menyunting Nginx otomatis dan mengatur renew. Cek:
```bash
sudo certbot renew --dry-run
```

> Untuk **Traefik**, SSL diurus otomatis oleh certResolver `letsencrypt`
> (lihat §13); Anda tidak perlu menjalankan certbot.

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

## 13. (Opsional) Menggunakan Traefik bila ada

> **Lewati bagian ini** jika Anda tidak memakai Traefik (mis. Traefik sudah
> dihapus) dan menggunakan **Nginx** sesuai §7–§8. Bagian ini hanya untuk VPS
> yang menjalankan Traefik sebagai reverse proxy.

Jika VPS sudah menjalankan **Traefik** di port 80/443 (mis. container
`traefik-traefik-1`), Anda tidak perlu Nginx. App kita tetap jalan via PM2 di
host (`:3000` & `:4000`), dan Traefik meneruskan trafik ke sana.

Traefik di VPS ini memakai **Docker provider** (`--providers.docker=true`) dan
belum mengaktifkan **file provider**. Jadi langkahnya:

### 13.1 Aktifkan file provider di Traefik
Edit `/docker/traefik/docker-compose.yml`, pada service `traefik` tambahkan:

```yaml
    command:
      # ... flag yang sudah ada ...
      - "--providers.file.directory=/etc/traefik/dynamic"
      - "--providers.file.watch=true"

    volumes:
      - /letsencrypt:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /etc/traefik/dynamic:/etc/traefik/dynamic
```

Lalu:
```bash
sudo mkdir -p /etc/traefik/dynamic
docker compose -f /docker/traefik/docker-compose.yml up -d
```

> EntryPoint (`web`, `websecure`) dan certResolver (`letsencrypt`) sudah ada,
> jadi kita tinggal memakai file provider. Redirect HTTP→HTTPS juga sudah
> global di Traefik.

### 13.2 Pasang konfigurasi GeezPlay
```bash
cd /var/www/geezplay
bash deploy/traefik/install.sh
```
Script otomatis mendeteksi container Traefik, menghitung **IP gateway Docker**,
dan menulis `/etc/traefik/dynamic/geezplay.yml` dengan URL
`http://<gateway>:3000` dan `http://<gateway>:4000`.

### 13.3 Verifikasi
```bash
docker logs --tail 40 traefik-traefik-1
curl -I https://geezplay.site
curl https://api.geezplay.site/api/health
```

> Pada opsi ini, **JANGAN** aktifkan Nginx di 80/443 (bentrok). Nginx boleh
> dimatikan: `sudo systemctl disable --now nginx`.

### Opsi B — pakai Nginx (jika tidak memakai Traefik)
Hentikan Traefik dulu:
```bash
# service systemd
sudo systemctl disable --now traefik
# atau container Docker
docker stop traefik-traefik-1 && docker update --restart=no traefik-traefik-1
```
Lalu ikuti §7 (Nginx) dan §8 (SSL).

---

## 14. Troubleshooting
- **API `database: down` (health 503)**: jalankan `bash deploy/check-db.sh`. Pastikan PostgreSQL aktif,
  role `geezplay_user` + database `geezplay` ada, dan `DATABASE_URL` di `server/.env` benar.
  Setelah mengubah `.env`: `pm2 restart geezplay-api --update-env`.
- **502 Bad Gateway pada web**: `:3000` tidak mendengarkan. Cek `pm2 status` (harus ada `geezplay-web`).
  Jalankan `bash deploy/first-deploy.sh` untuk build + start.
- **Port 80/443 dipakai Traefik**: lihat §13 (pakai Traefik) atau hentikan Traefik bila memakai Nginx.
- **Nginx gagal start / `bind() to 0.0.0.0:80 failed (98: Address already in use)`**:
  artinya port 80 (atau 443) sudah dipakai proses lain, biasanya Apache2 atau instance Nginx lama. Cek dan hentikan:
  ```bash
  # lihat pemakai port 80/443
  sudo ss -ltnp | grep -E ':80|:443'
  sudo lsof -iTCP:80 -sTCP:LISTEN -n -P 2>/dev/null

  # bila Apache2 yang memakai (umum)
  sudo systemctl status apache2 --no-pager
  sudo systemctl disable --now apache2

  # bila ada master nginx nyangkut
  sudo pkill -f nginx

  # start ulang nginx
  sudo systemctl start nginx
  sudo systemctl status nginx --no-pager
  ```
  Catatan: `nginx -t` yang sukses hanya memeriksa **sintaks**, bukan ketersediaan port.
- **502 Bad Gateway**: cek `pm2 status` dan `pm2 logs`.
- **CORS error**: pastikan `CORS_ORIGIN` di `server/.env` sama persis dengan `https://geezplay.site`.
- **Gambar tidak muncul**: cek `NEXT_PUBLIC_API_URL` dan rebuild web.
- **Upload gagal**: pastikan `client_max_body_size 30M` di kedua config Nginx.
- **Migrasi gagal**: jalankan `npx prisma migrate deploy` di `server/`.
