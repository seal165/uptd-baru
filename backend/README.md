# UPTD Lab Pengujian — Backend API (v2.0)

Backend telah di-**restrukturisasi total** dengan separation of concerns yang rapi + security standar.

---

## 🏗️ Struktur Baru

```
backend/
├── server.js                            # Entry point (helmet, cors, rate limit, mount route)
├── package.json
├── .env / .env.example
├── .gitignore                           # uploads/ & backups/ sekarang TIDAK ditrack
├── .eslintrc.json / .prettierrc
├── prisma/                              # (tetap)
├── scripts/                             # (tetap)
├── uploads/                             # (gitignored)
├── backups/                             # (gitignored)
├── logs/                                # Winston log files
└── src/
    ├── config/
    │   ├── database.js                  # MySQL pool (tidak berubah)
    │   ├── multer.js                    # Upload config
    │   └── env.js                       # 🆕 Validasi env saat startup
    ├── routes/                          # 1 file per domain
    │   ├── index.js                     # Mount semua
    │   ├── authRoute.js
    │   ├── userRoute.js
    │   ├── submissionRoute.js
    │   ├── skrdRoute.js
    │   ├── kuisionerRoute.js
    │   ├── notificationRoute.js
    │   ├── settingRoute.js
    │   ├── reportRoute.js
    │   ├── transactionRoute.js
    │   ├── publicRoute.js
    │   ├── fileRoute.js
    │   ├── dashboardRoute.js
    │   └── mainRoutes.js                # (legacy EJS pages, opsional)
    ├── controllers/                     # 1 controller per domain
    │   ├── authController.js
    │   ├── userController.js
    │   ├── submissionController.js
    │   ├── skrdController.js
    │   ├── kuisionerController.js
    │   ├── notificationController.js
    │   ├── settingController.js
    │   ├── reportController.js
    │   ├── transactionController.js
    │   ├── publicController.js
    │   ├── fileController.js
    │   └── dashboardController.js
    ├── models/                          # 🆕 Semua query DB pindah ke sini
    │   ├── userModel.js
    │   ├── submissionModel.js
    │   ├── paymentModel.js
    │   ├── kuisionerModel.js
    │   ├── notificationModel.js
    │   ├── settingModel.js
    │   ├── reportModel.js
    │   ├── serviceModel.js
    │   └── activityModel.js
    ├── middlewares/                     # Rename dari "middleware"
    │   ├── authMiddleware.js            # SLIM, cuma verify token
    │   ├── roleMiddleware.js            # 🆕 requireRole('admin', ...)
    │   ├── validationMiddleware.js      # 🆕 Joi wrapper
    │   ├── rateLimitMiddleware.js       # 🆕 globalLimiter, loginLimiter
    │   ├── errorMiddleware.js           # 🆕 global error handler
    │   ├── checkUploadSize.js
    │   ├── globalSettings.js
    │   └── maintenanceCheck.js
    ├── validations/                     # 🆕 Joi schema
    │   ├── authValidation.js
    │   ├── userValidation.js
    │   ├── submissionValidation.js
    │   ├── skrdValidation.js
    │   ├── kuisionerValidation.js
    │   └── settingValidation.js
    ├── services/                        # 🆕 Logic kompleks
    │   └── tokenService.js
    └── utils/                           # 🆕 Helper
        ├── logger.js                    # Winston (ganti console.log)
        ├── responseHelper.js            # success/error response konsisten
        └── sanitizer.js
```

---

## 🚀 Cara Jalanin

```bash
# 1. Install dependencies
yarn install
# atau: npm install

# 2. Copy .env.example → .env, lalu isi
cp .env.example .env

# 3. Generate JWT secret yang aman
openssl rand -hex 64    # untuk JWT_ACCESS_SECRET
openssl rand -hex 64    # untuk JWT_REFRESH_SECRET

# 4. Pastikan database MySQL `uptd_lab` sudah ada dengan schema yang sesuai
mysql -u root uptd_lab < your_dump.sql

# 5. Jalankan
yarn dev    # development (nodemon)
yarn start  # production
```

Server jalan di `http://localhost:5000` (atau sesuai `PORT` di `.env`).

---

## 🔐 Security yang Sudah Aktif

| Item | Detail |
|------|--------|
| **Helmet** | Security headers (HSTS, X-Frame, X-XSS, dll) |
| **CORS whitelist** | Origin dibaca dari `CORS_ORIGINS` di .env (tidak pakai `*`) |
| **Rate limiting** | Global 100 req/15min, Login 5 req/15min (anti brute-force) |
| **JWT** | Access token (3h) + Refresh token (7d), pakai 2 secret berbeda |
| **bcrypt** | Salt rounds 12 (configurable via env) |
| **Joi validation** | Semua input divalidasi sebelum masuk controller |
| **HPP** | Cegah HTTP Parameter Pollution |
| **Body limit** | 10MB max (cegah payload bomb) |
| **File access auth** | `/api/files/:type/:filename` butuh token + cek ownership |
| **Path traversal protection** | Filename diblok kalau ada `..`, `/`, `\` |
| **Winston logger** | Semua log masuk `logs/error.log` & `logs/combined.log` |
| **Global error handler** | Stack trace TIDAK bocor di production |
| **Env validation** | Server gagal start kalau env wajib missing |
| **Graceful shutdown** | Handle SIGTERM + unhandledRejection |
| **Trust proxy** | Siap dibalik nginx/cloudflare |

---

## 📋 Daftar Endpoint Utama

### Auth (`/api/auth`)
- `POST /register` — Daftar akun baru
- `POST /login` — Login pelanggan
- `POST /admin/login` — Login admin/petugas
- `POST /refresh` — Refresh access token
- `POST /logout` — Logout (butuh auth)
- `POST /change-password` — Ganti password (butuh auth)

### Submission (`/api/submissions`)
- `GET /` — List semua (admin)
- `GET /:id` — Detail
- `POST /` — Buat submission baru (user, upload file)
- `PUT /:id` — Update (admin)
- `POST /:id/cancel` — Batalkan
- `GET /user/history` — Riwayat user
- `GET /user/dashboard` — Dashboard user

### SKRD/Invoice (`/api/skrd`)
- `GET /` — List
- `POST /` — Buat invoice (admin)
- `PUT /:id/status` — Update status
- `POST /:id/upload-skrd` — Upload file SKRD (admin)
- `POST /:id/upload-payment-proof` — Upload bukti bayar (user)
- `POST /:id/verify-payment` — Verifikasi pembayaran (admin)
- `POST /:id/reject-proof` — Tolak bukti (admin)
- `POST /:id/remind` — Kirim reminder (admin)

### Kuisioner (`/api/kuisioner`)
- `GET /public/questions` — List pertanyaan (no auth)
- `POST /public/submit` — Submit jawaban (no auth)
- `GET /questions` — List pertanyaan (admin)
- `POST /questions` — Tambah pertanyaan (admin)
- `PUT /questions/:id` — Update pertanyaan (admin)
- `DELETE /questions/:id` — Hapus pertanyaan (admin)
- `POST /questions/reorder` — Reorder pertanyaan (admin)

### User Management (`/api/users`)
- `GET /` — List user (admin)
- `GET /:id/detail` — Detail user (admin)
- `PUT /:id` — Update user (admin)
- `DELETE /:id` — Hapus user (admin)
- `POST /:id/reset-password` — Reset password (admin)
- `GET /profile/me` — Profile sendiri
- `PUT /profile/me` — Update profile sendiri
- `POST /profile/avatar` — Upload avatar

### Setting (`/api/settings`)
- `GET/PUT /system` — Konfigurasi sistem (admin)
- `GET/PUT /busy-mode` — Mode sibuk
- `GET /logs` — Activity logs
- `GET /backups`, `POST /backup`, `POST /restore` — Backup management

### Notification (`/api/notifications`)
- `GET /admin` — Notifikasi admin
- `PUT /admin/mark-all-read` — Mark all read
- `GET /user` — Notifikasi user
- `GET /user/count` — Jumlah unread

### Report (`/api/reports`)
- `GET /` — List laporan
- `POST /submissions/:id` — Upload laporan (admin)
- `GET /submissions/:id` — Download laporan

### File (`/api/files`) 🆕
- `GET /:fileType/:filename` — Akses file aman (auth + ownership check)

### Public (`/api/public`)
- `GET /services` — List layanan
- `GET /jadwal-sibuk` — Jadwal sibuk

### Dashboard (`/api/dashboard`)
- `GET /admin/stats` — Statistik admin
- `GET /complete` — Data dashboard lengkap

---

## ⚠️ BREAKING CHANGES dari Versi Lama

1. **URL endpoint berubah** beberapa:
   - `/api/admin/users` → `/api/users`
   - `/api/admin/users/:id/detail` → `/api/users/:id/detail`
   - `/api/user/profile` → `/api/users/profile/me`
   - `/api/admin/notifications` → `/api/notifications/admin`
   - `/api/user/notifications` → `/api/notifications/user`
   - `/api/file/:type/:filename` → `/api/files/:type/:filename` ⚠️ **PLURAL**
   - `/uploads/surat/xxx.pdf` (tanpa auth) → `/api/files/surat/xxx.pdf` (butuh auth + ownership) ⚠️

2. **Response format konsisten**: `{ success, message, data }` di semua endpoint.

3. **Validation error format baru**:
   ```json
   {
     "success": false,
     "message": "Validasi gagal",
     "errors": [{ "field": "email", "message": "..." }]
   }
   ```

4. **`/uploads/*` static SUDAH DIHAPUS** kecuali `/uploads/avatar/*` (avatar publik biar gampang di UI). File sensitif (KTP, surat, laporan) HARUS lewat `/api/files/:type/:filename` dengan token.

5. **Frontend perlu disesuaikan** dengan URL & response baru.

---

## 🔄 Frontend Migration Cheat Sheet

| Endpoint lama | Endpoint baru |
|---------------|---------------|
| `GET /api/admin/users` | `GET /api/users` |
| `GET /api/admin/users/:id/detail` | `GET /api/users/:id/detail` |
| `GET /api/user/profile` | `GET /api/users/profile/me` |
| `PUT /api/user/profile` | `PUT /api/users/profile/me` |
| `POST /api/user/avatar` | `POST /api/users/profile/avatar` |
| `POST /api/user/change-password` | `POST /api/auth/change-password` |
| `GET /api/user/dashboard` | `GET /api/submissions/user/dashboard` |
| `GET /api/user/history` | `GET /api/submissions/user/history` |
| `POST /api/user/submission` | `POST /api/submissions` |
| `GET /api/admin/dashboard/stats` | `GET /api/dashboard/admin/stats` |
| `GET /api/dashboard/complete` | `GET /api/dashboard/complete` |
| `GET /api/admin/notifications` | `GET /api/notifications/admin` |
| `GET /api/user/notifications` | `GET /api/notifications/user` |
| `GET /api/user/notifications/count` | `GET /api/notifications/user/count` |
| `GET /api/user/notification-settings` | `GET /api/notifications/user/settings` |
| `GET /api/user/transactions` | `GET /api/transactions/user` |
| `GET /api/file/:type/:filename` | `GET /api/files/:type/:filename` |
| `GET /uploads/surat/xxx.pdf` (static) | `GET /api/files/surat/xxx.pdf` (auth) |
| `GET /api/admin/kuisioner` | `GET /api/kuisioner` |
| `GET /api/jadwal-sibuk` | `GET /api/public/jadwal-sibuk` |

---

## 🧪 Quick Test

```bash
# Health check
curl http://localhost:5000/

# Test login (ganti email/password dengan yang ada di DB)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uptd.gov.idd","password":"<password_asli>"}'

# Test rate limit (login 6x dengan password salah → request ke-6 ditolak)
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@x.com","password":"salah"}'
  echo
done
```

---

## 📝 TODO Pasca-Restrukturisasi

- [ ] Update kode frontend pakai URL & response baru
- [ ] Rotate password semua user di DB (karena `apiController.js` lama pernah ke-publish)
- [ ] Migrasi user-uploaded file (KTP, surat) — pertimbangkan minta user re-upload
- [ ] Setup HTTPS di production (nginx/caddy)
- [ ] Setup monitoring (PM2, Sentry, atau sejenisnya)
- [ ] Pertimbangkan migrasi penuh ke Prisma (saat ini hybrid mysql2 + prisma)
- [ ] Tambah unit test pakai Jest + supertest

---

**Tech stack:** Node.js · Express 4 · MySQL 2 · Prisma · JWT · bcrypt · Joi · Winston · Helmet
