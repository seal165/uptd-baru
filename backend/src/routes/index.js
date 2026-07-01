/**
 * Mount semua route domain di sini.
 *
 * Urutan:
 * 1. Route DOMAIN BARU (clean RESTful) di-mount duluan
 * 2. Legacy alias di-mount paling akhir (fallback untuk URL lama)
 */
const express = require('express');
const router = express.Router();

// Route baru (clean RESTful)
router.use('/auth', require('./authRoute'));
router.use('/public', require('./publicRoute'));
router.use('/users', require('./userRoute'));
router.use('/submissions', require('./submissionRoute'));
router.use('/skrd', require('./skrdRoute'));
router.use('/kuisioner', require('./kuisionerRoute'));
router.use('/notifications', require('./notificationRoute'));
router.use('/settings', require('./settingRoute'));
router.use('/reports', require('./reportRoute'));
router.use('/transactions', require('./transactionRoute'));
router.use('/files', require('./fileRoute'));
router.use('/dashboard', require('./dashboardRoute'));

// Backward compatibility layer (opsional — sudah dimatikan karena
// frontend v2.0 udah pakai URL clean. Aktifkan kalau perlu transisi.)
// router.use('/', require('./legacyAliasRoute'));

module.exports = router;
