const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/user', authMiddleware, transactionController.userList);
router.get('/user/:id', authMiddleware, transactionController.userDetail);

module.exports = router;
