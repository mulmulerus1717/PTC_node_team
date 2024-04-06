const { body, validationResult } = require.main.require('../routes/require.js');
const { query } = require.main.require('../routes/require.js');


/* Result Challenge code */
const validationRules = () => {
    return [

        // challenge id validation
        body('challenge_id')
            .trim()
            .notEmpty().withMessage('Challenge id cannot be enter.')
            .matches(/^[0-9\s]+$/).withMessage('Challenge id must be integer.')
            .isInt({ min:1}).withMessage('Please select correct challenge id')
            .isNumeric().withMessage('Challenge id cannot be text.')
            .escape(),
    ]
}
/* End of Result challenge code */

/* Add Result Challenge code */
const validationRulesAddResult = () => {
    return [

        // challenge id validation
        body('challenge_id')
            .trim()
            .notEmpty().withMessage('Challenge id cannot be enter.')
            .matches(/^[0-9\s]+$/).withMessage('Challenge id must be integer.')
            .isInt({ min:1}).withMessage('Please select correct challenge id')
            .isNumeric().withMessage('Challenge id cannot be text.')
            .escape(),

        // Opponent token validation
        body('result')
            .trim()
            .notEmpty().withMessage('Result cannot be empty.')
            .escape(),
    ]
}
/* End of Add Result challenge code */


/* Add Result Challenge code */
const validationRulesAllResult = () => {
    return [
        // Opponent token validation
        body('status')
            .trim()
            .escape(),
    ]
}
/* End of Add Result challenge code */

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
    validationRulesAddResult,
    validationRulesAllResult,
    validateRule
}