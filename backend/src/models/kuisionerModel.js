/**
 * Model untuk tabel `kuisioner` & `kuisioner_questions`.
 */
const db = require('../config/database');

// =========== KUISIONER (jawaban) ===========

exports.list = async ({ limit = 50, offset = 0 } = {}) => {
    const [rows] = await db.query(
        `SELECT k.*, s.nama_pemohon, s.nama_proyek 
         FROM kuisioner k 
         LEFT JOIN submissions s ON s.id = k.submission_id 
         ORDER BY k.created_at DESC LIMIT ? OFFSET ?`,
        [parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
};

exports.findById = async (id) => {
    const [rows] = await db.query('SELECT * FROM kuisioner WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
};

exports.findBySubmissionId = async (submissionId) => {
    const [rows] = await db.query(
        'SELECT * FROM kuisioner WHERE submission_id = ? LIMIT 1',
        [submissionId]
    );
    return rows[0] || null;
};

exports.create = async (data) => {
    const [result] = await db.query(
        `INSERT INTO kuisioner 
        (submission_id, nama, email, answers, rating_avg, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [
            data.submission_id || null,
            data.nama || null,
            data.email || null,
            JSON.stringify(data.answers),
            data.rating_avg || null
        ]
    );
    return result.insertId;
};

exports.update = async (id, data) => {
    const allowed = ['answers', 'rating_avg', 'nama', 'email'];
    const fields = [];
    const values = [];
    for (const key of allowed) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(key === 'answers' ? JSON.stringify(data[key]) : data[key]);
        }
    }
    if (!fields.length) return 0;
    values.push(id);
    const [result] = await db.query(
        `UPDATE kuisioner SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
    );
    return result.affectedRows;
};

exports.delete = async (id) => {
    const [result] = await db.query('DELETE FROM kuisioner WHERE id = ?', [id]);
    return result.affectedRows;
};

exports.stats = async () => {
    const [rows] = await db.query(
        `SELECT 
            COUNT(*) AS total_responses,
            AVG(rating_avg) AS avg_rating
         FROM kuisioner WHERE rating_avg IS NOT NULL`
    );
    return rows[0];
};

// =========== KUISIONER QUESTIONS ===========

exports.listQuestions = async () => {
    const [rows] = await db.query(
        'SELECT * FROM kuisioner_questions ORDER BY order_index ASC, id ASC'
    );
    return rows;
};

exports.findQuestionById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM kuisioner_questions WHERE id = ? LIMIT 1',
        [id]
    );
    return rows[0] || null;
};

exports.createQuestion = async (data) => {
    const [result] = await db.query(
        `INSERT INTO kuisioner_questions 
        (question_text, question_type, options, is_required, order_index, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [
            data.question_text,
            data.question_type,
            data.options ? (typeof data.options === 'string' ? data.options : JSON.stringify(data.options)) : null,
            data.is_required ? 1 : 0,
            data.order_index || 0
        ]
    );
    return result.insertId;
};

exports.updateQuestion = async (id, data) => {
    const allowed = ['question_text', 'question_type', 'options', 'is_required', 'order_index'];
    const fields = [];
    const values = [];
    for (const key of allowed) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            let val = data[key];
            if (key === 'options' && val !== null && typeof val !== 'string') {
                val = JSON.stringify(val);
            }
            if (key === 'is_required') val = val ? 1 : 0;
            values.push(val);
        }
    }
    if (!fields.length) return 0;
    values.push(id);
    const [result] = await db.query(
        `UPDATE kuisioner_questions SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
    return result.affectedRows;
};

exports.deleteQuestion = async (id) => {
    const [result] = await db.query('DELETE FROM kuisioner_questions WHERE id = ?', [id]);
    return result.affectedRows;
};

exports.reorderQuestions = async (orders) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        for (const item of orders) {
            await conn.query(
                'UPDATE kuisioner_questions SET order_index = ? WHERE id = ?',
                [item.order_index, item.id]
            );
        }
        await conn.commit();
        return true;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};
