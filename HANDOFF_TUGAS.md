# Panduan Lanjutan: Revisi Sistem UPTD Laboratorium Lingkungan

Dokumen ini memuat daftar tugas dan revisi krusial yang **belum diselesaikan** pada sistem. Daftar ini mencakup model, controller, dan frontend yang harus segera ditangani oleh pengembang selanjutnya.

---

## 1. Modul Pelanggan (User Section)
Bagian portal untuk klien/pelanggan yang mengakses pengujian.

### 📍 Lokasi File Terkait
- **Frontend:** `frontend/public/js/user/profile.js`, `frontend/src/views/user/submission.ejs`
- **Backend:** `backend/src/controllers/submissionController.js`, `backend/src/models/submissionModel.js`

### 🛠️ Revisi yang Belum Diperbaiki:
1. **Penyimpanan Sampel Pengajuan Kosong:** Fungsi `create` di `submissionController.js` saat ini hanya mengunggah dokumen dan menyimpan *header* pengajuannya ke tabel `submissions`. Script ini sama sekali belum memproses dan menyimpan array/list sampel pengujian ke dalam tabel `submission_samples`. Ini adalah *bug* fatal karena pengajuan menjadi tidak memiliki sampel apa pun.
2. **Total Data untuk Pagination Hilang:** Pada `submissionController.userHistory`, backend hanya menggunakan *limit* dan *offset* tanpa mengembalikan atribut `total_data` atau menghitung total keseluruhan baris. Hal ini akan mematahkan fitur *pagination* di frontend (halaman riwayat pengajuan).
3. **URL Resolusi Foto Profil (Profile.js):** Kode pada `user/profile.js` masih meresolusi URL foto profil (`baseUrl`) secara manual. Ini berisiko mengulangi masalah *broken image* / CRLF. Pastikan resolusi gambarnya mengambil konfigurasi aman dari `window.__APP_CONFIG__.assetBaseUrl` sama seperti yang sudah diperbaiki di panel Admin.

---

## 2. Halaman Publik (Index, Services, Profil Publik)
Halaman luar untuk masyarakat umum yang ingin mengetahui layanan UPTD tanpa *login*.

### 📍 Lokasi File Terkait
- **Frontend:** `frontend/src/views/index.ejs`, `frontend/src/views/services.ejs`
- **Backend:** `backend/src/routes/publicRoute.js` (Perlu dibuat/dimaksimalkan), `backend/src/controllers/publicController.js`

### 🛠️ Revisi yang Belum Diperbaiki:
1. **Data Layanan Masih *Hardcode*:** Daftar layanan, parameter uji, dan tarif yang tampil di `services.ejs` saat ini adalah ketikan statis di EJS. Anda wajib membangun fungsi `fetch` ke backend untuk merender data ini langsung dari tabel `test_categories` dan `test_types` secara dinamis.
2. **Statistik Beranda Palsu:** Angka seperti "Total Pengujian", "Sampel Dianalisa", dll pada halaman `index.ejs` masih merupakan data palsu (hardcode). Buat *endpoint* API publik (`/api/public/stats`) untuk menghitung data aktual dari database agar halaman publik lebih representatif.
3. **Konfigurasi Berita/Struktur Instansi:** Profil instansi dan sejarah belum terhubung ke sistem pengelolaan konten (*CMS*) dari sisi Admin. Harus diputuskan apakah ini akan dikonfigurasi melalui tabel `settings` atau dibiarkan statis.

---

## 3. Modul Admin Panel & Kejanggalan Sistem Lainnya
Seksi untuk petugas pengelola (Admin/Petugas Lab).

### 📍 Lokasi File Terkait
- **Frontend:** `frontend/public/js/admin/settings.js`, `frontend/public/js/admin/users.js`
- **Backend:** `backend/src/routes/settingRoute.js`, `backend/src/models/userModel.js`

### 🛠️ Revisi yang Belum Diperbaiki (Kejanggalan):
1. **Endpoint Upload Avatar Admin Hilang (404):** Karena *routes* lama (`api.js`) sudah dimatikan demi arsitektur URL yang baru, *endpoint* khusus `POST /api/settings/profile/avatar` tidak terbawa ke `settingRoute.js`. Akibatnya, jika Admin mengupload atau menghapus foto barunya dari halaman Pengaturan, sistem akan mengirim *error 404 Endpoint Not Found*. Segera pasang ulang integrasi *multer upload* ke dalam `settingRoute.js`.
2. **Search Filter Berlapis di Tabel Pengguna:** Tampilan antarmuka untuk filter tabel `Users` (Pelanggan/Admin) sudah berfungsi, namun fungsi *search query* di `userModel.js` belum tentu meng-handle kombo antara pencarian nama teks (`search`) DAN filter status peran (`role`) secara simultan dengan baik. Pastikan *query sql* menggunakan interpolasi parameter yang tepat (`LIKE %search% AND role = ?`).

---
*Silakan jadikan dokumen ini sebagai checklist utama sebelum sistem dideploy sepenuhnya ke tahap produksi.*
