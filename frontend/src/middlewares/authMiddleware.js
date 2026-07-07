/**
 * Auth middleware berbasis SESSION (untuk EJS pages).
 * Token JWT disimpan di req.session.token, dipakai saat call backend.
 */
const logger = require('../utils/logger');

const authMiddleware = {
    /**
     * Redirect kalau sudah login.
     * Dipakai di halaman /login dan /register.
     */
    redirectIfAuthenticated: (req, res, next) => {
        if (req.session && req.session.user) {
            const role = req.session.user.role;
            if (['admin', 'super_admin'].includes(role)) {
                // Kalau admin akses halaman login user, destroy session-nya
                if (req.path === '/login' || req.path === '/register') {
                    req.session.destroy(() => {
                        res.clearCookie('uptd.sid', { path: '/' });
                        return next();
                    });
                    return;
                }
                return res.redirect('/admin/dashboard');
            }
            if (role === 'pelanggan') {
                return res.redirect('/user/dashboard');
            }
        }
        next();
    },

    /**
     * Verifikasi akses halaman ADMIN.
     */
    verifyPageAccess: (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/admin/login');
        }
        const role = req.session.user.role;
        if (!['admin', 'super_admin'].includes(role)) {
            if (role === 'pelanggan') return res.redirect('/user/dashboard');
            return res.redirect('/');
        }
        next();
    },

    /**
     * Verifikasi akses halaman USER (pelanggan).
     */
    verifyUserAccess: (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }
        const role = req.session.user.role;
        if (role === 'pelanggan') return next();
        if (['admin', 'super_admin'].includes(role)) {
            return res.redirect('/admin/dashboard');
        }
        logger.warn('Unknown role accessing user area: ' + role);
        return res.redirect('/login');
    }
};

module.exports = authMiddleware;
