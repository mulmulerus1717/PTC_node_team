const { body, validationResult } = require.main.require('../routes/require.js');
const { query } = require.main.require('../routes/require.js');


/* Block code */
const validationRules = () => {
    return [

        // opponent token id validation
        body('opponent_token_id')
            .trim()
            .notEmpty().withMessage('Opponent token id cannot be enter.')
            .matches(/^[0-9A-Za-z\s]+$/).withMessage('Opponent token id must be integer.')
            .escape(),
    ]
}
/* End of block code */

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
    validationRules,
    validateRule
}