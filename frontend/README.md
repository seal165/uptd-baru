# UPTD Lab Pengujian — Frontend EJS (v2.0)

Frontend EJS telah di-**restrukturisasi total** untuk sinkron dengan backend v2.0.

---

## 🏗️ Struktur Baru

```
frontend/
├── server.js                            # Entry point (helmet, secure session, env)
├── package.json
├── .env / .env.example                  # 🆕 env variables
├── .gitignore                           # uploads/, logs/, .env keluar
├── public/                              # Static files (img, css, js, uploads sementara)
├── logs/                                # 🆕 Winston log files
└── src/
    ├── config/
    │   ├── env.js                       # 🆕 Validasi env saat startup
    │   ├── session.js                   # 🆕 Secure session config
    │   ├── multer.js                    # 🆕 File upload config
    │   └── database.js                  # MySQL pool (untuk query langsung)
    │
    ├── routes/                          # 🆕 Pecah per domain
    │   ├── index.js                     # Mount semua
    │   ├── publicRoute.js               # /, /services, /estimasi, /faq, /kuisioner/:id
    │   ├── authRoute.js                 # /login, /register, /logout, /admin/login
    │   ├── userRoute.js                 # /user/*
    │   └── adminRoute.js                # /admin/*
    │
    ├── controllers/                     # 🆕 Pecah per domain
    │   ├── publicController.js          # landing, services, estimasi, kuisioner
    │   ├── authController.js            # login, register, logout (+admin login)
    │   ├── userController.js            # dashboard, profile, submission, history, transaction
    │   └── adminController.js           # admin dashboard, submissions, skrd, users, dll
    │
    ├── services/                        # 🆕 BUSINESS LOGIC
    │   └── apiClient.js                 # 🌟 Centralized backend API client
    │
    ├── middlewares/                     # 🔄 Rename dari "middleware"
    │   ├── authMiddleware.js            # session-based auth (slim)
    │   ├── securityMiddleware.js        # 🆕 Helmet
    │   ├── rateLimitMiddleware.js       # 🆕 Anti brute-force
    │   ├── errorMiddleware.js           # 🆕 Global error handler
    │   ├── globalSettings.js            # Load settings dari DB
    │   ├── maintenanceCheck.js          # Maintenance mode
    │   └── checkUploadSize.js           # Validasi ukuran file
    │
    ├── utils/                           # 🆕
    │   └── logger.js                    # Winston (ganti console.log)
    │
    └── views/                           # EJS templates (TIDAK DIUBAH)
```

---

## 🌟 Highlight: `apiClient.js` (Pusat Integrasi Backend)

SEMUA call ke backend lewat 1 file ini. Kalau backend URL berubah, **cukup edit 1 file**.

Contoh pakai:
```js
const api = require('../services/apiClient');

// Login
const response = await api.auth.login(email, password);

// Get services
const services = await api.public.getServices();

// User dashboard (perlu token)
const data = await api.submission.userDashboard(token);

// Update submission (admin)
await api.submission.update(token, id, { status: 'Selesai' });
```

Semua URL endpoint dipakai dari backend v2.0 yang **clean RESTful**.

---

## 🚀 Cara Jalanin

```bash
# 1. Install dependencies
yarn install
# atau: npm install

# 2. Copy .env.example → .env, isi sesuai setup kamu
cp .env.example .env

# 3. Edit .env:
#    - API_URL: harus mengarah ke backend (default http://localhost:5000/api)
#    - SESSION_SECRET: random string min 32 char (penting untuk security session)
#    - DB_*: kredensial MySQL kamu

# 4. Generate session secret:
#    Windows PowerShell:
#    [System.Web.Security.Membership]::GeneratePassword(64, 0)
#
#    Atau pakai: https://www.random.org/strings/

# 5. Pastikan backend sudah jalan di port 5000

# 6. Jalankan
yarn dev     # development (nodemon)
yarn start   # production
```

Buka `http://localhost:3000` di browser.

---

## 🔐 Security yang Sudah Aktif di Frontend

| Item | Detail |
|------|--------|
| **Helmet** | Security headers (X-Frame, X-XSS, dll) |
| **Secure session** | httpOnly + sameSite cookie, regenerate on login |
| **Session secret validation** | Min 32 char, fail-fast saat startup |
| **Rate limiting** | Login/register 10 req/15min per IP |
| **Env validation** | Server gagal start kalau env wajib missing |
| **Compression** | Response di-gzip |
| **Trust proxy** | Siap dibalik nginx/cloudflare |
| **Centralized API client** | Sanitize + log semua call backend |
| **Winston logger** | Log ke `logs/frontend-*.log` |
| **Graceful shutdown** | Handle SIGTERM + unhandledRejection |

---

## 🔗 Daftar Route

### Public (no login)
- `GET /` — Landing page
- `GET /services` — Daftar layanan
- `GET /estimasi` — Estimasi biaya
- `GET /profile` — Profil perusahaan
- `GET /tentang`, `/kontak` — alias `/profile`
- `GET /faq` — FAQ
- `GET /maintenance` — Halaman maintenance
- `GET /track/:no_urut` — Lacak pengajuan
- `GET /kuisioner/:submissionId` — Form kuisioner

### Auth
- `GET /login` / `POST /login` — Login pelanggan
- `GET /register` / `POST /register` — Daftar
- `GET /admin/login` / `POST /admin/login` — Login admin
- `GET /logout` — Logout

### User (butuh login pelanggan)
- `GET /user/dashboard` — Dashboard user
- `GET/POST /user/profile` — Profile user
- `GET /user/history`, `/user/history/:id` — Riwayat pengajuan
- `GET/POST /user/submission` — Form pengajuan
- `GET /user/transaction`, `/user/transaction/:id` — Transaksi
- `POST /user/transaction/:id/upload` — Upload bukti bayar

### Admin (butuh role admin)
- `GET /admin/dashboard` — Dashboard admin
- `GET /admin/submissions`, `/admin/submissions/:id` — Manajemen pengajuan
- `GET /admin/skrd`, `/admin/skrd/:id` — Manajemen SKRD
- `GET /admin/users`, `/admin/users/:id` — Data pemohon
- `GET /admin/settings` — Pengaturan
- `GET /admin/reports` — Laporan
- `GET /admin/kuisioner` — Manajemen kuisioner

---

## 🧪 Quick Test

```bash
# Frontend health
curl -I http://localhost:3000/

# Test redirect halaman user tanpa login (harus 302 ke /login)
curl -I http://localhost:3000/user/dashboard

# Test halaman publik
curl -I http://localhost:3000/services
```

---

## 🔄 Migrasi dari Versi Lama

**File LAMA yang dihapus:**
- ❌ `src/controllers/pageController.js` (1567 baris numpuk)
- ❌ `src/routes/mainRoutes.js` (339 baris)
- ❌ `src/middleware/auth.js` (pindah ke `src/middlewares/authMiddleware.js`)

**File BARU di v2.0:**
- ✅ `src/services/apiClient.js` (pusat call backend)
- ✅ `src/config/env.js` (validasi env)
- ✅ `src/config/session.js` (secure session)
- ✅ `src/config/multer.js` (upload config)
- ✅ `src/controllers/*.js` (4 controller per domain)
- ✅ `src/routes/*.js` (4 route per domain)
- ✅ `src/middlewares/securityMiddleware.js` (helmet)
- ✅ `src/middlewares/rateLimitMiddleware.js` (rate limit)
- ✅ `src/middlewares/errorMiddleware.js` (global error)
- ✅ `src/utils/logger.js` (winston)

**Yang tidak diubah:**
- ✅ Semua EJS template di `src/views/`
- ✅ Schema database
- ✅ Static assets di `public/`

---

## ⚠️ Penting

1. **Backend WAJIB jalan dulu** sebelum frontend. Frontend tergantung sama backend untuk hampir semua data.
2. **Backend & Frontend pakai database MySQL yang sama**.
3. **Session secret** harus random + min 32 karakter. Kalau tidak, server gagal start (fail-fast).
4. **Di production**, set `NODE_ENV=production` dan `COOKIE_SECURE=true` (pastikan pakai HTTPS).
5. **Folder `public/uploads/`** sekarang gitignored (file temporary user, jangan di-commit).

---

**Tech stack:** Node.js · Express 4 · EJS · Helmet · Express-session · Axios · MySQL2 · Winston
