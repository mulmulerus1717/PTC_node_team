const { body, validationResult } = require.main.require('../routes/require.js');
const { query } = require.main.require('../routes/require.js');


/* Send challenge Validation */
const validationRulesTeams = () => {
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

        //player_token validation
        body('player_token')
            .trim()
            .notEmpty().withMessage('Player is cannot be empty')
            .escape(),

        //opponent_token validation
        body('team_token')
            .trim()
            .notEmpty().withMessage('Team token is cannot be empty')
            .escape(),

        // Sports id validation
        body('sports_id')
            .trim()
            .matches(/^[0-9,\s]+$/).withMessage('Sports id must be integer.')
            .escape(),
    ]
}

/* Send challenge code */

/* Accept Challenge code */
const validationRulesAccept = () => {
    return [

        // team player id validation
        body('team_player_id')
            .trim()
            .notEmpty().withMessage('Team player id cannot be enter.')
            .matches(/^[0-9\s]+$/).withMessage('Team player id must be integer.')
            .isInt({ min:1}).withMessage('Please select correct team player id')
            .isNumeric().withMessage('Team player id cannot be text.')
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


/* Teams city sports Validation */
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
    validationRulesTeams,
    validationRules,
    validationRulesAccept,
    validationRulesCitySports,
    validationRulesAddSport
}