const Joi = require('joi');

const SKRD_STATUS = [
    'Belum Bayar',
    'Menunggu Verifikasi Pembayaran',
    'Lunas',
    'Ditolak',
    'Dibatalkan'
];

exports.createSchema = Joi.object({
    submission_id: Joi.number().integer().required(),
    nominal: Joi.number().positive().required(),
    keterangan: Joi.string().max(500).allow('', null),
    due_date: Joi.date().allow(null, '')
});

exports.updateStatusSchema = Joi.object({
    status: Joi.string().valid(...SKRD_STATUS).required(),
    catatan: Joi.string().max(500).allow('', null)
});

exports.SKRD_STATUS = SKRD_STATUS;
