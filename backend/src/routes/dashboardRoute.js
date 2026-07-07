const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get(
    '/admin/stats',
    authMiddleware,
    requireRole('admin', 'super_admin'),
    dashboardController.adminStats
);

router.get(
    '/complete',
    authMiddleware,
    requireRole('admin', 'super_admin'),
    dashboardController.getData
);

module.exports = router;
