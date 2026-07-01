/**
 * Middleware untuk membatasi akses berdasarkan role.
 * Pakai SETELAH authMiddleware.
 * Contoh: router.delete('/x', authMiddleware, requireRole('admin'), ctrl.delete)
 */
exports.requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Role kamu tidak diizinkan'
        });
    }
    next();
};
