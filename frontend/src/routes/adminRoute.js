/**
 * Route untuk halaman ADMIN.
 * Mount di /admin/*
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Semua route /admin/* (kecuali /login) wajib role admin
router.get('/dashboard', authMiddleware.verifyPageAccess, adminController.dashboard);

router.get('/submissions', authMiddleware.verifyPageAccess, adminController.submissions);
router.get('/submissions/:id', authMiddleware.verifyPageAccess, adminController.detailSubmission);

router.get('/skrd', authMiddleware.verifyPageAccess, adminController.skrd);
router.get('/skrd/:id', authMiddleware.verifyPageAccess, adminController.detailSkrd);

router.get('/users', authMiddleware.verifyPageAccess, adminController.users);
router.get('/users/:id', authMiddleware.verifyPageAccess, adminController.userDetail);

router.get('/settings', authMiddleware.verifyPageAccess, adminController.settings);
router.get('/reports', authMiddleware.verifyPageAccess, adminController.reports);
router.get('/kuisioner', authMiddleware.verifyPageAccess, adminController.kuisioner);

module.exports = router;
