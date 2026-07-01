const fs = require('fs');
const logger = require('../utils/logger');

/**
 * Validasi ukuran file upload terhadap config max_upload_size di settings.
 * Kalau melebihi, hapus file & return error.
 */
module.exports = (req, res, next) => {
    const maxSizeMB = parseFloat(req.settings?.max_upload_size) || 5;
    const maxSize = maxSizeMB * 1024 * 1024;
    let exceeded = false;
    const filesToDelete = [];

    if (req.file) {
        if (req.file.size > maxSize) exceeded = true;
        filesToDelete.push(req.file.path);
    } else if (req.files) {
        Object.keys(req.files).forEach((fieldname) => {
            req.files[fieldname].forEach((file) => {
                if (file.size > maxSize) exceeded = true;
                filesToDelete.push(file.path);
            });
        });
    }

    if (exceeded) {
        filesToDelete.forEach((filepath) => {
            try {
                if (filepath && fs.existsSync(filepath)) fs.unlinkSync(filepath);
            } catch (err) {
                logger.warn('Failed to delete oversized file: ' + filepath);
            }
        });
        return res.status(400).json({
            success: false,
            message: `Ukuran file melebihi batas maksimal (${maxSizeMB}MB)`
        });
    }

    next();
};
