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

// Helper: allow admin OR super_admin
exports.isAdminOrSuperAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (req.user.role === 'admin' || req.user.role === 'super_admin') return next();
    return res.status(403).json({ success: false, message: 'Forbidden: admin or super_admin only' });
};

// Helper: allow only super_admin
exports.isSuperAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (req.user.role === 'super_admin') return next();
    return res.status(403).json({ success: false, message: 'Forbidden: super_admin only' });
};