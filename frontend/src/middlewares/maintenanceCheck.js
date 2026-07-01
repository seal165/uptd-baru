const db = require('../config/database');
const logger = require('../utils/logger');

const PUBLIC_ROUTES = [
    '/',
    '/services',
    '/estimasi',
    '/profile',
    '/tentang',
    '/kontak',
    '/faq',
    '/login',
    '/register',
    '/admin/login',
    '/kuisioner',
    '/track'
];

/**
 * Cek mode maintenance.
 * - Route publik: skip
 * - Admin/superadmin: skip (boleh tetap akses untuk maintenance)
 * - User biasa: tampilkan halaman maintenance
 */
module.exports = async (req, res, next) => {
    const isPublic = PUBLIC_ROUTES.some(
        (route) => req.path === route || req.path.startsWith(route + '/')
    );
    if (isPublic) return next();

    if (
        req.session?.user &&
        ['admin', 'superadmin'].includes(req.session.user.role)
    ) {
        return next();
    }

    try {
        const [rows] = await db.query(
            "SELECT setting_value FROM settings WHERE setting_key = 'maintenance_mode'"
        );
        const maintenanceMode = rows.length > 0 ? rows[0].setting_value === 'true' : false;

        if (maintenanceMode) {
            return res.status(503).render('maintenance', {
                title: 'Maintenance - UPTD Lab',
                layout: false,
                message: 'Sistem sedang dalam pemeliharaan. Mohon kembali lagi nanti.'
            });
        }
        next();
    } catch (err) {
        logger.warn('Failed to check maintenance mode: ' + err.message);
        next();
    }
};
