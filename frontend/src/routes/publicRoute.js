/**
 * Route untuk halaman PUBLIK (tidak butuh login).
 */
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.landing);
router.get('/services', publicController.services);
router.get('/estimasi', publicController.estimasi);
router.get('/profile', publicController.profile);
router.get('/tentang', publicController.profile); // alias
router.get('/kontak', publicController.profile); // alias
router.get('/faq', publicController.faq);
router.get('/maintenance', publicController.maintenance);
router.get('/track/:no_urut', publicController.trackPage);
router.get('/kuisioner/:submissionId', publicController.kuisionerPublic);

module.exports = router;
