# PANDUAN DEPLOYMENT APLIKASI UPTD LAB

Dokumen ini berisi panduan yang **SANGAT MUDAH DIPAHAIMI** untuk menjalankan aplikasi UPTD Lab baik secara lokal (di komputer sendiri) maupun di server (deployment). Aplikasi ini terdiri dari dua bagian utama: **Backend** (API & Database) dan **Frontend** (Tampilan Antarmuka).

---

## 1. STRUKTUR APLIKASI
Saat Anda membuka folder ini, Anda hanya perlu fokus pada 2 folder utama:
- 📁 **`backend`** : Menangani database (MySQL), autentikasi, dan logika sistem. Berjalan di Port `5000`.
- 📁 **`frontend`** : Menangani tampilan website untuk user dan admin. Berjalan di Port `3000`.

---

## 2. PERSIAPAN DATABASE (Hanya Perlu Sekali)
Sistem ini menggunakan database bernama **`uptd_lab`**.

**Jika mendeploy ke server baru (Database Kosong):**
Anda **tidak perlu** membuat ulang layanan atau tabel dari awal. Sistem ini sudah kami sediakan file backup databasenya secara lengkap (struktur tabel beserta data layanan dan akun adminnya). 
1. Buat database baru bernama `uptd_lab` di phpMyAdmin server Anda.
2. Klik menu **Import**.
3. Pilih file `uptd_lab_lengkap.sql` (sudah saya buatkan di dalam folder proyek ini).
4. Klik **Go/Import**. Semua data layanan dan konfigurasi akan otomatis terisi!

**Jika menjalankan di lokal (Database Sudah Ada):**
Sistem ini sudah dikonfigurasi untuk langsung membaca data yang sudah ada di database `uptd_lab` Anda tanpa menghapusnya.

---

## 3. CARA MENJALANKAN DI KOMPUTER LOKAL (TESTING)

### Langkah 1: Jalankan Backend
1. Buka terminal (Command Prompt / VS Code Terminal).
2. Masuk ke folder backend:
   ```bash
   cd backend
   ```
3. Install dependencies (hanya jika baru pertama kali):
   ```bash
   npm install
   ```
4. Jalankan backend:
   ```bash
   npm run dev
   ```
   *Ciri berhasil: Akan muncul tulisan "🚀 BACKEND SERVER RUNNING" dan terhubung ke database.*

### Langkah 2: Jalankan Frontend
1. Buka terminal **BARU** (biarkan terminal backend tetap berjalan).
2. Masuk ke folder frontend:
   ```bash
   cd frontend
   ```
3. Install dependencies (hanya jika baru pertama kali):
   ```bash
   npm install
   ```
4. Jalankan frontend:
   ```bash
   npm run dev
   ```
   *Ciri berhasil: Akan muncul tulisan "🚀 FRONTEND SERVER RUNNING".*

### Langkah 3: Buka Aplikasi
- Buka browser (Chrome/Edge) dan ketik: **http://localhost:3000**
- Untuk masuk sebagai Admin:
  - **Email:** `admin1@uptd.gov.id`
  - **Password:** `admin123`

---

## 4. CARA DEPLOY KE SERVER (VPS / HOSTING)

Untuk deploy ke server, caranya sama persis dengan di lokal, namun pastikan Anda menyesuaikan konfigurasi di file `.env`.

### LANGKAH PENTING: Generate Secret Keys
Sebelum mengisi file `.env`, buat dulu secret key yang kuat. Jalankan perintah ini di terminal server Anda:
```bash
# Generate JWT_ACCESS_SECRET
openssl rand -hex 64

# Generate JWT_REFRESH_SECRET (jalankan lagi untuk dapat nilai berbeda)
openssl rand -hex 64

# Generate SESSION_SECRET (untuk frontend)
openssl rand -hex 32
```
Salin hasil masing-masing perintah ke file `.env`.

### Pengaturan di Folder `backend/.env`:
Buka file `backend/.env` dan ubah isinya menyesuaikan server Anda:
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost       # Biarkan localhost jika database satu server
DB_USER=root            # Ganti dengan username DB server Anda
DB_PASSWORD=password    # Ganti dengan password DB server Anda
DB_NAME=uptd_lab        # Pastikan nama DB sesuai
CORS_ORIGINS=https://domain-anda.com  # URL frontend, pisah koma jika lebih dari 1
FRONTEND_URL=https://domain-anda.com
BASE_URL=https://api.domain-anda.com
JWT_ACCESS_SECRET=isi_hasil_openssl_rand_hex_64_pertama
JWT_REFRESH_SECRET=isi_hasil_openssl_rand_hex_64_kedua
```

### Pengaturan di Folder `frontend/.env`:
Buka file `frontend/.env` dan ubah isinya:
```env
NODE_ENV=production
PORT=3000
BACKEND_URL=https://api.domain-anda.com   # Harus sesuai dengan URL Backend
FRONTEND_URL=https://domain-anda.com      # URL website Anda
API_URL=https://api.domain-anda.com/api
SESSION_SECRET=isi_hasil_openssl_rand_hex_32
```

### Menjalankan di Server (Gunakan PM2 agar tidak mati)
Di server produksi, jangan gunakan `npm run dev`. Gunakan **PM2** agar aplikasi tetap menyala di latar belakang:
```bash
# Install PM2 secara global
npm install -g pm2

# Jalankan Backend
cd backend
pm2 start server.js --name "uptd-backend"

# Jalankan Frontend
cd ../frontend
pm2 start server.js --name "uptd-frontend"
```

## TIPS & TROUBLESHOOTING
1. **Tidak Bisa Login?** Pastikan backend berjalan dan database terhubung dengan benar di `backend/.env`.
2. **Halaman Frontend Blank/Error?** Periksa URL di `frontend/.env`. Pastikan `BACKEND_URL` sudah menunjuk ke URL atau IP server Backend yang benar.
3. **Database Error?** Pastikan servis MySQL di server (seperti XAMPP atau MySQL Daemon) dalam keadaan *Running*.
