const { body, validationResult } = require.main.require('../routes/require.js');
const { query } = require.main.require('../routes/require.js');

/* Signup Validation */
const validationRules = () => {
    return [

        // Teamname validation
        body('teamname')
            .trim()
            .notEmpty().withMessage('Please enter team name.')
            .isLength({ min: 3 }).withMessage('Team name must be of 3 characters long.')
            .matches(/^[A-Za-z0-9\s]+$/).withMessage('Team name must be alphabetic or numbers.')
            .escape(),

        // email validation
        body('email')
            .trim()
            .notEmpty().withMessage('Please enter email id.')
            .isEmail().withMessage('Please enter correct email id')
            .escape(),

        // password must be at least 5 chars long
        body('password')
            .trim()
            .notEmpty().withMessage('Please enter password.')
            .isLength({ min: 5 }).withMessage('Password require minimun 5 Letters')
            .not()
            .isIn(['12345', 'password', 'god']).withMessage('Do not use a common word (such as 12345, password, god) as the password'),


        // country validation
        body('country_id')
            .trim()
            .notEmpty().withMessage('Please select country.')
            .isInt({ min:1}).withMessage('Please select correct country')
            .escape(),

        // State validation
        body('state_id')
            .trim()
            .notEmpty().withMessage('Please select state.')
            .isInt({ min:1}).withMessage('Please select correct state')
            .escape(),

        // city validation
        body('city_id')
            .trim()
            .notEmpty().withMessage('Please select city.')
            .isInt({ min:1}).withMessage('Please select correct city')
            .escape(),

        // Team type validation
        body('type')
            .trim()
            .notEmpty().withMessage('Please enter team type.')
            .isLength({ max: 1 }).withMessage('Team type must be only 1 characters long.')
            .matches(/^[0-9\s]+$/).withMessage('Team type must be alphabetic.')
            .escape(),

        // Age range validation
        body('age_range')
            .trim()
            .notEmpty().withMessage('Please enter age range of team.')
            .isLength({ max: 1 }).withMessage('Age range must be only 1 characters long.')
            .matches(/^[0-9\s]+$/).withMessage('Age range must be number.')
            .escape(),

        // Gender validation
        body('gender')
            .trim()
            .notEmpty().withMessage('Please enter gender.')
            .isLength({ max: 1 }).withMessage('gender must be only 1 characters long.')
            .matches(/^[A-Za-z\s]+$/).withMessage('gender must be alphabetic.')
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

/* End of signup validation */


/* Start Signup OTP */

const validationRulesOtp = () => {
    return [
        // email validation
        query('email')
            .trim()
            .notEmpty().withMessage('Please enter email id.')
            .isEmail().withMessage('Please enter correct email id'),
        
        // OTP validation
        query('otp')
            .trim()
            .notEmpty().withMessage('Please enter OTP.')
            .isInt({ min:1}).withMessage('Please enter correct OTP'),
    ]
}

const validateOtp = (req, res, next) => {
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

/* End of Sinup OTP */


/* Start Signup Resend OTP */

const resendValidationRulesOtp = () => {
    return [
        // email validation
        query('email')
            .trim()
            .notEmpty().withMessage('Please enter email id.')
            .isEmail().withMessage('Please enter correct email id'),
    ]
}

const resendValidateOtp = (req, res, next) => {
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

/* End of Sinup Resend OTP */

module.exports = {
    validationRules,
    validate,
    validationRulesOtp,
    validateOtp,
    resendValidationRulesOtp,
    resendValidateOtp
}