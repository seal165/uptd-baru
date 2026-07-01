/**
 * Route untuk AUTH (login, register, logout).
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');

// Login/register pages
router.get('/login', authMiddleware.redirectIfAuthenticated, authController.loginPage);
router.get('/register', authMiddleware.redirectIfAuthenticated, authController.registerPage);
router.get('/admin/login', authController.adminLoginPage);

// POST handlers (dengan rate limit)
router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
router.post('/admin/login', authLimiter, authController.adminLogin);

// Backward compat (legacy URL untuk frontend old)
router.post('/auth/login', authLimiter, authController.login);
router.post('/auth/register', authLimiter, authController.register);
router.post('/auth/admin/login', authLimiter, authController.adminLogin);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
