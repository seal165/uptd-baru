/**
 * Model untuk tabel `notifications` (admin) & `user_notifications` (per-user).
 */
const db = require('../config/database');

// =========== ADMIN NOTIFICATIONS ===========

exports.listAdmin = async ({ limit = 50, offset = 0 } = {}) => {
    const [rows] = await db.query(
        'SELECT * FROM notifications ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
};

exports.createAdmin = async ({ title, message, type = 'info', related_id = null }) => {
    const [result] = await db.query(
        `INSERT INTO notifications (title, message, type, related_id, is_read, created_at)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [title, message, type, related_id]
    );
    return result.insertId;
};

exports.markAllAdminRead = async () => {
    const [result] = await db.query('UPDATE notifications SET is_read = 1 WHERE is_read = 0');
    return result.affectedRows;
};

// =========== USER NOTIFICATIONS ===========

exports.listUser = async (userId, { limit = 50, offset = 0 } = {}) => {
    const [rows] = await db.query(
        `SELECT * FROM user_notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [userId, parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
};

exports.countUnreadUser = async (userId) => {
    const [rows] = await db.query(
        'SELECT COUNT(*) AS total FROM user_notifications WHERE user_id = ? AND is_read = 0',
        [userId]
    );
    return rows[0].total;
};

exports.createUser = async ({ user_id, title, message, type = 'info', related_id = null }) => {
    const [result] = await db.query(
        `INSERT INTO user_notifications (user_id, title, message, type, related_id, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, 0, NOW())`,
        [user_id, title, message, type, related_id]
    );
    return result.insertId;
};

exports.markUserRead = async (id, userId) => {
    const [result] = await db.query(
        'UPDATE user_notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [id, userId]
    );
    return result.affectedRows;
};
