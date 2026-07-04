/**
 * Controller untuk kuisioner & kuisioner_questions.
 */
const kuisionerModel = require('../models/kuisionerModel');
const { success, error } = require('../utils/responseHelper');

// =========== KUISIONER (Jawaban) ===========

exports.list = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const offset = (page - 1) * limit;
        const { start_date, end_date } = req.query;
        
        const data = await kuisionerModel.list({ limit, offset, start_date, end_date });
        const total = await kuisionerModel.count({ start_date, end_date });
        
        const { paginated } = require('../utils/responseHelper');
        return paginated(res, 'Daftar kuisioner', data, {
            page, limit, total, pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('❌ [kuisioner] list error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.detail = async (req, res) => {
    try {
        const data = await kuisionerModel.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Kuisioner tidak ditemukan' });
        return res.json({ success: true, message: 'Detail kuisioner', data });
    } catch (err) {
        console.error('❌ [kuisioner] detail error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.check = async (req, res) => {
    console.log('🔍 [kuisioner] check called for submission:', req.params.submissionId);
    try {
        const data = await kuisionerModel.findBySubmissionId(req.params.submissionId);
        return res.json({
            success: true,
            message: 'Cek kuisioner',
            data: { filled: !!data, data }
        });
    } catch (err) {
        console.error('❌ [kuisioner] check error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await kuisionerModel.create(req.body);
        return res.status(201).json({ success: true, message: 'Kuisioner berhasil dibuat', data: { id } });
    } catch (err) {
        console.error('❌ [kuisioner] create error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.submitPublic = async (req, res) => {
    try {
        console.log('📩 [submitPublic] Body:', req.body);

        // 🔥 Konversi answers array ke object { "1": 5, "2": 4, ... }
        const jawabanObj = {};
        const answers = req.body.answers || [];
        for (const item of answers) {
            if (item.question_id && item.answer !== undefined && item.answer !== null) {
                jawabanObj[item.question_id] = item.answer;
            }
        }

        // 🔥 Ambil pertanyaan dari database untuk disimpan
        const pertanyaanList = await kuisionerModel.listQuestions();
        const pertanyaanJson = pertanyaanList.map(q => q.question_text);

        // 🔥 Siapkan payload
        const payload = {
            submission_id: req.body.submission_id,
            saran: req.body.saran || null,   // PASTIKAN SARAN TERKIRIM
            answers: jawabanObj,              // object { "1": 5, ... }
            pertanyaan_json: pertanyaanJson,  // array pertanyaan
            rating_avg: null
        };

        // 🔥 Hitung rating average (skor_17)
        const values = Object.values(jawabanObj).filter(v => !isNaN(v));
        if (values.length > 0) {
            payload.rating_avg = values.reduce((a, b) => a + b, 0) / values.length;
        }

        const id = await kuisionerModel.create(payload);
        return res.status(201).json({ success: true, message: 'Terima kasih atas feedback-nya', data: { id } });

    } catch (err) {
        console.error('❌ [kuisioner] submitPublic error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const affected = await kuisionerModel.update(req.params.id, req.body);
        if (!affected) return res.status(404).json({ success: false, message: 'Kuisioner tidak ditemukan' });
        return res.json({ success: true, message: 'Kuisioner diupdate' });
    } catch (err) {
        console.error('❌ [kuisioner] update error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const affected = await kuisionerModel.delete(req.params.id);
        if (!affected) return res.status(404).json({ success: false, message: 'Kuisioner tidak ditemukan' });
        return res.json({ success: true, message: 'Kuisioner dihapus' });
    } catch (err) {
        console.error('❌ [kuisioner] delete error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.stats = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const data = await kuisionerModel.stats({ start_date, end_date });
        return res.json({ success: true, message: 'Statistik kuisioner', data });
    } catch (err) {
        console.error('❌ [kuisioner] stats error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// =========== KUISIONER QUESTIONS ===========

exports.listQuestions = async (req, res) => {
    console.log('📋 [kuisioner] listQuestions called');
    try {
        const data = await kuisionerModel.listQuestions();
        return res.json({
            success: true,
            message: 'Daftar pertanyaan',
            data: data || []
        });
    } catch (err) {
        console.error('❌ [kuisioner] listQuestions error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Gagal memuat pertanyaan'
        });
    }
};

exports.detailQuestion = async (req, res) => {
    try {
        const data = await kuisionerModel.findQuestionById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Pertanyaan tidak ditemukan' });
        return res.json({ success: true, message: 'Detail pertanyaan', data });
    } catch (err) {
        console.error('❌ [kuisioner] detailQuestion error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// =========== KUISIONER QUESTIONS ===========

exports.createQuestion = async (req, res) => {
    try {
        console.log('📝 [createQuestion] Body:', req.body);
        const data = {
            question_text: req.body.question_text,
            order_index: req.body.urutan || 0
        };
        const id = await kuisionerModel.createQuestion(data);
        return res.status(201).json({ success: true, message: 'Pertanyaan ditambahkan', data: { id } });
    } catch (err) {
        console.error('❌ [kuisioner] createQuestion error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        console.log('📝 [updateQuestion] Body:', req.body);
        const data = {};
        if (req.body.question_text !== undefined) data.question_text = req.body.question_text;
        if (req.body.urutan !== undefined) data.order_index = req.body.urutan;
        // status tidak digunakan di model, abaikan
        
        const affected = await kuisionerModel.updateQuestion(req.params.id, data);
        if (!affected) return res.status(404).json({ success: false, message: 'Pertanyaan tidak ditemukan' });
        return res.json({ success: true, message: 'Pertanyaan diupdate' });
    } catch (err) {
        console.error('❌ [kuisioner] updateQuestion error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const affected = await kuisionerModel.deleteQuestion(req.params.id);
        if (!affected) return res.status(404).json({ success: false, message: 'Pertanyaan tidak ditemukan' });
        return res.json({ success: true, message: 'Pertanyaan dihapus' });
    } catch (err) {
        console.error('❌ [kuisioner] deleteQuestion error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.reorderQuestions = async (req, res) => {
    try {
        await kuisionerModel.reorderQuestions(req.body.order);
        return res.json({ success: true, message: 'Urutan pertanyaan diupdate' });
    } catch (err) {
        console.error('❌ [kuisioner] reorderQuestions error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};