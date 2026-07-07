# Integrasi Role `super_admin` — Checklist dan Petunjuk Perubahan

Dokumen ini menjelaskan langkah-langkah yang perlu dilakukan agar role database yang sudah di-alter menjadi `super_admin`, `admin`, dan `pelanggan` selaras dengan aplikasi.

Ringkasan tugas utama

- Konsistensi role: ubah semua pengecekan `superadmin` → `super_admin`.
- Middleware baru / penyesuaian: buat `isAdminOrSuperAdmin` (opsional) dan `isSuperAdmin` (wajib untuk operasi sensitif).
- Controller `createUser`: batasi pilihan `role` berdasarkan siapa yang sedang login; simpan `nomor_surat_tugas` jika `super_admin` membuat akun staff.
- Reset-password (admin UI): izinkan `admin` mereset password hanya untuk `pelanggan`; jika target user adalah `admin` atau `super_admin`, hanya `super_admin` yang boleh melakukan reset.
- Frontend: sesuaikan tampilan menu dan form berdasarkan `req.user.role`.
- Pencarian & penggantian: cari istilah lama seperti `petugas` atau `superadmin` dan sesuaikan.

File yang perlu diperiksa / diubah (rekomendasi)

- **Backend middleware**: [backend/src/middlewares/auth.js](backend/src/middlewares/auth.js#L1-L300), [backend/src/middlewares/authMiddleware.js](backend/src/middlewares/authMiddleware.js#L1-L200), [backend/src/middlewares/maintenanceCheck.js](backend/src/middlewares/maintenanceCheck.js#L1-L200), [backend/src/middlewares/roleMiddleware.js](backend/src/middlewares/roleMiddleware.js#L1-L200)
- **Routes**: [backend/src/routes/userRoute.js](backend/src/routes/userRoute.js#L1-L80), [backend/src/routes/api.js](backend/src/routes/api.js#L100-L130)
- **Controllers**: [backend/src/controllers/userController.js](backend/src/controllers/userController.js#L1-L240), [backend/src/controllers/authController.js](backend/src/controllers/authController.js#L1-L340)
- **Frontend**: komponen sidebar, halaman manajemen user, dan form pendaftaran (path sesuai struktur frontend).

Contoh perubahan kode (backend)

1) Konsistensi role di middleware

Ganti pengecekan 'superadmin' menjadi 'super_admin'. Contoh (pada `maintenanceCheck`):

```js
// sebelum
if (req.session?.user && (req.session.user.role === 'admin' || req.session.user.role === 'superadmin')) {
    return next();
}

// sesudah
if (req.session?.user && (req.session.user.role === 'admin' || req.session.user.role === 'super_admin')) {
    return next();
}
```

2) Middleware terspesialisasi (saran implementasi)

Tambahkan helper di `roleMiddleware.js` atau file baru `accessMiddleware.js`:

```js
exports.isAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (req.user.role === 'admin' || req.user.role === 'super_admin') return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
};

exports.isSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (req.user.role === 'super_admin') return next();
  return res.status(403).json({ success: false, message: 'Forbidden: super_admin only' });
};
```

3) `resetPassword` (kontrol akses yang lebih ketat)

Ubah `userController.resetPassword` agar menolak `admin` yang mencoba mereset password akun `admin` atau `super_admin`.

```js
// di userController.resetPassword
const targetUser = await userModel.findById(req.params.id);
if (!targetUser) return error(res, 404, 'User tidak ditemukan');

// Jika yang melakukan request adalah admin biasa
if (req.user.role === 'admin' && targetUser.role !== 'pelanggan') {
  return error(res, 403, 'Admin hanya bisa mereset password untuk pelanggan');
}

// Jika yang melakukan request adalah super_admin -> boleh
```

4) `createUser` (batasi role berdasarkan pembuat)

Contoh pseudocode dalam controller pembuatan user yang dipanggil dari dasbor:

```js
// asumsi: req.user berisi user yang melakukan request
let roleToStore = 'pelanggan';
if (req.user.role === 'super_admin') {
  // super_admin boleh memilih 'admin' atau 'super_admin'
  if (['admin', 'super_admin'].includes(req.body.role)) {
    roleToStore = req.body.role;
  }
}
// jika req.user.role === 'admin' maka roleToStore tetap 'pelanggan'

// Simpan nomor_surat_tugas jika super_admin
const nomor_surat_tugas = req.user.role === 'super_admin' ? req.body.nomor_surat_tugas : null;

// Insert ke DB dengan role = roleToStore dan nomor_surat_tugas bila ada
```

5) Frontend

- Tampilkan menu "Kelola Admin/Staff" hanya jika `user.role === 'super_admin'`.
- Di form tambah user: jika current user adalah `admin`, sembunyikan dropdown role dan wajib pilih role `pelanggan`; jika `super_admin`, tampilkan pilihan role dan field `Nomor Surat Tugas`.

6) Pencarian istilah lama

Cari kata kunci (global search):
- `superadmin` → ubah ke `super_admin`
- `petugas` → periksa maksud semantik dan ganti ke `admin` atau `pelanggan` sesuai konteks

Rekomendasi eksekusi

1. Lakukan search & replace terbatas pada file backend terlebih dahulu (commit terpisah).
2. Terapkan perubahan middleware (`isAdminOrSuperAdmin` dan `isSuperAdmin`).
3. Update `userController.resetPassword` dan `createUser` sesuai contoh di atas.
4. Jalankan testing manual di lingkungan lokal: coba login sebagai `admin` dan `super_admin` lalu uji endpoint `POST /admin/users/:id/reset-password` serta pembuatan user.
5. Perbaiki frontend sesuai kebutuhan UX.

Apakah saya boleh menerapkan perubahan kode (patch) untuk middleware dan `userController.resetPassword` sekarang? Jika iya, saya akan membuat patch kecil yang memperbaiki pengecekan role dan menambahkan pemeriksaan target role pada reset-password.

---
Tautan cepat:
- Middleware autentikasi: [backend/src/middlewares/authMiddleware.js](backend/src/middlewares/authMiddleware.js#L1)
- Middleware lama/alternatif: [backend/src/middlewares/auth.js](backend/src/middlewares/auth.js#L1)
- Role middleware: [backend/src/middlewares/roleMiddleware.js](backend/src/middlewares/roleMiddleware.js#L1)
- Reset-password controller: [backend/src/controllers/userController.js](backend/src/controllers/userController.js#L1)
- Route admin reset-password (express): [backend/src/routes/userRoute.js](backend/src/routes/userRoute.js#L1)
