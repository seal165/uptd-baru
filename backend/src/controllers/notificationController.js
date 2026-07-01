/**
 * Controller untuk notifikasi (admin + user).
 */
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');
const { success, error } = require('../utils/responseHelper');

exports.adminList = async (req, res, next) => {
    try {
        const data = await notificationModel.listAdmin(req.query);
        return success(res, 'Notifikasi admin', data);
    } catch (err) { next(err); }
};

exports.markAllAdminRead = async (req, res, next) => {
    try {
        const affected = await notificationModel.markAllAdminRead();
        return success(res, 'Semua notifikasi ditandai dibaca', { affected });
    } catch (err) { next(err); }
};

exports.userList = async (req, res, next) => {
    try {
        const data = await notificationModel.listUser(req.user.id, req.query);
        return success(res, 'Notifikasi user', data);
    } catch (err) { next(err); }
};

exports.unreadCount = async (req, res, next) => {
    try {
        const total = await notificationModel.countUnreadUser(req.user.id);
        return success(res, 'Jumlah notifikasi belum dibaca', { unread: total });
    } catch (err) { next(err); }
};

exports.getSettings = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) return error(res, 404, 'User tidak ditemukan');
        return success(res, 'Pengaturan notifikasi', {
            notif_email: !!user.notif_email,
            notif_wa: !!user.notif_wa
        });
    } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
    try {
        const { notif_email, notif_wa } = req.body;
        await userModel.updateProfile(req.user.id, {
            notif_email: notif_email ? 1 : 0,
            notif_wa: notif_wa ? 1 : 0
        });
        return success(res, 'Pengaturan notifikasi diupdate');
    } catch (err) { next(err); }
};
