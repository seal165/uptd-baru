const Joi = require('joi');

exports.updateSystemSchema = Joi.object({
    institution_name: Joi.string().max(255),
    address: Joi.string().max(500),
    phone: Joi.string().max(50),
    email: Joi.string().email().max(100),
    logo_url: Joi.string().max(500).allow('', null),
    maintenance_mode: Joi.alternatives().try(
        Joi.boolean(),
        Joi.string().valid('true', 'false', '1', '0')
    ).default(false),
    max_upload_size: Joi.alternatives().try(
        Joi.number(),
        Joi.string()
    ).default(5)
}).min(1);

exports.updateBusyModeSchema = Joi.object({
    active: Joi.boolean().required()
});

exports.busyPeriodSchema = Joi.object({
    start_date: Joi.date().required(),
    end_date: Joi.date().min(Joi.ref('start_date')).required(),
    reason: Joi.string().max(255).allow('', null)
});
