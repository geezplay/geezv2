# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Website Jualan Foto Balap

**Versi:** 2.0  
**Tanggal:** 13 September 2026  
**Status:** Final PRD  
**Prioritas desain:** Simple, fast, accessible, mobile-first

---

## 1. Ringkasan Produk

Website Jualan Foto Balap adalah platform penjualan foto balap yang memungkinkan pembeli menemukan foto berdasarkan event dan kelas balap, melihat preview yang telah dilindungi watermark, memilih foto yang diinginkan, membayar secara online, lalu menerima akses aman untuk mengunduh foto resolusi asli yang memang telah dibeli.

Di sisi admin, website digunakan untuk mengelola event, kelas balap, upload foto dalam jumlah besar, katalog, transaksi, dan laporan penjualan.

**Prinsip utama produk:**

1. **Simple** — tampilan bersih, fokus pada foto dan proses pembelian.
2. **Fast** — halaman ringan, gambar dioptimalkan, dan tidak memuat aset yang tidak diperlukan.
3. **Accessible** — dapat digunakan oleh sebanyak mungkin pengguna, termasuk pengguna mobile dan pengguna dengan keterbatasan tertentu.
4. **Mobile-first** — pengalaman pembeli diprioritaskan untuk smartphone.
5. **Self-service** — pembeli dapat mencari, memilih, membayar, dan mendapatkan foto tanpa bantuan admin.

---

## 2. Latar Belakang

Fotografer memotret peserta balapan secara acak di berbagai event dan kelas balap. Saat ini proses pengumpulan, katalogisasi, penjualan, dan pelaporan foto dilakukan secara manual.

Dibutuhkan sebuah website yang memungkinkan:

- Fotografer/admin mengunggah dan mengelola foto berdasarkan event dan kelas balap.
- Pembeli menelusuri katalog dengan cepat dan mudah.
- Pembeli memilih satu atau beberapa foto/varian dalam satu transaksi.
- Pembeli melakukan pembayaran secara online melalui metode yang tersedia.
- Sistem memberikan akses download foto resolusi penuh setelah pembayaran terverifikasi.
- Admin memantau transaksi dan membuat laporan penjualan.

---

## 3. Tujuan Produk

### 3.1 Tujuan Bisnis

1. Menyediakan kanal penjualan foto balap secara online dan mandiri.
2. Mengurangi pekerjaan manual dalam proses penjualan foto.
3. Meningkatkan jumlah foto yang dapat dibeli dalam satu transaksi.
4. Mempermudah pengelolaan ribuan foto per event/kelas balap.
5. Menyediakan laporan penjualan yang akurat.

### 3.2 Tujuan Pengalaman Pengguna

1. Pembeli dapat menemukan event dan kelas balap dengan cepat.
2. Pembeli dapat melihat banyak foto tanpa menunggu loading yang lama.
3. Pembeli dapat memilih beberapa foto sekaligus.
4. Checkout dapat diselesaikan dengan langkah seminimal mungkin.
5. Pembeli dapat menerima link download dengan jelas setelah pembayaran berhasil.

---

## 4. Target Pengguna

| Peran | Deskripsi | Kebutuhan Utama |
| --- | --- | --- |
| **Pembeli (Buyer)** | Peserta balap/umum yang ingin membeli foto dirinya. Tidak wajib memiliki akun. | Mencari foto, memilih foto, membayar, dan mengunduh foto. |
| **Admin (Owner)** | Pengelola utama/fotografer. | Mengelola seluruh operasional website dan laporan. |
| **Editor** | Admin yang membantu pengelolaan katalog/foto. | Mengelola event, kelas, upload, dan katalog sesuai hak akses. |
| **Staff** | Admin dengan akses terbatas. | Melihat atau membantu operasional sesuai permission. |

---

## 5. Prinsip UI/UX

### 5.1 Gaya Visual

Website menggunakan gaya **simple, clean, modern, dan photo-first**.

Karakter visual:

- Layout lapang tetapi tidak boros ruang.
- Komponen UI sederhana.
- Border radius ringan.
- Bayangan/efek dekoratif digunakan seminimal mungkin.
- Tidak menggunakan animasi berat.
- Foto menjadi elemen visual utama.
- Typography sederhana dan mudah dibaca.
- CTA utama menggunakan warna hijau.

### 5.2 Warna

Gunakan **hijau sebagai primary color**.

| Token | Nilai yang Disarankan | Penggunaan |
| --- | --- | --- |
| `primary` | `#16A34A` | Tombol utama, link penting, status aktif |
| `primary-hover` | `#15803D` | Hover/focus tombol utama |
| `primary-soft` | `#DCFCE7` | Background badge/status ringan |
| `background` | `#FFFFFF` | Background utama |
| `surface` | `#F8FAFC` | Card/section ringan |
| `text` | `#111827` | Teks utama |
| `text-muted` | `#6B7280` | Teks sekunder |
| `border` | `#E5E7EB` | Border dan divider |
| `success` | `#16A34A` | Pembayaran berhasil/status sukses |
| `warning` | `#D97706` | Pending/peringatan |
| `danger` | `#DC2626` | Error/status gagal |

Warna bukan satu-satunya penanda status. Status juga harus menggunakan teks/icon agar tetap mudah dipahami oleh pengguna dengan gangguan penglihatan warna.

### 5.3 Typography

Gunakan font system agar website cepat dan tidak perlu memuat web font eksternal.

Contoh font stack:

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### 5.4 Responsive Design

Website harus berfungsi baik pada:

- Mobile: 320px ke atas.
- Tablet.
- Desktop.

Prioritas pengalaman:

**Mobile → Tablet → Desktop**

Grid foto menyesuaikan ukuran layar tanpa membuat thumbnail terlalu kecil untuk dipilih.

---

## 6. Struktur Halaman

### 6.1 Public Website

1. Home
2. Daftar Event
3. Detail Event
4. Detail Kelas Balap
5. Galeri/Foto
6. Detail/Preview Foto
7. Wishlist/Favorite
8. Cart
9. Checkout
10. Status Pembayaran
11. Download Foto
12. Halaman Error/Not Found

### 6.2 Admin Website

1. Login
2. Dashboard
3. Event
4. Kelas Balap
5. Upload Foto
6. Katalog Foto
7. Order
8. Voucher
9. Laporan
10. Admin & Role
11. Pengaturan

---

## 7. Ruang Lingkup

### 7.1 In-Scope

#### A. Katalog

- Halaman katalog publik.
- Daftar event.
- Filter event dan kelas balap.
- Status event: ready/belum ready.
- Grid preview foto.
- Watermark pada preview.
- Preview resolusi rendah.
- Detail/preview foto lebih besar.
- Multi-select foto/varian.
- Pencarian foto berdasarkan nomor motor/start/bib.
- OCR nomor motor/start saat upload.

#### B. Shopping

- Favorite/Wishlist.
- Cart.
- Multi-select foto.
- Ringkasan jumlah foto dan total harga.
- Voucher/kode promo.
- Checkout guest.
- Input email.
- Input nomor WhatsApp.
- Pemilihan metode pembayaran.

#### C. Pembayaran

- Integrasi payment gateway.
- QRIS.
- Transfer bank.
- E-wallet.
- Redirect atau flow pembayaran sesuai payment gateway.
- Webhook untuk validasi status pembayaran.
- Status order: pending, paid, failed, expired/cancelled.

#### D. Pengiriman Foto

- Foto resolusi penuh hanya dapat diakses setelah pembayaran terverifikasi.
- Link download melalui halaman download.
- Notifikasi email setelah pembayaran berhasil.
- Notifikasi WhatsApp melalui WhatsApp API sebagai fitur tambahan.
- Link download menggunakan URL yang aman dan memiliki masa berlaku/validasi akses.

#### E. Admin

- Login email & password.
- Multi-admin.
- Role Owner, Editor, Staff.
- CRUD event.
- CRUD kelas balap.
- Status event ready/belum ready.
- Bulk upload foto.
- Validasi dan preview sebelum publish.
- Generate watermark/thumbnail/preview otomatis.
- Manajemen katalog.
- Manajemen order.
- Manajemen voucher.
- Dashboard analitik.
- Laporan berdasarkan event, kelas, tanggal, dan status pembayaran.
- Export laporan ke PDF.

---

## 8. Out-of-Scope Fase 1

- Aplikasi mobile native.
- Edit/retouch foto di dalam sistem.
- Member/loyalty program dengan akun buyer permanen.
- Multi-tenant untuk banyak bisnis/fotografer.
- Face recognition.
- Marketplace multi-fotografer.
- Fitur sosial seperti komentar/follow.
- Video selling.

Face recognition dapat dipertimbangkan sebagai fitur fase 2. Pencarian berbasis OCR nomor motor/start tetap menjadi fitur fase 1.

---

## 9. User Flow

### 9.1 Pembeli

1. Buka website.
2. Pilih Event.
3. Pilih Kelas Balap.
4. Melihat grid preview foto.
5. Menggunakan pencarian nomor start/bib jika diperlukan.
6. Memilih satu atau beberapa foto.
7. Menambahkan pilihan ke cart.
8. Mengecek cart.
9. Memasukkan email dan nomor WhatsApp.
10. Memasukkan voucher jika ada.
11. Memilih metode pembayaran.
12. Melakukan pembayaran.
13. Sistem menerima konfirmasi pembayaran melalui payment gateway/webhook.
14. Order berubah menjadi **Paid**.
15. Sistem menyediakan link download foto resolusi penuh.
16. Pembeli menerima notifikasi.

### 9.2 Admin

1. Login.
2. Membuat event.
3. Membuat kelas balap.
4. Upload foto secara bulk.
5. Sistem memproses thumbnail, preview, watermark, dan OCR.
6. Admin melihat hasil proses.
7. Admin memperbaiki data jika diperlukan.
8. Admin publish katalog.
9. Admin menandai event sebagai ready.
10. Admin memantau order dan pembayaran.
11. Admin melihat laporan.
12. Admin export laporan ke PDF.

---

## 10. Fitur Utama & Prioritas

| # | Fitur | Prioritas |
| --- | --- | --- |
| 1 | Katalog publik event & kelas balap | Must Have |
| 2 | Grid preview foto dengan watermark | Must Have |
| 3 | Multi-select foto/varian | Must Have |
| 4 | Cart | Must Have |
| 5 | Guest checkout | Must Have |
| 6 | Payment gateway | Must Have |
| 7 | Admin login | Must Have |
| 8 | Bulk upload foto | Must Have |
| 9 | Manajemen event & kelas | Must Have |
| 10 | Status event ready/belum ready | Must Have |
| 11 | Laporan penjualan | Must Have |
| 12 | Export PDF | Must Have |
| 13 | Download foto setelah pembayaran | Must Have |
| 14 | Pencarian nomor start/bib | Should Have |
| 15 | OCR nomor start/bib | Should Have |
| 16 | Favorite/Wishlist | Should Have |
| 17 | Voucher/kode promo | Should Have |
| 18 | Email otomatis | Should Have |
| 19 | WhatsApp API | Could Have |
| 20 | Dashboard analitik lanjutan | Could Have |
| 21 | Face recognition | Won't Have / Phase 2 |

---

## 11. Detail Persyaratan Fungsional

### 11.1 Katalog Foto & Screenshot Gabungan

Konsep katalog menggunakan **satu gambar preview gabungan (Catalog Preview Sheet)** untuk setiap kelompok/variasi foto yang diunggah admin.

Contoh:

> Admin mengunggah 10 foto ke satu katalog/variasi. Sistem otomatis menyusun 10 foto tersebut menjadi **1 screenshot/gambar gabungan** yang digunakan sebagai thumbnail katalog.

Tujuannya agar pembeli dapat melihat sekilas isi paket/variasi foto sebelum membuka detailnya.

**Requirement:**

- Pengguna dapat memilih event.
- Pengguna dapat memilih kelas balap.
- Setiap katalog/variasi memiliki **1 thumbnail berupa gambar gabungan** dari foto-foto yang termasuk di dalamnya.
- Admin dapat mengunggah sejumlah foto untuk sebuah katalog/variasi.
- Sistem otomatis membuat gambar gabungan dari foto-foto tersebut setelah upload.
- Foto asli yang diunggah admin **tetap disimpan sebagai item foto individual** di dalam katalog/variasi.
- Gambar gabungan hanya berfungsi sebagai **preview/thumbnail katalog**, bukan pengganti foto asli.
- Foto individual tetap menjadi sumber file yang akan dibeli/diunduh sesuai varian yang dipilih.
- Jika jumlah foto adalah 10, sistem membuat satu preview sheet dari 10 foto tersebut.
- Jika jumlah foto berbeda, sistem tetap membuat preview sheet berdasarkan jumlah foto yang tersedia.
- Gambar gabungan menggunakan ukuran dan format yang dioptimalkan untuk web.
- Gambar gabungan dapat diberi watermark.
- Foto original tidak dikirim ke browser pada halaman katalog.
- Ketika pembeli membuka detail katalog, sistem dapat menampilkan foto individual yang termasuk dalam katalog/variasi.
- Pembeli dapat memilih katalog/variasi tanpa harus membuka setiap foto individual satu per satu.

**Pemisahan data yang wajib dipertahankan:**

```text
Katalog / Variasi
├── Catalog Preview Sheet (1 gambar gabungan)
│
├── Foto 01 (original)
├── Foto 02 (original)
├── Foto 03 (original)
├── ...
└── Foto 10 (original)
```

**Aturan penting:**

`Catalog Preview Sheet` adalah **representasi visual dari sekumpulan foto** untuk mempercepat browsing pembeli. Ia tidak menggantikan atau menghapus foto original.

### 11.1.1 Proses Pembuatan Preview Gabungan

1. Admin memilih event dan kelas balap.
2. Admin membuat atau memilih katalog/variasi.
3. Admin mengunggah foto, misalnya 10 file.
4. Sistem menyimpan setiap foto sebagai file individual.
5. Sistem membuat thumbnail/preview individual bila diperlukan.
6. Sistem membuat **Catalog Preview Sheet** dari kumpulan foto tersebut.
7. Preview sheet disimpan sebagai asset turunan, bukan sebagai original.
8. Preview sheet ditampilkan pada card katalog.
9. Pembeli dapat membuka katalog untuk melihat foto individual yang termasuk di dalamnya.
10. Setelah pembayaran berhasil, sistem memberikan akses ke foto original sesuai item/variasi yang dibeli.

### 11.1.2 Layout Preview Sheet

Default:

- 10 foto → grid 2 × 5 atau layout otomatis yang paling optimal.
- Semua foto memiliki ukuran visual yang relatif konsisten.
- Gunakan crop yang konsisten agar susunan terlihat rapi.
- Hindari gambar terlalu kecil sehingga isi foto tidak dapat dikenali.
- Watermark dapat diterapkan pada hasil gabungan.
- Metadata seperti nama event, kelas, harga, atau jumlah foto ditampilkan **di luar gambar**, sebagai bagian dari card katalog.

### 11.1.3 Performance Preview Sheet

Karena preview sheet digunakan pada halaman katalog, file ini harus ringan:

- Generate preview sheet secara asynchronous/background job setelah upload.
- Simpan beberapa ukuran bila diperlukan untuk responsive layout.
- Gunakan WebP/AVIF bila didukung.
- Gunakan CDN/cache untuk preview publik.
- Gunakan lazy loading untuk card katalog di bawah viewport.
- Jangan membuat browser pembeli menggabungkan 10 foto secara realtime.
- Jangan mengirim 10 original foto hanya untuk menampilkan thumbnail katalog.

### 11.2 Search

Search harus mendukung:

- Nomor motor.
- Nomor start.
- Nomor bib.

Jika OCR gagal atau hasilnya tidak yakin, admin dapat melakukan koreksi metadata.

### 11.3 Cart

Cart menampilkan:

- Thumbnail.
- Nama/ID foto.
- Varian.
- Harga.
- Jumlah item.
- Voucher.
- Subtotal.
- Total.

Cart harus tetap tersimpan sementara ketika pengguna berpindah halaman.

### 11.4 Checkout

Checkout dibuat singkat.

Field minimum:

- Email.
- Nomor WhatsApp.
- Metode pembayaran.
- Voucher jika tersedia.

Hindari field yang tidak diperlukan.

### 11.5 Pembayaran

Status pembayaran harus berasal dari payment gateway/webhook, bukan hanya dari halaman redirect browser.

Status minimum:

- `Pending`
- `Paid`
- `Failed`
- `Expired`
- `Cancelled`

### 11.6 Photo Delivery & Secure Download

**Ini adalah requirement keamanan kritis. Foto original tidak boleh dapat diakses atau diunduh oleh pembeli sebelum pembayaran berhasil dan terverifikasi.**

#### Aturan akses original

1. Foto original selalu disimpan di **private object storage**.
2. Foto original **tidak boleh memiliki public URL permanen**.
3. Halaman Home, Event, Kelas, Katalog, Detail Foto, Cart, dan Checkout **tidak boleh mengirim file original ke browser pembeli**.
4. Preview yang tampil sebelum pembayaran harus berupa **preview/thumbnail yang telah dioptimalkan dan diberi watermark**, bukan original.
5. Mengetahui URL asset, melakukan Inspect Element, membuka Network tab, atau menyalin URL preview **tidak boleh memberikan akses ke file original**.
6. Endpoint download original wajib melakukan validasi server-side terhadap:
   - order yang valid;
   - status pembayaran = `Paid`;
   - foto/variasi memang termasuk dalam order tersebut;
   - token/session/download entitlement masih valid.
7. Setelah validasi berhasil, sistem memberikan akses download melalui **signed URL atau mekanisme secure download** dengan masa berlaku terbatas.
8. Halaman **Success Payment** menjadi titik pertama di mana pembeli mendapatkan akses terhadap foto original yang dibeli.
9. Foto original yang tidak dibeli dalam order tersebut **tetap tidak dapat diakses**, meskipun berada pada katalog yang sama.
10. Redirect kembali dari payment gateway **bukan bukti pembayaran**. Akses original hanya aktif setelah backend menerima dan memvalidasi status pembayaran dari webhook/API payment gateway.
11. Sistem harus mencegah perubahan status order dari browser/client-side.
12. Akses download dapat dicatat untuk audit dan troubleshooting.
13. Jika signed URL kedaluwarsa, pembeli dapat meminta link download baru selama entitlement order masih valid.
14. Endpoint download harus memiliki rate limiting dan proteksi terhadap abuse.
15. Jika pembayaran gagal, pending, expired, atau cancelled, entitlement download original **tidak dibuat atau dicabut**.

#### Alur akses file

```text
Buyer
  ↓
Katalog / Detail
  ↓
Preview watermark saja
  ↓
Checkout
  ↓
Payment
  ↓
Webhook/API payment gateway
  ↓
Server memverifikasi pembayaran
  ↓
Order = PAID
  ↓
Create Download Entitlement
  ↓
Success Payment
  ↓
Secure Download URL
  ↓
Foto Original yang DIBELI saja
```

**Prinsip:** `Preview sebelum bayar → Original hanya setelah Paid`.

### 11.7 Upload Admin

Bulk upload harus menyediakan:

- Drag & drop.
- Progress upload.
- Progress processing.
- Validasi file.
- Preview hasil.
- Informasi file gagal.
- Retry untuk file yang gagal.
- Publish setelah proses selesai.

---

## 12. Accessibility

Website harus memenuhi prinsip dasar **WCAG 2.2 AA** sejauh memungkinkan.

### Persyaratan minimum

- Semua fungsi utama dapat digunakan dengan keyboard.
- Focus state harus terlihat jelas.
- Kontras teks dan background memadai.
- Tombol memiliki label yang jelas.
- Form memiliki label, bukan hanya placeholder.
- Error form menjelaskan masalah dan cara memperbaikinya.
- Gambar informatif memiliki alt text yang sesuai.
- Gambar dekoratif tidak mengganggu screen reader.
- Jangan menggunakan warna sebagai satu-satunya indikator status.
- Target klik/tap cukup besar untuk perangkat mobile.
- Struktur heading menggunakan urutan yang logis.
- Dialog/modal dapat ditutup menggunakan keyboard.
- Tidak ada animasi yang wajib dilihat pengguna untuk memahami informasi.
- Hormati `prefers-reduced-motion`.

---

## 13. Performance & Kecepatan

Kecepatan merupakan requirement utama, terutama karena katalog berisi banyak foto.

### 13.1 Image Optimization

Sistem harus membedakan **foto original**, **preview individual**, dan **Catalog Preview Sheet**.

- Foto asli tidak digunakan sebagai thumbnail katalog.
- Setiap foto original tetap disimpan sebagai file individual.
- Generate preview individual bila diperlukan untuk halaman detail.
- Generate **1 Catalog Preview Sheet** untuk setiap katalog/variasi yang berisi kumpulan foto.
- Catalog Preview Sheet merupakan asset turunan dan tidak menggantikan foto original.
- Generate beberapa ukuran preview sheet untuk kebutuhan responsive layout bila diperlukan.
- Gunakan format modern seperti WebP/AVIF jika kompatibel.
- Gunakan responsive images (`srcset`/`sizes`).
- Lazy-load gambar katalog di luar viewport.
- Prioritaskan preview sheet yang terlihat pada initial viewport.
- Kompres preview sheet dengan kualitas yang sesuai.
- Watermark diterapkan pada preview sheet dan/atau preview individual, bukan pada original.
- Browser pembeli tidak boleh mengunduh seluruh foto original hanya untuk merender halaman katalog.

### 13.2 Page Loading

Target awal:

- Halaman utama dan halaman non-galeri harus ringan.
- Jangan memuat JavaScript/library yang tidak digunakan.
- Hindari font eksternal jika tidak diperlukan.
- Gunakan code splitting untuk fitur admin dan fitur yang jarang digunakan.
- Cache aset statis.
- Gunakan CDN untuk aset/gambar publik.
- Gunakan pagination atau infinite loading yang terkontrol untuk katalog besar.

### 13.3 Performance Budget

Target awal yang harus dipantau:

| Metric | Target Awal |
| --- | --- |
| LCP | ≤ 2.5 detik |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |
| JavaScript halaman publik | ≤ 200 KB gzip bila memungkinkan |
| Thumbnail grid | Dioptimalkan sesuai viewport |
| API katalog | p95 ≤ 500 ms pada kondisi normal |

Target tersebut menjadi baseline dan perlu divalidasi menggunakan data produksi nyata.

### 13.4 Caching

Gunakan caching untuk:

- Daftar event.
- Metadata kelas.
- Thumbnail/preview.
- Asset statis.
- Data katalog yang jarang berubah.

Cache harus di-invalidate ketika admin mengubah atau mem-publish katalog.

---

## 14. SEO & Shareability

Halaman publik harus mudah ditemukan dan dibagikan.

Minimum:

- Semantic HTML.
- Title dan meta description.
- URL yang sederhana dan mudah dibaca.
- Open Graph metadata untuk share.
- Sitemap.
- Robots configuration.
- Canonical URL.
- Hindari indexing untuk halaman admin, checkout, dan data privat.

---

## 15. Security & Privacy

### 15.1 Security Baseline

- Password admin disimpan menggunakan hashing yang aman.
- Gunakan HTTPS.
- Terapkan secure session management.
- Terapkan role-based access control.
- Validasi file upload.
- Batasi tipe, ukuran, dan jumlah file sesuai konfigurasi.
- Lindungi seluruh endpoint admin.
- Gunakan webhook payment gateway yang tervalidasi.
- Terapkan idempotency untuk pemrosesan webhook.
- Jangan menyimpan data pembayaran sensitif yang tidak diperlukan.
- Terapkan rate limiting pada endpoint yang rawan disalahgunakan.
- Logging untuk aktivitas penting admin, transaksi, dan download.
- Konfigurasi rahasia disimpan sebagai environment variables/secret manager.
- Terapkan backup database dan prosedur recovery sesuai kebutuhan operasional.

### 15.2 Perlindungan Foto Original — Mandatory

Foto original merupakan aset digital berbayar dan **wajib diperlakukan sebagai private asset**.

**Sebelum pembayaran berhasil:**
- Original tidak boleh public.
- Original tidak boleh dikirim sebagai response API.
- Original tidak boleh digunakan sebagai `src` gambar di halaman publik.
- Original tidak boleh berada di folder/bucket yang dapat diakses anonymous.
- Pembeli hanya menerima preview/thumbnail yang sudah diberi watermark.

**Setelah pembayaran berhasil:**
- Backend membuat entitlement download berdasarkan item yang dibeli.
- Endpoint download melakukan authorization server-side.
- Sistem mengeluarkan signed URL/secure download token dengan expiry.
- Hanya foto yang tercantum pada order `Paid` yang dapat diunduh.
- Akses dapat dicatat dan dibatasi dengan rate limiting.
- Link download yang kedaluwarsa dapat diterbitkan ulang setelah entitlement diverifikasi.

**Security invariant:**

> `Order != Paid` → `Original Download = DENIED`

> `Order = Paid` + `Photo ∈ Order Items` → `Original Download = ALLOWED`

> `Order = Paid` + `Photo ∉ Order Items` → `Original Download = DENIED`

### 15.3 Privacy

Data pembeli yang dikumpulkan pada fase 1 dibatasi pada kebutuhan transaksi, terutama email dan nomor WhatsApp. Hindari pengumpulan data pribadi yang tidak diperlukan.

---

## 16. Admin Role & Permission

| Fitur | Owner | Editor | Staff |
| --- | --- | --- | --- |
| Dashboard | ✓ | ✓ | ✓ |
| Event | CRUD | CRUD | Read |
| Kelas Balap | CRUD | CRUD | Read |
| Upload Foto | ✓ | ✓ | ✓ |
| Publish Katalog | ✓ | ✓ | - |
| Order | CRUD | Read/Update | Read |
| Voucher | CRUD | Read | - |
| Laporan | ✓ | ✓ | Read |
| Export PDF | ✓ | ✓ | - |
| Admin/Role | ✓ | - | - |
| Pengaturan | ✓ | - | - |

---

## 17. Data Utama

Entitas utama yang dibutuhkan:

### Event

- ID
- Nama event
- Tanggal
- Status
- Cover image
- Deskripsi opsional
- Created at
- Updated at

### Kelas Balap

- ID
- Event ID
- Nama kelas
- Status
- Urutan tampil

### Katalog / Variasi

- ID
- Event ID
- Kelas ID
- Nama/judul katalog atau variasi
- Harga
- Catalog Preview Sheet
- Jumlah foto
- Status publish
- Created at
- Updated at

### Foto

- ID
- Katalog/Variasi ID
- Event ID
- Kelas ID
- File original
- Preview individual
- Thumbnail individual (opsional)
- Nomor motor/start/bib
- Metadata OCR
- Urutan foto
- Status publish
- Created at

### Order

- ID
- Buyer email
- Buyer WhatsApp
- Item
- Voucher
- Subtotal
- Discount
- Total
- Payment method
- Payment status
- Created at
- Paid at

### Download Entitlement

- ID
- Order ID
- Photo ID
- Access status
- Created at
- Expires at (bila digunakan)
- Download count (bila digunakan)
- Last downloaded at (bila digunakan)

Entitlement hanya dibuat untuk item yang telah menjadi bagian dari order `Paid`.

### Voucher

- Code
- Discount type
- Discount value
- Minimum transaction
- Maximum usage
- Start date
- End date
- Status

---

## 18. Non-Functional Requirements

### Reliability

- Transaksi tidak boleh hilang ketika payment gateway mengalami delay.
- Webhook dapat diproses ulang secara aman/idempotent.
- Proses upload yang gagal dapat diulang tanpa mengulang semua file.

### Scalability

Sistem harus dapat menangani ribuan foto per event dengan object storage scalable dan CDN.

### Maintainability

- Struktur kode modular.
- API terdokumentasi.
- Error logging tersedia.
- Environment development/staging/production dipisahkan.
- Konfigurasi sensitif menggunakan environment variables.

### Observability

Monitor minimal:

- Error rate.
- API latency.
- Payment webhook failures.
- Upload processing failures.
- Storage usage.
- Download failures.
- Core Web Vitals.

---

## 19. Rekomendasi Arsitektur Teknis

Arsitektur dapat menggunakan pendekatan sederhana dan scalable:

```text
Buyer
  ↓
Web App / CDN
  ↓
Backend API
  ├── Catalog
  ├── Cart & Checkout
  ├── Order
  ├── Payment
  ├── Download
  └── Admin
       ↓
Database

Upload
  ↓
Object Storage
  ├── Original
  ├── Preview
  └── Thumbnail
       ↓
CDN
       ↓
Buyer
```

Prinsip penting:

- Original image disimpan private dan tidak dilayani langsung oleh CDN publik.
- Thumbnail, individual preview, dan Catalog Preview Sheet adalah derived assets yang aman untuk katalog.
- Original hanya dilayani melalui secure download layer setelah entitlement diverifikasi.
- Processing foto dilakukan secara asynchronous/background job.
- Payment menggunakan webhook yang tervalidasi dan idempotent.
- API katalog dibuat ringan dan hanya mengirim metadata serta asset preview yang diperlukan.

---

## 20. User Stories

### Pembeli

- Sebagai pembeli, saya ingin melihat foto berdasarkan event dan kelas balap agar cepat menemukan foto saya.
- Sebagai pembeli, saya ingin mencari berdasarkan nomor start/bib agar tidak perlu melihat seluruh katalog.
- Sebagai pembeli, saya ingin memilih beberapa foto sekaligus agar tidak perlu checkout berkali-kali.
- Sebagai pembeli, saya ingin menyimpan foto favorit sebelum membeli.
- Sebagai pembeli, saya ingin membayar dengan QRIS/transfer/e-wallet agar proses pembayaran mudah.
- Sebagai pembeli, saya ingin menerima foto resolusi asli setelah pembayaran agar dapat langsung mengunduhnya.
- Sebagai pembeli mobile, saya ingin website cepat dibuka agar dapat mencari foto dengan koneksi internet yang terbatas.

### Admin

- Sebagai admin, saya ingin mengunggah banyak foto sekaligus agar proses katalogisasi efisien.
- Sebagai admin, saya ingin melihat preview hasil upload sebelum publish agar foto tidak salah event/kelas.
- Sebagai admin, saya ingin sistem membaca nomor start/bib dari foto agar pencarian lebih mudah.
- Sebagai admin, saya ingin menandai event sebagai ready agar pembeli tahu foto sudah tersedia.
- Sebagai admin, saya ingin melihat status pembayaran agar dapat memantau transaksi.
- Sebagai admin, saya ingin melihat laporan penjualan dan mengekspornya ke PDF agar mudah melakukan rekap.

---

## 21. KPI

### Bisnis

- Jumlah transaksi berhasil per event.
- Total revenue per event.
- Rata-rata jumlah foto per transaksi.
- Conversion rate visitor → buyer.
- Persentase penggunaan voucher.

### Operasional

- Waktu dari upload sampai katalog ready.
- Persentase upload berhasil.
- Persentase payment success.
- Persentase download berhasil.

### Performance

- LCP.
- INP.
- CLS.
- API latency p95.
- Error rate.
- Persentase halaman yang memenuhi performance budget.

---

## 22. Acceptance Criteria Utama

### Katalog

- [ ] Pembeli dapat memilih event.
- [ ] Pembeli dapat memilih kelas balap.
- [ ] Setiap katalog/variasi menampilkan 1 Catalog Preview Sheet.
- [ ] Catalog Preview Sheet merupakan gabungan visual dari foto-foto yang diunggah admin.
- [ ] Contoh 10 foto menghasilkan 1 gambar preview gabungan, bukan 10 thumbnail terpisah di halaman katalog.
- [ ] Foto original tetap tersimpan sebagai file individual di dalam katalog/variasi.
- [ ] Pembeli dapat membuka detail untuk melihat foto individual yang termasuk dalam katalog/variasi.
- [ ] Preview menggunakan watermark.
- [ ] Original tidak dapat diakses sebelum pembayaran.
- [ ] Browser tidak mengunduh seluruh original foto hanya untuk menampilkan katalog.

### Cart & Checkout

- [ ] Pembeli dapat memilih beberapa foto.
- [ ] Cart menampilkan total harga dengan benar.
- [ ] Voucher tervalidasi.
- [ ] Checkout dapat dilakukan tanpa membuat akun.
- [ ] Email dan WhatsApp divalidasi.

### Payment

- [ ] Payment gateway dapat membuat transaksi.
- [ ] Webhook mengubah status order secara aman.
- [ ] Order paid hanya setelah pembayaran terverifikasi.
- [ ] Payment pending/failed/expired ditampilkan dengan jelas.

### Download & Security

- [ ] Foto original berada di private storage.
- [ ] Foto original tidak dapat diakses sebelum pembayaran `Paid`.
- [ ] Katalog hanya menggunakan preview/thumbnail, bukan original.
- [ ] Detail foto hanya menggunakan preview individual yang telah dilindungi.
- [ ] Inspect Element/Network/direct URL tidak dapat digunakan untuk mengambil original sebelum paid.
- [ ] Redirect dari payment gateway tidak otomatis membuka original tanpa verifikasi backend.
- [ ] Webhook/API payment gateway menjadi sumber kebenaran status pembayaran.
- [ ] Entitlement download hanya dibuat setelah order `Paid`.
- [ ] Success Payment menjadi titik pertama akses original bagi pembeli.
- [ ] Hanya foto yang dibeli pada order tersebut yang dapat di-download.
- [ ] Link download menggunakan signed URL/token atau mekanisme secure download.
- [ ] Link memiliki expiry/validasi akses.
- [ ] Link kedaluwarsa dapat diterbitkan ulang setelah authorization berhasil.
- [ ] Download dapat dicatat dan dilindungi rate limiting.
- [ ] Pembeli menerima notifikasi setelah pembayaran berhasil.

### Admin

- [ ] Admin dapat membuat event dan kelas.
- [ ] Admin dapat bulk upload.
- [ ] Admin dapat melihat progress processing.
- [ ] Admin dapat publish katalog.
- [ ] Admin dapat melihat laporan dan export PDF.

### Accessibility

- [ ] Fungsi utama dapat digunakan dengan keyboard.
- [ ] Focus state terlihat.
- [ ] Form memiliki label.
- [ ] Error dapat dipahami tanpa bergantung pada warna.
- [ ] Kontras memenuhi standar yang ditargetkan.

### Performance

- [ ] Thumbnail tidak menggunakan file original.
- [ ] Gambar di bawah viewport lazy-loaded.
- [ ] Asset statis dapat dicache.
- [ ] Halaman publik tidak memuat bundle admin.
- [ ] Core Web Vitals dimonitor.

---

## 23. Risiko & Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Foto salah event/kelas saat bulk upload | Validasi, preview, metadata, dan konfirmasi sebelum publish |
| Upload ribuan foto terlalu lama | Background processing, parallel upload, progress indicator |
| Website lambat karena banyak foto | Thumbnail, responsive images, WebP/AVIF, lazy loading, CDN |
| Storage penuh | Object storage scalable, lifecycle policy, monitoring kapasitas |
| Penyalahgunaan preview | Watermark + resolusi rendah + original private |
| Payment pending terlalu lama | Webhook + status tracking + retry/idempotency |
| Webhook ganda | Idempotent processing berdasarkan transaction/order ID |
| OCR salah membaca nomor | Confidence score + koreksi manual admin |
| Download link dibagikan | Signed URL/secure token, expiry, authorization server-side, rate limiting, dan logging |
| Original bocor sebelum pembayaran | Private storage, tidak ada public original URL, server-side authorization, dan security testing |
| Buyer mencoba direct URL/Inspect Element | Original tidak pernah dikirim ke browser sebelum `Paid`; endpoint original wajib authorization |
| Admin salah publish | Draft → preview → publish workflow |
| Data pembeli terekspos | HTTPS, access control, minimisasi data, secure logging |

---

## 24. Fase Pengembangan

### Fase 1 — MVP

Fokus pada alur penjualan utama:

- Event & kelas.
- Katalog foto.
- Preview watermark.
- Multi-select.
- Cart.
- Guest checkout.
- Payment gateway.
- Order status.
- Download setelah pembayaran.
- Admin login.
- Bulk upload.
- Laporan dasar.
- Export PDF.
- Responsive mobile-first.
- Performance & accessibility baseline.

### Fase 1.1

- OCR nomor start/bib.
- Wishlist.
- Voucher.
- Email otomatis.
- Dashboard analitik dasar.

### Fase 1.2

- WhatsApp API.
- Optimasi search katalog.
- Monitoring dan performance tuning berdasarkan data produksi.

### Fase 2

- Face recognition.
- Fitur member/loyalty bila dibutuhkan.
- Pengembangan aplikasi mobile native jika validasi kebutuhan menunjukkan manfaat.

---

## 25. Definition of Done

Sebuah fitur dianggap selesai apabila:

1. Requirement fungsional terpenuhi.
2. Responsive pada mobile dan desktop.
3. Memiliki state loading, empty, success, dan error yang sesuai.
4. Dapat digunakan dengan keyboard untuk fungsi yang relevan.
5. Tidak memiliki error kritis pada production build.
6. Tidak menambahkan dependency berat tanpa alasan yang jelas.
7. Gambar menggunakan asset yang sudah dioptimalkan.
8. Event penting tercatat pada analytics/logging.
9. Security check dasar telah dilakukan.
10. Acceptance criteria fitur terpenuhi.

---

## 26. Kesimpulan

Website Jualan Foto Balap harus dibangun sebagai platform yang **simple, cepat, mudah diakses, dan fokus pada proses pembelian foto**.

Prioritas utama bukan membuat banyak dekorasi atau fitur kompleks, tetapi memastikan pengguna dapat:

**Temukan foto → Pilih foto → Bayar → Download**

dengan jumlah langkah sesedikit mungkin.

Di sisi admin:

**Buat event → Upload → Review → Publish → Pantau penjualan**

Dengan pendekatan **mobile-first, green primary color, Catalog Preview Sheet, optimized images, CDN, lazy loading, private original storage, secure download entitlement, dan accessibility baseline**, website diharapkan tetap ringan dan nyaman digunakan meskipun katalog berisi ribuan foto.

**Security principle yang tidak boleh dilanggar:**

> **Pembeli hanya melihat preview sebelum pembayaran. Foto original hanya dapat muncul/diakses pada halaman Success Payment setelah pembayaran terverifikasi, dan hanya untuk foto yang benar-benar dibeli.**
