const Joi = require('joi');

exports.submitPublicSchema = Joi.object({
    submission_id: Joi.number().integer().allow(null),
    nama: Joi.string().max(100).allow('', null),
    email: Joi.string().email().max(100).allow('', null),
    answers: Joi.array().items(
        Joi.object({
            question_id: Joi.number().integer().required(),
            answer: Joi.alternatives(Joi.string(), Joi.number()).required()
        })
    ).min(1).required()
});

exports.questionSchema = Joi.object({
    question_text: Joi.string().min(3).max(500).required(),
    question_type: Joi.string().valid('text', 'rating', 'multiple_choice', 'yes_no').required(),
    options: Joi.alternatives(Joi.array(), Joi.string()).allow(null),
    is_required: Joi.boolean().default(true),
    order_index: Joi.number().integer().min(0).default(0)
});

exports.reorderSchema = Joi.object({
    order: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().required(),
            order_index: Joi.number().integer().min(0).required()
        })
    ).required()
});
