/**
 * Helper untuk format response API yang konsisten.
 * Semua endpoint sebaiknya pakai helper ini.
 */

exports.success = (res, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
};

exports.error = (res, statusCode, message, errors = null) => {
    return res.status(statusCode).json({ success: false, message, errors });
};

exports.paginated = (res, message, data, pagination, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data, pagination });
};
