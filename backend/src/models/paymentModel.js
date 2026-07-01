/**
 * Model untuk tabel `payments` (SKRD = Surat Ketetapan Retribusi Daerah / invoice).
 */
const db = require('../config/database');

exports.list = async ({ status, limit = 20, offset = 0 } = {}) => {
    const params = [];
    let sql = `SELECT p.id, p.submission_id, p.total_tagihan AS nominal, p.keterangan, p.due_date, p.status, p.catatan, p.file_skrd, p.file_payment_proof, p.created_at, p.updated_at, s.nama_pemohon, s.nama_proyek, s.no_permohonan
               FROM payments p
               LEFT JOIN submissions s ON s.id = p.submission_id
               WHERE 1=1`;
    if (status) {
        sql += ' AND p.status = ?';
        params.push(status);
    }
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));
    const [rows] = await db.query(sql, params);
    return rows;
};

exports.findById = async (id) => {
    const [rows] = await db.query(
        `SELECT p.id, p.submission_id, p.total_tagihan AS nominal, p.keterangan, p.due_date, p.status, p.catatan, p.file_skrd, p.file_payment_proof, p.created_at, p.updated_at, s.nama_pemohon, s.nama_proyek, s.no_permohonan, s.user_id
         FROM payments p
         LEFT JOIN submissions s ON s.id = p.submission_id
         WHERE p.id = ? LIMIT 1`,
        [id]
    );
    return rows[0] || null;
};

exports.findBySubmissionId = async (submissionId) => {
    const [rows] = await db.query(
        'SELECT id, submission_id, total_tagihan AS nominal, keterangan, due_date, status, catatan, file_skrd, file_payment_proof, created_at, updated_at FROM payments WHERE submission_id = ? ORDER BY created_at DESC',
        [submissionId]
    );
    return rows;
};

exports.findByUserId = async (userId, { limit = 20, offset = 0 } = {}) => {
    const [rows] = await db.query(
        `SELECT p.id, p.submission_id, p.total_tagihan AS nominal, p.keterangan, p.due_date, p.status, p.catatan, p.file_skrd, p.file_payment_proof, p.created_at, p.updated_at, s.nama_pemohon, s.nama_proyek, s.no_permohonan
         FROM payments p
         INNER JOIN submissions s ON s.id = p.submission_id
         WHERE s.user_id = ?
         ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        [userId, parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
};

exports.create = async (data) => {
    const [result] = await db.query(
        `INSERT INTO payments 
        (submission_id, total_tagihan, keterangan, due_date, status, created_at)
        VALUES (?, ?, ?, ?, 'Belum Bayar', NOW())`,
        [data.submission_id, data.nominal, data.keterangan || null, data.due_date || null]
    );
    return result.insertId;
};

exports.updateStatus = async (id, status, catatan = null) => {
    const [result] = await db.query(
        'UPDATE payments SET status = ?, catatan = COALESCE(?, catatan), updated_at = NOW() WHERE id = ?',
        [status, catatan, id]
    );
    return result.affectedRows;
};

exports.update = async (id, data) => {
    // Memetakan input nominal dari frontend kembali menjadi total_tagihan untuk database
    if (data.nominal !== undefined) {
        data.total_tagihan = data.nominal;
    }
    
    const allowed = ['total_tagihan', 'keterangan', 'due_date', 'status', 'catatan',
        'file_skrd', 'file_payment_proof'];
    const fields = [];
    const values = [];
    for (const key of allowed) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }
    if (!fields.length) return 0;
    values.push(id);
    const [result] = await db.query(
        `UPDATE payments SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
    );
    return result.affectedRows;
};

exports.cancel = async (id) => {
    const [result] = await db.query(
        "UPDATE payments SET status = 'Dibatalkan', updated_at = NOW() WHERE id = ?",
        [id]
    );
    return result.affectedRows;
};