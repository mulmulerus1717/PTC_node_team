const { body, validationResult } = require.main.require('../routes/require.js');
const { query } = require.main.require('../routes/require.js');


/* Accept Challenge code */
const validationRulesAccept = () => {
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
/* End of accept challenge code */


/* Send Message code */
const validationRulesSendMessage = () => {
    return [

        // challenge id validation
        body('challenge_id')
            .trim()
            .notEmpty().withMessage('Challenge id cannot be Empty.')
            .matches(/^[0-9\s]+$/).withMessage('Challenge id must be integer.')
            .isInt({ min:1}).withMessage('Please select correct challenge id')
            .isNumeric().withMessage('Challenge id cannot be text.')
            .escape(),

        // message validation
        body('message')
            .trim()
            .notEmpty().withMessage('Message cannot be Empty.')
            .escape(),
    ]
}
/* End of send message code */



/* chat listing start */
const validationRulesListing = () => {
    return [

        // sport_id validation
        body('limit')
            .trim()
            .notEmpty().withMessage('Limit cannot be enter.')
            .matches(/^[0-9\s]+$/).withMessage('Limit must be integer.')
            .isInt({ min:1}).withMessage('Please enter Limit, more than 0')
            .isNumeric().withMessage('Limit cannot be text.')
            .escape(),

        // sport_id validation
        body('offset')
            .trim()
            .matches(/^[0-9\s]+$/).withMessage('Offset must be integer.')
            .isNumeric().withMessage('Offset cannot be text.')
            .escape(),
    ]
}

/* chat listing ends */

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
    validationRulesListing,
    validationRulesAccept,
    validationRulesSendMessage,
    validateRule
}