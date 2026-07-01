/**
 * Controller untuk kuisioner & kuisioner_questions.
 */
const kuisionerModel = require('../models/kuisionerModel');
const { success, error } = require('../utils/responseHelper');

// =========== KUISIONER (Jawaban) ===========

exports.list = async (req, res, next) => {
    try {
        const data = await kuisionerModel.list(req.query);
        return success(res, 'Daftar kuisioner', data);
    } catch (err) { next(err); }
};

exports.detail = async (req, res, next) => {
    try {
        const data = await kuisionerModel.findById(req.params.id);
        if (!data) return error(res, 404, 'Kuisioner tidak ditemukan');
        return success(res, 'Detail kuisioner', data);
    } catch (err) { next(err); }
};

exports.check = async (req, res, next) => {
    try {
        const data = await kuisionerModel.findBySubmissionId(req.params.submissionId);
        return success(res, 'Cek kuisioner', { filled: !!data, data });
    } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
    try {
        const id = await kuisionerModel.create(req.body);
        return success(res, 'Kuisioner berhasil dibuat', { id }, 201);
    } catch (err) { next(err); }
};

exports.submitPublic = async (req, res, next) => {
    try {
        // Hitung rating average kalau ada
        const ratings = (req.body.answers || [])
            .map(a => parseInt(a.answer, 10))
            .filter(n => !isNaN(n));
        const rating_avg = ratings.length
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : null;

        const id = await kuisionerModel.create({ ...req.body, rating_avg });
        return success(res, 'Terima kasih atas feedback-nya', { id }, 201);
    } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
    try {
        const affected = await kuisionerModel.update(req.params.id, req.body);
        if (!affected) return error(res, 404, 'Kuisioner tidak ditemukan');
        return success(res, 'Kuisioner diupdate');
    } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
    try {
        const affected = await kuisionerModel.delete(req.params.id);
        if (!affected) return error(res, 404, 'Kuisioner tidak ditemukan');
        return success(res, 'Kuisioner dihapus');
    } catch (err) { next(err); }
};

exports.stats = async (req, res, next) => {
    try {
        const data = await kuisionerModel.stats();
        return success(res, 'Statistik kuisioner', data);
    } catch (err) { next(err); }
};

// =========== KUISIONER QUESTIONS ===========

exports.listQuestions = async (req, res, next) => {
    try {
        const data = await kuisionerModel.listQuestions();
        return success(res, 'Daftar pertanyaan', data);
    } catch (err) { next(err); }
};

exports.detailQuestion = async (req, res, next) => {
    try {
        const data = await kuisionerModel.findQuestionById(req.params.id);
        if (!data) return error(res, 404, 'Pertanyaan tidak ditemukan');
        return success(res, 'Detail pertanyaan', data);
    } catch (err) { next(err); }
};

exports.createQuestion = async (req, res, next) => {
    try {
        const id = await kuisionerModel.createQuestion(req.body);
        return success(res, 'Pertanyaan ditambahkan', { id }, 201);
    } catch (err) { next(err); }
};

exports.updateQuestion = async (req, res, next) => {
    try {
        const affected = await kuisionerModel.updateQuestion(req.params.id, req.body);
        if (!affected) return error(res, 404, 'Pertanyaan tidak ditemukan');
        return success(res, 'Pertanyaan diupdate');
    } catch (err) { next(err); }
};

exports.deleteQuestion = async (req, res, next) => {
    try {
        const affected = await kuisionerModel.deleteQuestion(req.params.id);
        if (!affected) return error(res, 404, 'Pertanyaan tidak ditemukan');
        return success(res, 'Pertanyaan dihapus');
    } catch (err) { next(err); }
};

exports.reorderQuestions = async (req, res, next) => {
    try {
        await kuisionerModel.reorderQuestions(req.body.order);
        return success(res, 'Urutan pertanyaan diupdate');
    } catch (err) { next(err); }
};
