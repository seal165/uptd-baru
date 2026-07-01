/**
 * Helmet + security headers.
 * Karena ini EJS yang inject inline script untuk EJS variables,
 * CSP di-set permissive. Bisa diperketat nanti.
 */
const helmet = require('helmet');

module.exports = helmet({
    contentSecurityPolicy: false, // EJS sering pakai inline script
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
});
