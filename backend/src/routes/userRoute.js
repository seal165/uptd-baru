const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const upload = require('../config/multer');
const checkUploadSize = require('../middlewares/checkUploadSize');
const {
    updateProfileSchema,
    adminUpdateUserSchema
} = require('../validations/userValidation');

// =========== ADMIN MANAGE USER ===========
router.get('/', authMiddleware, requireRole('admin'), userController.list);
router.get('/:id/detail', authMiddleware, requireRole('admin'), userController.detail);
router.put(
    '/:id',
    authMiddleware,
    requireRole('admin'),
    validate(adminUpdateUserSchema),
    userController.update
);
router.delete('/:id', authMiddleware, requireRole('admin'), userController.delete);
router.post('/:id/verify', authMiddleware, requireRole('admin'), userController.verify);
router.post('/:id/deactivate', authMiddleware, requireRole('admin'), userController.deactivate);
router.post('/:id/reset-password', authMiddleware, requireRole('admin'), userController.resetPassword);
router.post('/:id/notify', authMiddleware, requireRole('admin'), userController.sendNotification);

// =========== PROFILE (self) ===========
router.get('/profile/me', authMiddleware, userController.getProfile);
router.put(
    '/profile/me',
    authMiddleware,
    validate(updateProfileSchema),
    userController.updateProfile
);
router.post(
    '/profile/avatar',
    authMiddleware,
    upload.single('avatar'),
    checkUploadSize,
    userController.uploadAvatar
);
router.delete('/profile/avatar', authMiddleware, userController.deleteAvatar);

module.exports = router;
