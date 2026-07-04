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

    // 🔥 Tambahkan laporan
    if (fileType === 'laporan') {
        const db = require('../config/database');
        const [rows] = await db.query(
            `SELECT tr.id 
             FROM test_reports tr
             JOIN submissions s ON s.id = tr.submission_id
             WHERE s.user_id = ? AND tr.file_laporan = ?
             LIMIT 1`,
            [userId, filename]
        );
        return rows.length > 0;
    }

    // Untuk SKRD
    if (fileType === 'skrd') {
        const db = require('../config/database');
        const [rows] = await db.query(
            `SELECT p.id 
             FROM payments p
             JOIN submissions s ON s.id = p.submission_id
             WHERE s.user_id = ? AND p.skrd_file = ?
             LIMIT 1`,
            [userId, filename]
        );
        return rows.length > 0;
    }

    // Untuk payment (bukti pembayaran)
    if (fileType === 'payment') {
        const db = require('../config/database');
        const [rows] = await db.query(
            `SELECT p.id 
             FROM payments p
             JOIN submissions s ON s.id = p.submission_id
             WHERE s.user_id = ? AND (p.bukti_pembayaran_1 = ? OR p.bukti_pembayaran_2 = ?)
             LIMIT 1`,
            [userId, filename, filename]
        );
        return rows.length > 0;
    }

    // Untuk surat, ktp, others — cek di submissions (melalui submissionModel.userOwnsFile)
    return await submissionModel.userOwnsFile(userId, filename);
}
