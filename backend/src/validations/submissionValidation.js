const Joi = require('joi');

const SUBMISSION_STATUS = [
    'Menunggu Verifikasi',
    'Pengecekan Sampel',
    'Belum Bayar',
    'Menunggu SKRD Upload',
    'Belum Lunas',
    'Lunas',
    'Sedang Diuji',
    'Selesai',
    'Dibatalkan'
];

exports.createSchema = Joi.object({
    no_permohonan: Joi.string().max(100).allow('', null),
    nama_pemohon: Joi.string().max(255).required(),
    nama_instansi: Joi.string().max(255).allow('', null),
    alamat_pemohon: Joi.string().max(500).allow('', null),
    nomor_telepon: Joi.string().max(20).allow('', null),
    email_pemohon: Joi.string().email().max(100).allow('', null),
    nama_proyek: Joi.string().max(255).required(),
    lokasi_proyek: Joi.string().max(255).allow('', null),
    catatan_tambahan: Joi.string().max(250).allow('', null),
    dokumen_tambahan: Joi.string().allow('', null)
});

exports.updateSchema = Joi.object({
    status: Joi.string().valid(...SUBMISSION_STATUS),
    catatan_admin: Joi.string().max(1000).allow('', null),
    jadwal_sampling: Joi.date().allow(null, ''),
    no_permohonan: Joi.string().max(100).allow('', null),
    nama_pemohon: Joi.string().max(255),
    nama_proyek: Joi.string().max(255),
    lokasi_proyek: Joi.string().max(255).allow('', null),
    alamat_pemohon: Joi.string().max(500).allow('', null),
    nomor_telepon: Joi.string().max(20).allow('', null),
    email_pemohon: Joi.string().email().max(100).allow('', null),
    catatan_tambahan: Joi.string().max(250).allow('', null)
}).min(1);

exports.SUBMISSION_STATUS = SUBMISSION_STATUS;
