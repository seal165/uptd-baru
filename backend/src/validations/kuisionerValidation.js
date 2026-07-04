const Joi = require('joi');

// Schema untuk submit kuisioner publik
exports.submitPublicSchema = Joi.object({
    submission_id: Joi.number().integer().allow(null),
    nama: Joi.string().max(100).allow('', null),
    email: Joi.string().email().max(100).allow('', null),
    answers: Joi.array().items(
        Joi.object({
            question_id: Joi.number().integer().required(),
            answer: Joi.alternatives(Joi.string(), Joi.number()).required()
        })
    ).min(1).required(),
    saran: Joi.string().allow('', null)
});

// Schema untuk menambah/mengedit pertanyaan (admin)
exports.questionSchema = Joi.object({
    question_text: Joi.string().min(3).max(500).required(),
    urutan: Joi.number().integer().min(0).allow(null),
    status: Joi.string().valid('active', 'inactive').default('active')
});

// Schema untuk reorder pertanyaan
exports.reorderSchema = Joi.object({
    order: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().required(),
            order_index: Joi.number().integer().min(0).required()
        })
    ).required()
});