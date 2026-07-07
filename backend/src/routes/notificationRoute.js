const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Admin
router.get('/admin', authMiddleware, requireRole('admin', 'super_admin'), notificationController.adminList);
router.put('/admin/mark-all-read', authMiddleware, requireRole('admin', 'super_admin'), notificationController.markAllAdminRead);

// User
router.get('/user', authMiddleware, notificationController.userList);
router.get('/user/count', authMiddleware, notificationController.unreadCount);
router.get('/user/settings', authMiddleware, notificationController.getSettings);
router.put('/user/settings', authMiddleware, notificationController.updateSettings);

module.exports = router;
