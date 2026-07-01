const rateLimit = require('express-rate-limit');

/**
 * Rate limit khusus untuk endpoint login/register.
 */
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 percobaan login per 15 menit per IP
    message: {
        success: false,
        message: 'Terlalu banyak percobaan, coba 15 menit lagi'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

/**
 * Rate limit umum untuk semua route.
 */
exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // 500 request per 15 menit per IP (longgar untuk frontend SSR)
    standardHeaders: true,
    legacyHeaders: false
});
