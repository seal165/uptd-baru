const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Semua endpoint di sini TIDAK butuh auth
router.get('/services', publicController.getServices);
router.get('/services/:id', publicController.getServiceById);
router.get('/jadwal-sibuk', publicController.getJadwalSibuk);
router.get('/busy-schedule', publicController.getPublicBusySchedule);

module.exports = router;
