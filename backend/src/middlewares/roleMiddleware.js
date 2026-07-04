/**
 * Middleware untuk membatasi akses berdasarkan role.
 * Pakai SETELAH authMiddleware.
 * Contoh: router.delete('/x', authMiddleware, requireRole('admin'), ctrl.delete)
 */
exports.requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
        }
        next();
    };
};