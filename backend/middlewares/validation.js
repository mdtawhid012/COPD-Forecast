const Joi = require('joi');

const ehrSchema = Joi.object({
    AGE: Joi.number().required(),
    smoking: Joi.number().valid(0, 1).required(),
    gender: Joi.number().valid(0, 1).required(),
    Diabetes: Joi.number().valid(0, 1).required(),
    hypertension: Joi.number().valid(0, 1).required(),
    AtrialFib: Joi.number().valid(0, 1).required(),
    IHD: Joi.number().valid(0, 1).required(),
    id: Joi.any(),
    summary: Joi.any()
}).unknown(true);

const validateEHR = (req, res, next) => {
    const { error } = ehrSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = {
    validateEHR
};
