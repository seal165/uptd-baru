/**
 * Wrapper Joi untuk validasi request.
 * Pakai di route: router.post('/x', validate(schema), controller.create)
 */
exports.validate = (schema, source = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validasi gagal',
            errors: error.details.map((d) => ({
                field: d.path.join('.'),
                message: d.message
            }))
        });
    }

    req[source] = value;
    next();
};
