const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');

// Akses file dengan auth + ownership check
// URL: /api/files/:fileType/:filename
router.get('/:fileType/:filename', authMiddleware, fileController.getFile);

module.exports = router;
