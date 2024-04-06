const { body, validationResult } = require.main.require('../routes/require.js');
const { query } = require.main.require('../routes/require.js');

/* Sports Validation */
const validationRules = () => {
    return [

        // Sports validation
        body('sport')
            .trim()
            .notEmpty().withMessage('Please enter sport/game.')
            .isLength({ min: 1 }).withMessage('sport/game must be of 1 characters long.')
            .matches(/^[A-Za-z\s]+$/).withMessage('sport/game must be alphabetic.')
            .escape(),
    ]
}

const validate = (req, res, next) => {
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

/* End of sports validation */

module.exports = {
    validationRules,
    validate
}