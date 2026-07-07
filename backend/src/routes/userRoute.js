const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const submissionController = require('../controllers/submissionController');
const transactionController = require('../controllers/transactionController');
const notificationController = require('../controllers/notificationController');

const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const upload = require('../config/multer');
const checkUploadSize = require('../middlewares/checkUploadSize');

// Import validations
const {
    updateProfileSchema,
    adminUpdateUserSchema,
    changePasswordSchema
} = require('../validations/userValidation');

// =========== ADMIN MANAGE USER ===========
router.get('/', authMiddleware, requireRole('admin','super_admin'), userController.list);
router.get('/:id/detail', authMiddleware, requireRole('admin','super_admin'), userController.detail);
router.put('/:id', authMiddleware, requireRole('admin','super_admin'), validate(adminUpdateUserSchema), userController.update);
router.delete('/:id', authMiddleware, requireRole('admin','super_admin'), userController.delete);
router.post('/:id/verify', authMiddleware, requireRole('admin','super_admin'), userController.verify);
router.post('/:id/deactivate', authMiddleware, requireRole('admin','super_admin'), userController.deactivate);
router.post('/:id/reset-password', authMiddleware, requireRole('admin','super_admin'), userController.resetPassword);
router.post('/change-password', authMiddleware, validate(changePasswordSchema), userController.changePassword);
router.post('/:id/notify', authMiddleware, requireRole('admin'), userController.sendNotification);

// =========== PROFILE (self) ===========
router.get('/profile/me', authMiddleware, userController.getProfile);
router.put('/profile/me', authMiddleware, validate(updateProfileSchema), userController.updateProfile);
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), checkUploadSize, userController.uploadAvatar);
router.delete('/profile/avatar', authMiddleware, userController.deleteAvatar);

// =========== TAMBAHAN BARU (HISTORY, TRANSAKSI, NOTIF) ===========
router.get('/history', authMiddleware, submissionController.userHistory);
router.get('/history/:id', authMiddleware, submissionController.userHistoryDetail);
router.get('/transactions', authMiddleware, transactionController.userList);
router.get('/transactions/:id', authMiddleware, transactionController.userDetail);
router.get('/notifications', authMiddleware, notificationController.userList);

module.exports = router;