/**
 * Controller untuk submission (pengajuan pengujian).
 */
const submissionModel = require('../models/submissionModel');
const notificationModel = require('../models/notificationModel');
const { success, error, paginated } = require('../utils/responseHelper');

exports.list = async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const data = await submissionModel.list({ status, search, limit, offset });
        const total = await submissionModel.count({ status });
        return paginated(res, 'Daftar submission', data, {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            total,
            totalPages: Math.ceil(total / parseInt(limit, 10))
        });
    } catch (err) {
        next(err);
    }
};

exports.detail = async (req, res, next) => {
    try {
        const data = await submissionModel.findById(req.params.id);
        if (!data) return error(res, 404, 'Submission tidak ditemukan');
        return success(res, 'Detail submission', data);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const payload = {
            ...req.body,
            user_id: req.user.id,
            file_surat_permohonan: req.files?.surat_permohonan?.[0]?.filename || null,
            file_ktp: req.files?.scan_ktp?.[0]?.filename || null,
            dokumen_tambahan: req.files?.lampiran_pendukung?.[0]?.filename || null
        };
        const id = await submissionModel.create(payload);

        // Notifikasi admin
        await notificationModel.createAdmin({
            title: 'Pengajuan Baru',
            message: `${payload.nama_pemohon} mengajukan ${payload.nama_proyek}`,
            type: 'submission',
            related_id: id
        });

        return success(res, 'Submission berhasil dibuat', { id }, 201);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const existing = await submissionModel.findById(req.params.id);
        if (!existing) return error(res, 404, 'Submission tidak ditemukan');

        const affected = await submissionModel.update(req.params.id, req.body);
        if (!affected) return error(res, 400, 'Tidak ada data yang diupdate');

        // Notifikasi user kalau status berubah
        if (req.body.status && req.body.status !== existing.status) {
            await notificationModel.createUser({
                user_id: existing.user_id,
                title: 'Status Pengajuan Berubah',
                message: `Pengajuan ${existing.nama_proyek} sekarang: ${req.body.status}`,
                type: 'submission_status',
                related_id: existing.id
            });
        }

        return success(res, 'Submission berhasil diupdate');
    } catch (err) {
        next(err);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        const existing = await submissionModel.findById(req.params.id);
        if (!existing) return error(res, 404, 'Submission tidak ditemukan');

        // User pelanggan hanya boleh cancel submission miliknya
        if (req.user.role === 'pelanggan' && existing.user_id !== req.user.id) {
            return error(res, 403, 'Akses ditolak');
        }

        await submissionModel.cancel(req.params.id);
        return success(res, 'Submission dibatalkan');
    } catch (err) {
        next(err);
    }
};

exports.getDocuments = async (req, res, next) => {
    try {
        const data = await submissionModel.findById(req.params.id);
        if (!data) return error(res, 404, 'Submission tidak ditemukan');
        return success(res, 'Dokumen submission', {
            file_surat_permohonan: data.file_surat_permohonan,
            file_ktp: data.file_ktp,
            dokumen_tambahan: data.dokumen_tambahan
        });
    } catch (err) {
        next(err);
    }
};

exports.userHistory = async (req, res, next) => {
    try {
        const { status, limit = 20, offset = 0 } = req.query;
        const data = await submissionModel.findByUserId(req.user.id, {
            status,
            limit,
            offset
        });
        return success(res, 'Riwayat pengajuan', data);
    } catch (err) {
        next(err);
    }
};

exports.userHistoryDetail = async (req, res, next) => {
    try {
        const data = await submissionModel.findById(req.params.id);
        if (!data) return error(res, 404, 'Submission tidak ditemukan');
        if (data.user_id !== req.user.id && req.user.role === 'pelanggan') {
            return error(res, 403, 'Akses ditolak');
        }
        return success(res, 'Detail pengajuan', data);
    } catch (err) {
        next(err);
    }
};

exports.userDashboard = async (req, res, next) => {
    try {
        const recent = await submissionModel.findByUserId(req.user.id, { limit: 5 });
        const stats = await submissionModel.countByStatus();
        return success(res, 'Dashboard user', {
            recent_submissions: recent,
            stats
        });
    } catch (err) {
        next(err);
    }
};
