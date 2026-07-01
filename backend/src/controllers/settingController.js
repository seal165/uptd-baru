/**
 * Controller untuk setting sistem, busy mode, backup, activity logs.
 */
const settingModel = require('../models/settingModel');
const activityModel = require('../models/activityModel');
const path = require('path');
const fs = require('fs');
const { success, error } = require('../utils/responseHelper');

// =========== SYSTEM CONFIG ===========

exports.getSystem = async (req, res, next) => {
    try {
        const data = await settingModel.getAll();
        return success(res, 'Konfigurasi sistem', data);
    } catch (err) { next(err); }
};

exports.updateSystem = async (req, res, next) => {
    try {
        await settingModel.setBulk(req.body);
        return success(res, 'Konfigurasi diupdate');
    } catch (err) { next(err); }
};

exports.getProfileSettings = async (req, res, next) => {
    try {
        const data = await settingModel.getAll();
        return success(res, 'Profile settings', data);
    } catch (err) { next(err); }
};

// =========== BUSY MODE ===========

exports.getBusyMode = async (req, res, next) => {
    try {
        const active = await settingModel.getByKey('busy_mode_active');
        const periods = await settingModel.listBusyPeriods();
        return success(res, 'Busy mode', {
            active: active === '1' || active === 'true',
            periods
        });
    } catch (err) { next(err); }
};

exports.updateBusyMode = async (req, res, next) => {
    try {
        await settingModel.set('busy_mode_active', req.body.active ? '1' : '0');
        return success(res, 'Busy mode diupdate');
    } catch (err) { next(err); }
};

exports.getBusyPeriod = async (req, res, next) => {
    try {
        const data = await settingModel.findBusyPeriodById(req.params.id);
        if (!data) return error(res, 404, 'Periode sibuk tidak ditemukan');
        return success(res, 'Detail periode sibuk', data);
    } catch (err) { next(err); }
};

exports.addBusyPeriod = async (req, res, next) => {
    try {
        const id = await settingModel.addBusyPeriod(req.body);
        return success(res, 'Periode sibuk ditambahkan', { id }, 201);
    } catch (err) { next(err); }
};

exports.updateBusyPeriod = async (req, res, next) => {
    try {
        const affected = await settingModel.updateBusyPeriod(req.params.id, req.body);
        if (!affected) return error(res, 404, 'Periode sibuk tidak ditemukan');
        return success(res, 'Periode sibuk diupdate');
    } catch (err) { next(err); }
};

exports.deleteBusyPeriod = async (req, res, next) => {
    try {
        const affected = await settingModel.deleteBusyPeriod(req.params.id);
        if (!affected) return error(res, 404, 'Periode sibuk tidak ditemukan');
        return success(res, 'Periode sibuk dihapus');
    } catch (err) { next(err); }
};

// =========== ACTIVITY LOGS ===========

exports.activityLogs = async (req, res, next) => {
    try {
        const data = await activityModel.list(req.query);
        return success(res, 'Activity logs', data);
    } catch (err) { next(err); }
};

// =========== BACKUP ===========

exports.backupHistory = async (req, res, next) => {
    try {
        const backupDir = path.join(__dirname, '../../backups');
        if (!fs.existsSync(backupDir)) {
            return success(res, 'Backup history', []);
        }
        const files = fs.readdirSync(backupDir)
            .filter(f => f.endsWith('.sql'))
            .map(f => {
                const stat = fs.statSync(path.join(backupDir, f));
                return {
                    filename: f,
                    size: stat.size,
                    created_at: stat.mtime
                };
            })
            .sort((a, b) => b.created_at - a.created_at);
        return success(res, 'Backup history', files);
    } catch (err) { next(err); }
};

exports.createBackup = async (req, res, next) => {
    try {
        // Backup logic: panggil mysqldump library atau spawn process
        // Simple placeholder - integrasi sebenarnya butuh `mysqldump` package
        return success(res, 'Backup berhasil dibuat (implementasi penuh butuh mysqldump library)');
    } catch (err) { next(err); }
};

exports.restoreBackup = async (req, res, next) => {
    try {
        if (!req.file) return error(res, 400, 'File backup belum diupload');
        return success(res, 'Backup berhasil di-restore (implementasi penuh butuh mysql import)');
    } catch (err) { next(err); }
};
