/**
 * Controller untuk akses file dengan auth + ownership check.
 * GANTI static express.static yang tanpa auth.
 */
const path = require('path');
const fs = require('fs');
const submissionModel = require('../models/submissionModel');
const userModel = require('../models/userModel');
const { error } = require('../utils/responseHelper');

const ALLOWED_TYPES = ['surat', 'ktp', 'payment', 'laporan', 'avatar', 'skrd', 'others'];

exports.getFile = async (req, res, next) => {
    try {
        const { fileType, filename } = req.params;

        // Whitelist tipe folder
        if (!ALLOWED_TYPES.includes(fileType)) {
            return error(res, 400, 'Tipe file tidak valid');
        }

        // Cegah path traversal
        if (
            filename.includes('..') ||
            filename.includes('/') ||
            filename.includes('\\')
        ) {
            return error(res, 400, 'Nama file tidak valid');
        }

        // Cek ownership untuk pelanggan
        if (req.user.role === 'pelanggan') {
            const allowed = await checkOwnership(req.user.id, fileType, filename);
            if (!allowed) return error(res, 403, 'Akses ditolak');
        }

        const filePath = path.join(__dirname, '../../uploads', fileType, filename);
        if (!fs.existsSync(filePath)) {
            return error(res, 404, 'File tidak ditemukan');
        }
        res.sendFile(filePath);
    } catch (err) {
        next(err);
    }
};

async function checkOwnership(userId, fileType, filename) {
    if (fileType === 'avatar') {
        const user = await userModel.findById(userId);
        return user?.avatar?.includes(filename);
    }
    // Untuk surat, ktp, payment, laporan, skrd, others — cek di submissions
    return await submissionModel.userOwnsFile(userId, filename);
}
