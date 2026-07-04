/**
 * Mount semua route domain di sini.
 */
const express = require('express');
const router = express.Router();

console.log('📌 [INDEX] Starting route registration...');

// Route baru (clean RESTful)
router.use('/auth', require('./authRoute'));
console.log('📌 /auth mounted');

router.use('/public', require('./publicRoute'));
console.log('📌 /public mounted');

router.use('/user', require('./userRoute'));
console.log('📌 /user mounted');

// 🔥 PASTIKAN INI ADA DAN TIDAK ERROR
router.use('/users', require('./userRoute'));
console.log('📌 /users mounted');

router.use('/submissions', require('./submissionRoute'));
console.log('📌 /submissions mounted');

router.use('/skrd', require('./skrdRoute'));
console.log('📌 /skrd mounted');

router.use('/kuisioner', require('./kuisionerRoute'));
console.log('📌 /kuisioner mounted');

router.use('/notifications', require('./notificationRoute'));
console.log('📌 /notifications mounted');

router.use('/settings', require('./settingRoute'));
console.log('📌 /settings mounted');

router.use('/reports', require('./reportRoute'));
console.log('📌 /reports mounted');

router.use('/transactions', require('./transactionRoute'));
console.log('📌 /transactions mounted');

router.use('/files', require('./fileRoute'));
console.log('📌 /files mounted');

router.use('/dashboard', require('./dashboardRoute'));
console.log('📌 /dashboard mounted');

console.log('📌 [INDEX] All routes mounted successfully');

module.exports = router;