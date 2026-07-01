/**
 * Frontend Entry Point — UPTD Lab Pengujian.
 * Express + EJS dengan security (helmet, secure session, rate limit, env validation).
 */
require('./src/config/env'); // validasi env paling awal

const express = require('express');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const env = require('./src/config/env');
const sessionMiddleware = require('./src/config/session');
const logger = require('./src/utils/logger');
const securityHeaders = require('./src/middlewares/securityMiddleware');
const { globalLimiter } = require('./src/middlewares/rateLimitMiddleware');
const globalSettings = require('./src/middlewares/globalSettings');
const { notFound, errorHandler } = require('./src/middlewares/errorMiddleware');
const routes = require('./src/routes');

const app = express();

// Trust proxy (saat dibalik nginx/cloudflare)
app.set('trust proxy', 1);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Security headers
app.use(securityHeaders);

// Body parser & cookie
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Rate limit global
app.use(globalLimiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session (cookie aman: httpOnly, sameSite, secure di production)
app.use(sessionMiddleware);

// Global settings (load setting dari DB → res.locals.settings)
app.use(globalSettings);

// Pass session user + currentUrl ke semua view
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.currentUrl = req.originalUrl;
    next();
});

// Mount semua route
app.use('/', routes);

// 404 + error handler (HARUS paling bawah)
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(env.PORT, () => {
    logger.info(`Frontend server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

// Graceful shutdown
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection: ' + err.message);
    server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing frontend server');
    server.close(() => process.exit(0));
});

module.exports = app;
