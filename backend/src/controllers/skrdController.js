/**
 * Controller untuk SKRD (Surat Ketetapan Retribusi Daerah / invoice).
 */
const paymentModel = require('../models/paymentModel');
const submissionModel = require('../models/submissionModel');
const notificationModel = require('../models/notificationModel');
const path = require('path');
const fs = require('fs');
const { success, error } = require('../utils/responseHelper');

exports.list = async (req, res, next) => {
    try {
        const { status, limit, offset } = req.query;
        const data = await paymentModel.list({ status, limit, offset });
        return success(res, 'Daftar SKRD', data);
    } catch (err) {
        next(err);
    }
};

exports.detail = async (req, res, next) => {
    try {
        const data = await paymentModel.findById(req.params.id);
        if (!data) return error(res, 404, 'SKRD tidak ditemukan');
        return success(res, 'Detail SKRD', data);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const id = await paymentModel.create(req.body);
        const submission = await submissionModel.findById(req.body.submission_id);
        if (submission) {
            await submissionModel.updateStatus(submission.id, 'Belum Bayar');
            await notificationModel.createUser({
                user_id: submission.user_id,
                title: 'SKRD Telah Terbit',
                message: `Tagihan untuk ${submission.nama_proyek} sudah terbit. Silakan lakukan pembayaran.`,
                type: 'skrd',
                related_id: id
            });
        }
        return success(res, 'SKRD berhasil dibuat', { id }, 201);
    } catch (err) {
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { status, catatan } = req.body;
        const affected = await paymentModel.updateStatus(req.params.id, status, catatan);
        if (!affected) return error(res, 404, 'SKRD tidak ditemukan');
        return success(res, 'Status SKRD diupdate');
    } catch (err) {
        next(err);
    }
};

exports.uploadFile = async (req, res, next) => {
    try {
        if (!req.file) return error(res, 400, 'File SKRD belum diupload');
        const affected = await paymentModel.update(req.params.id, {
            file_skrd: req.file.filename
        });
        if (!affected) return error(res, 404, 'SKRD tidak ditemukan');
        return success(res, 'File SKRD diupload', { filename: req.file.filename });
    } catch (err) {
        next(err);
    }
};

exports.downloadFile = async (req, res, next) => {
    try {
        const payment = await paymentModel.findById(req.params.id);
        if (!payment || !payment.file_skrd) {
            return error(res, 404, 'File SKRD tidak ditemukan');
        }
        const filePath = path.join(__dirname, '../../uploads/laporan', payment.file_skrd);
        if (!fs.existsSync(filePath)) {
            return error(res, 404, 'File fisik tidak ditemukan');
        }
        res.download(filePath);
    } catch (err) {
        next(err);
    }
};

exports.uploadPaymentProof = async (req, res, next) => {
    try {
        if (!req.file) return error(res, 400, 'File bukti bayar belum diupload');
        const affected = await paymentModel.update(req.params.id, {
            file_payment_proof: req.file.filename,
            status: 'Menunggu Verifikasi Pembayaran'
        });
        if (!affected) return error(res, 404, 'SKRD tidak ditemukan');

        const payment = await paymentModel.findById(req.params.id);
        await notificationModel.createAdmin({
            title: 'Bukti Pembayaran Diupload',
            message: `${payment.nama_pemohon} mengupload bukti pembayaran`,
            type: 'payment',
            related_id: payment.id
        });

        return success(res, 'Bukti pembayaran diupload, menunggu verifikasi');
    } catch (err) {
        next(err);
    }
};

exports.verifyPayment = async (req, res, next) => {
    try {
        const payment = await paymentModel.findById(req.params.id);
        if (!payment) return error(res, 404, 'SKRD tidak ditemukan');

        await paymentModel.updateStatus(req.params.id, 'Lunas');
        await submissionModel.updateStatus(payment.submission_id, 'Lunas');

        await notificationModel.createUser({
            user_id: payment.user_id,
            title: 'Pembayaran Diverifikasi',
            message: `Pembayaran untuk ${payment.nama_proyek} sudah dikonfirmasi`,
            type: 'payment_verified',
            related_id: payment.id
        });

        return success(res, 'Pembayaran terverifikasi');
    } catch (err) {
        next(err);
    }
};

exports.rejectProof = async (req, res, next) => {
    try {
        const { catatan } = req.body;
        const payment = await paymentModel.findById(req.params.id);
        if (!payment) return error(res, 404, 'SKRD tidak ditemukan');

        await paymentModel.updateStatus(req.params.id, 'Belum Bayar', catatan);

        await notificationModel.createUser({
            user_id: payment.user_id,
            title: 'Bukti Pembayaran Ditolak',
            message: `Bukti pembayaran ditolak: ${catatan || 'Mohon upload ulang'}`,
            type: 'payment_rejected',
            related_id: payment.id
        });

        return success(res, 'Bukti pembayaran ditolak');
    } catch (err) {
        next(err);
    }
};

exports.sendReminder = async (req, res, next) => {
    try {
        const payment = await paymentModel.findById(req.params.id);
        if (!payment) return error(res, 404, 'SKRD tidak ditemukan');

        await notificationModel.createUser({
            user_id: payment.user_id,
            title: 'Pengingat Pembayaran',
            message: `Mohon segera selesaikan pembayaran untuk ${payment.nama_proyek}`,
            type: 'payment_reminder',
            related_id: payment.id
        });

        return success(res, 'Reminder terkirim');
    } catch (err) {
        next(err);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        const affected = await paymentModel.cancel(req.params.id);
        if (!affected) return error(res, 404, 'SKRD tidak ditemukan');
        return success(res, 'SKRD dibatalkan');
    } catch (err) {
        next(err);
    }
};
