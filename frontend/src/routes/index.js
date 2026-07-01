/**
 * Mount semua route domain.
 */
const express = require('express');
const router = express.Router();

router.use('/', require('./publicRoute'));
router.use('/', require('./authRoute'));
router.use('/user', require('./userRoute'));
router.use('/admin', require('./adminRoute'));

module.exports = router;
