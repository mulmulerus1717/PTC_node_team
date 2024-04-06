const { body, validationResult } = require.main.require('../routes/require.js');
const { query } = require.main.require('../routes/require.js');

const validateRule = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

    return res.status(422).json({
        status:false,
        errors: extractedErrors,
    })
}

module.exports = {
    validateRule
}