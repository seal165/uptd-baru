/**
 * Controller untuk dashboard admin (statistik agregat).
 */
const submissionModel = require('../models/submissionModel');
const userModel = require('../models/userModel');
const kuisionerModel = require('../models/kuisionerModel');
const notificationModel = require('../models/notificationModel');
const { success } = require('../utils/responseHelper');

exports.adminStats = async (req, res, next) => {
    try {
        const [submissionStats, totalUsers, totalPelanggan, kuisStats] = await Promise.all([
            submissionModel.countByStatus(),
            userModel.count(),
            userModel.count({ role: 'pelanggan' }),
            kuisionerModel.stats()
        ]);

        return success(res, 'Statistik dashboard', {
            submissions_by_status: submissionStats,
            total_users: totalUsers,
            total_pelanggan: totalPelanggan,
            kuisioner: kuisStats
        });
    } catch (err) {
        next(err);
    }
};

exports.getData = async (req, res, next) => {
    try {
        const [submissionStats, recentNotifs] = await Promise.all([
            submissionModel.countByStatus(),
            notificationModel.listAdmin({ limit: 5 })
        ]);
        return success(res, 'Dashboard data', {
            submissions_by_status: submissionStats,
            recent_notifications: recentNotifs
        });
    } catch (err) {
        next(err);
    }
};
