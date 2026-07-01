/**
 * Model untuk tabel `activities` (audit log).
 */
const db = require('../config/database');
const logger = require('../utils/logger');

exports.log = async ({ user_id, activity_name, ip_address, user_agent }) => {
    try {
        await db.query(
            `INSERT INTO activities (user_id, activity_name, ip_address, user_agent, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [user_id, activity_name, ip_address || '-', user_agent || '-']
        );
    } catch (err) {
        // Activity log gagal tidak boleh ganggu flow utama
        logger.warn('Activity log failed: ' + err.message);
    }
};

exports.list = async ({ user_id, limit = 50, offset = 0 } = {}) => {
    const params = [];
    let sql = `SELECT a.*, u.email, u.full_name 
               FROM activities a 
               LEFT JOIN users u ON u.id = a.user_id 
               WHERE 1=1`;
    if (user_id) {
        sql += ' AND a.user_id = ?';
        params.push(user_id);
    }
    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));
    const [rows] = await db.query(sql, params);
    return rows;
};
