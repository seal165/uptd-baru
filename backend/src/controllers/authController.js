/**
 * Controller untuk autentikasi: register, login, adminLogin, changePassword.
 */
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const activityModel = require('../models/activityModel');
const tokenService = require('../services/tokenService');
const env = require('../config/env');
const { success, error } = require('../utils/responseHelper');
const sanitizer = require('../utils/sanitizer');

exports.register = async (req, res, next) => {
    try {
        const email = sanitizer.normalizeEmail(req.body.email);
        const { password, full_name, nama_instansi, alamat, nomor_telepon } = req.body;

        const existing = await userModel.findByEmail(email);
        if (existing) {
            return error(res, 409, 'Email sudah terdaftar, silakan gunakan email lain');
        }

        const hashed = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
        const userId = await userModel.create({
            email,
            password: hashed,
            full_name,
            nama_instansi,
            alamat,
            nomor_telepon: sanitizer.cleanPhone(nomor_telepon),
            role: 'pelanggan'
        });

        await activityModel.log({
            user_id: userId,
            activity_name: 'register',
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        return success(
            res,
            'Registrasi berhasil, silakan login',
            { id: userId, email },
            201
        );
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const email = sanitizer.normalizeEmail(req.body.email);
        const { password } = req.body;

        const user = await userModel.findByEmail(email);
        if (!user) {
            return error(res, 401, 'Email atau password salah');
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            await activityModel.log({
                user_id: user.id,
                activity_name: 'login_failed',
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            });
            return error(res, 401, 'Email atau password salah');
        }

        const accessToken = tokenService.signAccess({
            id: user.id,
            email: user.email,
            role: user.role
        });
        const refreshToken = tokenService.signRefresh({ id: user.id });

        await activityModel.log({
            user_id: user.id,
            activity_name: 'login',
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        return success(res, 'Login berhasil', {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            token: accessToken,
            refreshToken
        });
    } catch (err) {
        next(err);
    }
};

exports.adminLogin = async (req, res, next) => {
    try {
        const email = sanitizer.normalizeEmail(req.body.email);
        const { password } = req.body;

        const user = await userModel.findByEmail(email);
        if (!user) {
            return error(res, 401, 'Email atau password salah');
        }
        if (user.role !== 'admin' && user.role !== 'petugas') {
            return error(res, 403, 'Akses ditolak. Akun ini bukan admin');
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            await activityModel.log({
                user_id: user.id,
                activity_name: 'admin_login_failed',
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            });
            return error(res, 401, 'Email atau password salah');
        }

        const accessToken = tokenService.signAccess({
            id: user.id,
            email: user.email,
            role: user.role
        });

        await activityModel.log({
            user_id: user.id,
            activity_name: 'admin_login',
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        return success(res, 'Login berhasil', {
            token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { old_password, new_password } = req.body;

        const user = await userModel.findByIdWithPassword(req.user.id);
        if (!user) return error(res, 404, 'User tidak ditemukan');

        const valid = await bcrypt.compare(old_password, user.password);
        if (!valid) return error(res, 401, 'Password lama salah');

        const hashed = await bcrypt.hash(new_password, env.BCRYPT_SALT_ROUNDS);
        await userModel.updatePassword(user.id, hashed);

        await activityModel.log({
            user_id: user.id,
            activity_name: 'change_password',
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        return success(res, 'Password berhasil diubah');
    } catch (err) {
        next(err);
    }
};

exports.refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const decoded = tokenService.verifyRefresh(refreshToken);

        const user = await userModel.findById(decoded.id);
        if (!user) return error(res, 401, 'User tidak ditemukan');

        const accessToken = tokenService.signAccess({
            id: user.id,
            email: user.email,
            role: user.role
        });

        return success(res, 'Token diperbarui', { token: accessToken });
    } catch (err) {
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return error(res, 401, 'Refresh token tidak valid');
        }
        next(err);
    }
};

exports.logout = async (req, res, next) => {
    try {
        await activityModel.log({
            user_id: req.user.id,
            activity_name: 'logout',
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });
        return success(res, 'Logout berhasil');
    } catch (err) {
        next(err);
    }
};
