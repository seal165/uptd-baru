/**
 * Konfigurasi Multer untuk handle upload file di frontend.
 * File disimpan sementara di public/uploads/ lalu di-stream ke backend.
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('./env');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'public/uploads/';
        if (file.fieldname === 'surat_permohonan') uploadPath += 'surat';
        else if (file.fieldname === 'scan_ktp') uploadPath += 'ktp';
        else if (file.fieldname === 'payment_proof') uploadPath += 'payment';
        else if (file.fieldname === 'lampiran_pendukung') uploadPath += 'others';
        else uploadPath += 'others';

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const sanitizedName = file.fieldname.replace(/[^a-z0-9]/gi, '_');
        cb(null, sanitizedName + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('File harus berupa gambar (JPG/PNG/GIF) atau PDF'));
};

module.exports = multer({
    storage,
    limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
    fileFilter
});
