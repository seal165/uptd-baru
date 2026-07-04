/**
 * Model untuk tabel `test_reports` (hasil laporan pengujian).
 */
const db = require('../config/database');

exports.list = async ({ limit = 20, offset = 0 } = {}) => {
    const [rows] = await db.query(
        `SELECT tr.*, s.nama_pemohon, s.nama_instansi, s.nama_proyek, s.no_permohonan
         FROM test_reports tr
         LEFT JOIN submissions s ON s.id = tr.submission_id
         ORDER BY tr.created_at DESC LIMIT ? OFFSET ?`,
        [parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
};

exports.findById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM test_reports WHERE id = ? LIMIT 1',
        [id]
    );
    return rows[0] || null;
};

exports.findBySubmissionId = async (submissionId) => {
    const [rows] = await db.query(
        'SELECT * FROM test_reports WHERE submission_id = ? ORDER BY created_at DESC',
        [submissionId]
    );
    return rows;
};

exports.create = async (data) => {
    const [result] = await db.query(
        `INSERT INTO test_reports (submission_id, file_laporan, no_laporan, catatan_laporan, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [data.submission_id, data.file_laporan, data.no_laporan || null, data.catatan_laporan || null]
    );
    return result.insertId;
};

exports.delete = async (id) => {
    const [result] = await db.query('DELETE FROM test_reports WHERE id = ?', [id]);
    return result.affectedRows;
};

exports.deleteBySubmissionId = async (submissionId) => {
    const [result] = await db.query(
        'DELETE FROM test_reports WHERE submission_id = ?',
        [submissionId]
    );
    return result.affectedRows;
};
