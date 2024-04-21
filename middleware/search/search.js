const { body, validationResult } = require.main.require('../routes/require.js');
const { query } = require.main.require('../routes/require.js');


/* Send challenge Validation */
const validationRulesSearch = () => {
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

/* Send challenge code */



/* Send challenge Validation */
const validationRules = () => {
    return [

        //opponent_token validation
        body('opponent_token')
            .trim()
            .notEmpty().withMessage('Opponent_token is cannot be empty')
            .escape(),

        // sport_id validation
        body('sport_id')
            .trim()
            .notEmpty().withMessage('Sport id cannot be enter.')
            .matches(/^[0-9\s]+$/).withMessage('Sport id must be integer.')
            .isInt({ min:1}).withMessage('Please select correct sport id')
            .isNumeric().withMessage('Sport id cannot be text.')
            .escape(),

        // match validation
        body('match')
            .trim()
            .notEmpty().withMessage('Match contest cannot be enter.')
            .matches(/^[0-1\s]+$/).withMessage('Match contest must be integer and must be friendly or prize money match.')
            .isNumeric().withMessage('Match contest cannot be text.')
            .escape(),

        // Player message validation
        body('challenge_message')
            .trim()
            .escape(),

    ]
}

/* Send challenge code */

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


/* Search city sports Validation */
const validationRulesCitySports = () => {
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

/* Send challenge code */


/* Add sports code */
const validationRulesAddSport = () => {
    return [

        // sports id validation
        body('sport_id')
            .trim()
            .notEmpty().withMessage('Sport id cannot be enter.')
            .matches(/^[0-9\s]+$/).withMessage('Sport id must be integer.')
            .isInt({ min:1}).withMessage('Please select correct sport id')
            .isNumeric().withMessage('Sport id cannot be text.')
            .escape(),
    ]
}
/* End of add sports code */



module.exports = {
    validateRule,
    validationRulesSearch,
    validationRules,
    validationRulesAccept,
    validationRulesCitySports,
    validationRulesAddSport
}