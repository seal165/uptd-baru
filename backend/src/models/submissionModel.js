/**
 * Model untuk tabel `submissions`.
 * Kolom utama: id, user_id, no_permohonan, nama_pemohon, nama_instansi,
 * alamat_pemohon, nomor_telepon, email_pemohon, nama_proyek, lokasi_proyek,
 * file_surat_permohonan, file_ktp, dokumen_tambahan, catatan_tambahan,
 * catatan_admin, jadwal_sampling, status, created_at, updated_at
 */
const db = require('../config/database');

const SELECT_BASE = `SELECT s.*, u.full_name AS user_name, u.email AS user_email`;
const FROM_BASE = `FROM submissions s LEFT JOIN users u ON u.id = s.user_id`;

exports.list = async ({ status, search, limit = 20, offset = 0 } = {}) => {
    const params = [];
    let sql = `${SELECT_BASE} ${FROM_BASE} WHERE 1=1`;
    if (status) {
        sql += ' AND s.status = ?';
        params.push(status);
    }
    if (search) {
        sql += ' AND (s.nama_pemohon LIKE ? OR s.nama_proyek LIKE ? OR s.no_permohonan LIKE ?)';
        const q = `%${search}%`;
        params.push(q, q, q);
    }
    sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));
    const [rows] = await db.query(sql, params);
    return rows;
};

exports.count = async ({ status } = {}) => {
    const params = [];
    let sql = 'SELECT COUNT(*) AS total FROM submissions WHERE 1=1';
    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }
    const [rows] = await db.query(sql, params);
    return rows[0].total;
};

exports.findById = async (id) => {
    const [rows] = await db.query(
        `${SELECT_BASE} ${FROM_BASE} WHERE s.id = ? LIMIT 1`,
        [id]
    );
    return rows[0] || null;
};

exports.findByUserId = async (userId, { limit = 20, offset = 0, status } = {}) => {
    const params = [userId];
    let sql = 'SELECT * FROM submissions WHERE user_id = ?';
    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));
    const [rows] = await db.query(sql, params);
    return rows;
};

exports.create = async (data) => {
    const [result] = await db.query(
        `INSERT INTO submissions 
        (user_id, no_permohonan, nama_pemohon, nama_instansi, alamat_pemohon, 
         nomor_telepon, email_pemohon, nama_proyek, lokasi_proyek, 
         file_surat_permohonan, file_ktp, dokumen_tambahan, catatan_tambahan, 
         status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu Verifikasi', NOW())`,
        [
            data.user_id,
            data.no_permohonan || null,
            data.nama_pemohon,
            data.nama_instansi || null,
            data.alamat_pemohon || null,
            data.nomor_telepon || null,
            data.email_pemohon || null,
            data.nama_proyek,
            data.lokasi_proyek || null,
            data.file_surat_permohonan || null,
            data.file_ktp || null,
            data.dokumen_tambahan || null,
            data.catatan_tambahan || null
        ]
    );
    return result.insertId;
};

exports.update = async (id, data) => {
    const allowed = [
        'no_permohonan',
        'nama_pemohon',
        'nama_instansi',
        'alamat_pemohon',
        'nomor_telepon',
        'email_pemohon',
        'nama_proyek',
        'lokasi_proyek',
        'catatan_tambahan',
        'catatan_admin',
        'jadwal_sampling',
        'status',
        'file_surat_permohonan',
        'file_ktp',
        'dokumen_tambahan'
    ];
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
        `UPDATE submissions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
    );
    return result.affectedRows;
};

exports.updateStatus = async (id, status, catatan_admin = null) => {
    const [result] = await db.query(
        'UPDATE submissions SET status = ?, catatan_admin = COALESCE(?, catatan_admin), updated_at = NOW() WHERE id = ?',
        [status, catatan_admin, id]
    );
    return result.affectedRows;
};

exports.cancel = async (id) => {
    const [result] = await db.query(
        "UPDATE submissions SET status = 'Dibatalkan', updated_at = NOW() WHERE id = ?",
        [id]
    );
    return result.affectedRows;
};

exports.countByStatus = async () => {
    const [rows] = await db.query(
        'SELECT status, COUNT(*) AS total FROM submissions GROUP BY status'
    );
    return rows;
};

exports.userOwnsFile = async (userId, filename) => {
    const [rows] = await db.query(
        `SELECT id FROM submissions 
         WHERE user_id = ? 
         AND (file_surat_permohonan = ? OR file_ktp = ? OR dokumen_tambahan LIKE ?)
         LIMIT 1`,
        [userId, filename, filename, `%${filename}%`]
    );
    return rows.length > 0;
};
