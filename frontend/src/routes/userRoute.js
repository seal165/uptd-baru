/**
 * Route untuk halaman USER (pelanggan).
 * Mount di /user/*
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const maintenanceCheck = require('../middlewares/maintenanceCheck');
const checkUploadSize = require('../middlewares/checkUploadSize');
const upload = require('../config/multer');

// Semua route /user/* WAJIB user pelanggan + maintenance check
router.use(authMiddleware.verifyUserAccess, maintenanceCheck);

router.get('/dashboard', userController.dashboard);
router.get('/profile', userController.profile);
router.post('/profile', userController.updateProfile);

router.get('/history', userController.history);
router.get('/history/:id', userController.historyDetail);

router.get('/submission', userController.submissionPage);
router.post(
    '/submission',
    upload.fields([
        { name: 'surat_permohonan', maxCount: 1 },
        { name: 'scan_ktp', maxCount: 1 },
        { name: 'lampiran_pendukung', maxCount: 1 }
    ]),
    checkUploadSize,
    userController.createSubmission
);

router.get('/transaction', userController.transactions);
router.get('/transaction/:id', userController.transactionDetail);
router.post(
    '/transaction/:id/upload',
    upload.single('payment_proof'),
    checkUploadSize,
    userController.uploadPaymentProof
);

module.exports = router;
