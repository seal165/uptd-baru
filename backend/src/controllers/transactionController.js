/**
 * Controller untuk transaksi user (kombinasi submission + payment).
 */
const paymentModel = require('../models/paymentModel');
const { success, error } = require('../utils/responseHelper');

exports.userList = async (req, res, next) => {
    try {
        const data = await paymentModel.findByUserId(req.user.id, req.query);
        return success(res, 'Riwayat transaksi', data);
    } catch (err) { next(err); }
};

exports.userDetail = async (req, res, next) => {
    try {
        const data = await paymentModel.findById(req.params.id);
        if (!data) return error(res, 404, 'Transaksi tidak ditemukan');
        if (data.user_id !== req.user.id && req.user.role === 'pelanggan') {
            return error(res, 403, 'Akses ditolak');
        }
        return success(res, 'Detail transaksi', data);
    } catch (err) { next(err); }
};
