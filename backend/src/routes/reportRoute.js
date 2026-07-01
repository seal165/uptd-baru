const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const upload = require('../config/multer');
const checkUploadSize = require('../middlewares/checkUploadSize');

router.get('/', authMiddleware, requireRole('admin', 'petugas'), reportController.list);

// Submission report endpoints (lewat /api/submissions/:id/report)
// Sengaja dibuat di sini supaya semua report logic terpusat.
router.post(
    '/submissions/:id',
    authMiddleware,
    requireRole('admin', 'petugas'),
    upload.single('laporan'),
    checkUploadSize,
    reportController.uploadSubmissionReport
);

router.get(
    '/submissions/:id',
    authMiddleware,
    reportController.downloadSubmissionReport
);

router.delete(
    '/submissions/:id',
    authMiddleware,
    requireRole('admin', 'petugas'),
    reportController.deleteSubmissionReport
);

module.exports = router;
