const Joi = require('joi');

exports.updateProfileSchema = Joi.object({
    full_name: Joi.string().min(3).max(100).trim(),
    email: Joi.string().email().lowercase().trim().max(100),
    nama_instansi: Joi.string().min(2).max(255).trim().allow('', null),
    alamat: Joi.string().min(5).max(500).trim().allow('', null),
    nomor_telepon: Joi.string().pattern(/^[0-9+\-\s]{10,20}$/).allow('', null),
    notif_email: Joi.boolean(),
    notif_wa: Joi.boolean()
}).min(1);

exports.adminUpdateUserSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().max(100),
    full_name: Joi.string().min(3).max(100).trim(),
    nama_instansi: Joi.string().max(255).allow('', null),
    alamat: Joi.string().max(500).allow('', null),
    nomor_telepon: Joi.string().pattern(/^[0-9+\-\s]{10,20}$/).allow('', null),
    role: Joi.string().valid('admin', 'petugas', 'pelanggan'),
    employee_id: Joi.string().max(50).allow('', null)
}).min(1);

exports.changePasswordSchema = Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(6).required()
});