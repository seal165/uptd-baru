const Joi = require('joi');

exports.registerSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().max(100).required(),
    password: Joi.string().min(8).max(128).required()
        .messages({ 'string.min': 'Password minimal 8 karakter' }),
    confirm_password: Joi.any().equal(Joi.ref('password')).required()
        .messages({ 'any.only': 'Konfirmasi password tidak cocok' }),
    full_name: Joi.string().min(3).max(100).trim().required(),
    nama_instansi: Joi.string().min(2).max(255).trim().required(),
    alamat: Joi.string().min(5).max(500).trim().required(),
    nomor_telepon: Joi.string().pattern(/^[0-9+\-\s]{10,20}$/).required()
        .messages({ 'string.pattern.base': 'Nomor telepon tidak valid (10-20 digit)' })
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(1).max(128).required()
});

exports.changePasswordSchema = Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string().min(8).max(128).required()
        .messages({ 'string.min': 'Password baru minimal 8 karakter' }),
    confirm_password: Joi.any().equal(Joi.ref('new_password')).required()
        .messages({ 'any.only': 'Konfirmasi password baru tidak cocok' })
});

exports.refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});
