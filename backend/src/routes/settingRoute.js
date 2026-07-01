const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const upload = require('../config/multer');
const checkUploadSize = require('../middlewares/checkUploadSize');
const path = require('path');
const fs = require('fs');
const {
    updateSystemSchema,
    updateBusyModeSchema,
    busyPeriodSchema
} = require('../validations/settingValidation');

// System config
router.get('/system', authMiddleware, requireRole('admin'), settingController.getSystem);
router.put(
    '/system',
    authMiddleware,
    requireRole('admin'),
    validate(updateSystemSchema),
    settingController.updateSystem
);
router.get('/profile', authMiddleware, settingController.getProfileSettings);

// Busy mode
router.get('/busy-mode', authMiddleware, settingController.getBusyMode);
router.put(
    '/busy-mode',
    authMiddleware,
    requireRole('admin'),
    validate(updateBusyModeSchema),
    settingController.updateBusyMode
);
router.get('/busy-mode/periods/:id', authMiddleware, settingController.getBusyPeriod);
router.post(
    '/busy-mode/periods',
    authMiddleware,
    requireRole('admin'),
    validate(busyPeriodSchema),
    settingController.addBusyPeriod
);
router.put(
    '/busy-mode/periods/:id',
    authMiddleware,
    requireRole('admin'),
    validate(busyPeriodSchema),
    settingController.updateBusyPeriod
);
router.delete(
    '/busy-mode/periods/:id',
    authMiddleware,
    requireRole('admin'),
    settingController.deleteBusyPeriod
);

// Activity logs
router.get('/logs', authMiddleware, requireRole('admin'), settingController.activityLogs);

// Backup
router.get('/backups', authMiddleware, requireRole('admin'), settingController.backupHistory);
router.post('/backup', authMiddleware, requireRole('admin'), settingController.createBackup);
router.post(
    '/restore',
    authMiddleware,
    requireRole('admin'),
    upload.single('backup_file'),
    checkUploadSize,
    settingController.restoreBackup
);

// Download backup file
router.get('/backup/:filename', authMiddleware, requireRole('admin'), (req, res) => {
    const { filename } = req.params;
    if (!filename.endsWith('.sql') || filename.includes('..') || filename.includes('/')) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    const filepath = path.join(__dirname, '../../backups', filename);
    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ success: false, message: 'File tidak ditemukan' });
    }
    res.download(filepath, filename);
});

module.exports = router;
