const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * 404 handler — render halaman utama atau halaman 404.
 */
exports.notFound = (req, res) => {
    // Untuk request EJS yang gak match, redirect ke beranda
    if (req.accepts('html')) {
        return res.redirect('/');
    }
    res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
};

/**
 * Global error handler.
 */
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    if (req.accepts('html')) {
        if (req.session) {
            req.session.error = 'Terjadi kesalahan server. Silakan coba lagi.';
        }
        return res.redirect('/');
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: env.NODE_ENV === 'production' ? 'Terjadi kesalahan server' : err.message
    });
};
