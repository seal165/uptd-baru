const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const tokenService = require('../services/tokenService');

const authController = {
    // ── LOGIN (user/pelanggan) ────────────────────────────────────────────
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const [users] = await db.query(
                'SELECT * FROM users WHERE email = ? AND role = ?',
                [email, 'pelanggan']
            );

            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Email atau password salah' });
            }

            const user = users[0];
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(401).json({ success: false, message: 'Email atau password salah' });
            }

            const payload = { id: user.id, email: user.email, full_name: user.full_name, role: user.role };
            const token        = tokenService.signAccess(payload);
            const refreshToken = tokenService.signRefresh({ id: user.id });

            // Catat aktivitas (opsional, jika tabel ada)
            db.query(
                'INSERT INTO activities (user_id, activity_name, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [user.id, 'Login ke sistem', req.ip, req.headers['user-agent']]
            ).catch(() => {});

            res.json({
                success: true,
                message: 'Login berhasil',
                data: { token, refreshToken, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }
    },

    // ── ADMIN LOGIN ────────────────────────────────────────────────────────
    adminLogin: async (req, res) => {
        try {
            const { email, password } = req.body;

            const [users] = await db.query(
                "SELECT * FROM users WHERE email = ? AND role IN ('admin', 'superadmin')",
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Email atau password salah' });
            }

            const user = users[0];
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(401).json({ success: false, message: 'Email atau password salah' });
            }

            const payload = { id: user.id, email: user.email, full_name: user.full_name, role: user.role };
            const token        = tokenService.signAccess(payload);
            const refreshToken = tokenService.signRefresh({ id: user.id });

            db.query(
                'INSERT INTO activities (user_id, activity_name, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [user.id, 'Admin login ke sistem', req.ip, req.headers['user-agent']]
            ).catch(() => {});

            res.json({
                success: true,
                message: 'Login berhasil',
                data: { token, refreshToken, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }
    },

    // ── REGISTER ──────────────────────────────────────────────────────────
    register: async (req, res) => {
        try {
            const { full_name, email, password, nama_instansi, alamat, nomor_telepon } = req.body;

            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const [result] = await db.query(
                'INSERT INTO users (full_name, email, password, nama_instansi, alamat, nomor_telepon, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [full_name, email, hashedPassword, nama_instansi || null, alamat || null, nomor_telepon || null, 'pelanggan']
            );

            const payload = { id: result.insertId, email, full_name, role: 'pelanggan' };
            const token        = tokenService.signAccess(payload);
            const refreshToken = tokenService.signRefresh({ id: result.insertId });

            db.query(
                'INSERT INTO activities (user_id, activity_name, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [result.insertId, 'User baru mendaftar', req.ip, req.headers['user-agent']]
            ).catch(() => {});

            res.status(201).json({
                success: true,
                message: 'Registrasi berhasil',
                data: { token, refreshToken, user: { id: result.insertId, full_name, email, role: 'pelanggan' } }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }
    },

    // ── REFRESH TOKEN ─────────────────────────────────────────────────────
    refresh: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ success: false, message: 'Refresh token wajib diisi' });
            }

            const decoded = tokenService.verifyRefresh(refreshToken);

            const [users] = await db.query(
                'SELECT id, email, full_name, role FROM users WHERE id = ?',
                [decoded.id]
            );
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
            }

            const user    = users[0];
            const payload = { id: user.id, email: user.email, full_name: user.full_name, role: user.role };
            const newToken = tokenService.signAccess(payload);

            res.json({ success: true, data: { token: newToken } });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Refresh token expired, silakan login ulang' });
            }
            res.status(401).json({ success: false, message: 'Refresh token tidak valid' });
        }
    },

    // ── LOGOUT ────────────────────────────────────────────────────────────
    logout: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (userId) {
                db.query(
                    'INSERT INTO activities (user_id, activity_name, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                    [userId, 'Logout dari sistem', req.ip, req.headers['user-agent']]
                ).catch(() => {});
            }
            res.json({ success: true, message: 'Logout berhasil' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }
    },

    // ── CHANGE PASSWORD ───────────────────────────────────────────────────
    changePassword: async (req, res) => {
        try {
            const userId = req.user?.id;
            const { old_password, new_password } = req.body;

            const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
            if (users.length === 0) {
                return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
            }

            const valid = await bcrypt.compare(old_password, users[0].password);
            if (!valid) {
                return res.status(400).json({ success: false, message: 'Password lama tidak sesuai' });
            }

            const hashed = await bcrypt.hash(new_password, 10);
            await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

            res.json({ success: true, message: 'Password berhasil diubah' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }
    },

    // ── VERIFY TOKEN (dipakai frontend untuk cek sesi aktif) ──────────────
    verifyToken: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
            }

            const decoded = tokenService.verifyAccess(token);

            const [users] = await db.query(
                'SELECT id, full_name, email, role FROM users WHERE id = ?',
                [decoded.id]
            );
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
            }

            res.json({ success: true, data: { user: users[0] } });
        } catch (error) {
            res.status(401).json({ success: false, message: 'Token tidak valid' });
        }
    }
};

module.exports = authController;