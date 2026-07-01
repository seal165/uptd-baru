const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Service untuk generate & verify JWT token.
 * Pakai dua secret terpisah: access (short-lived) & refresh (long-lived).
 */

exports.signAccess = (payload) =>
    jwt.sign(payload, env.JWT.accessSecret, { expiresIn: env.JWT.accessExpires });

exports.signRefresh = (payload) =>
    jwt.sign(payload, env.JWT.refreshSecret, { expiresIn: env.JWT.refreshExpires });

exports.verifyAccess = (token) => jwt.verify(token, env.JWT.accessSecret);

exports.verifyRefresh = (token) => jwt.verify(token, env.JWT.refreshSecret);
