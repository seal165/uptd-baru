/**
 * Konfigurasi session yang aman.
 * - httpOnly: cegah XSS baca cookie
 * - sameSite: cegah CSRF
 * - secure: HTTPS only (di production)
 */
const session = require('express-session');
const env = require('./env');

module.exports = session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
    cookie: {
        secure: env.COOKIE.secure, // true di production (HTTPS)
        maxAge: env.COOKIE.maxAge,
        httpOnly: true,
        sameSite: 'lax'
    },
    name: 'uptd.sid'
});
