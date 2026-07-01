const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * Rate limit global untuk semua route /api.
 * Mencegah abuse & DDoS ringan.
 */
exports.globalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT.windowMs,
    max: env.RATE_LIMIT.max,
    message: {
        success: false,
        message: 'Terlalu banyak request, coba lagi nanti'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limit khusus endpoint login.
 * Mencegah brute force password.
 */
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.RATE_LIMIT.loginMax,
    message: {
        success: false,
        message: 'Terlalu banyak percobaan login, coba 15 menit lagi'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});
