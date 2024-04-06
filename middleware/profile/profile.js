const { body, validationResult } = require.main.require('../routes/require.js');
const { query } = require.main.require('../routes/require.js');

/* Start login code */
const validationRulesProfile = () => {
    return [
        // not validation
    ]
}

/* Start view profile code */
const validationRulesViewProfile = () => {
    return [
        // email validation
        query('token_id')
            .trim()
            .escape(),
    ]
}
/* end view profile */

const validateProfile = (req, res, next) => {
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

/* end Profile code */

/* Profile Validation */
const validationRules = () => {
    return [

        
        // Teamname validation
        body('teamname')
            .trim()
            .notEmpty().withMessage('Please enter team name.')
            .isLength({ min: 3 }).withMessage('Team name must be of 3 characters long.')
            .matches(/^[A-Za-z0-9\s]+$/).withMessage('Team name must be alphabetic or numbers.')
            .escape(),

        // Gender validation
        body('gender')
            .trim()
            .notEmpty().withMessage('Please enter gender.')
            .isLength({ max: 1 }).withMessage('gender must be only 1 characters long.')
            .matches(/^[A-Za-z\s]+$/).withMessage('gender must be alphabetic.')
            .escape(),
    
        // country validation
        body('country_id')
            .trim()
            .notEmpty().withMessage('Please select country.')
            .isInt({ min:1}).withMessage('Please select correct country')
            .isNumeric().withMessage('Country id cannot be text.')
            .escape(),

        // State validation
        body('state_id')
            .trim()
            .notEmpty().withMessage('Please select state.')
            .isInt({ min:1}).withMessage('Please select correct state')
            .isNumeric().withMessage('State id cannot be text.')
            .escape(),

        // city validation
        body('city_id')
            .trim()
            .notEmpty().withMessage('Please select city.')
            .isInt({ min:1}).withMessage('Please select correct city')
            .isNumeric().withMessage('City id cannot be text.')
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

    ]
}

/* profile end code */


/* edit profile email */
const editEMailValidationRules = () => {
    return [
        // email validation
        body('email')
            .trim()
            .notEmpty().withMessage('Please enter email id.')
            .isEmail().withMessage('Please enter correct email id'),
    ]
}
/* end of edit profile email */

/* verify profile email */
const verifyEMailValidationRules = () => {
    return [
        // email validation
        body('email')
            .trim()
            .notEmpty().withMessage('Please enter email id.')
            .isEmail().withMessage('Please enter correct email id'),
        
        // OTP validation
        body('otp')
            .trim()
            .notEmpty().withMessage('Please enter OTP.')
            .isInt({ min:1}).withMessage('Please enter correct OTP'),
    ]
}
/* end of verify profile email */


/* start change password */
const changePasswordValidationRules = () => {
    return [
        // password must be at least 5 chars long
        body('old_password')
            .trim()
            .notEmpty().withMessage('Please enter password.'),

        // password must be at least 5 chars long
        body('new_password')
            .trim()
            .notEmpty().withMessage('Please enter password.')
            .isLength({ min: 5 }).withMessage('Password require minimun 5 Letters')
            .not()
            .isIn(['12345', 'password', 'god']).withMessage('Do not use a common word (such as 12345, password, god) as the password'),

        // password must be at least 5 chars long
        body('confirm_password')
            .trim()
            .notEmpty().withMessage('Please enter password.')
            .isLength({ min: 5 }).withMessage('Password require minimun 5 Letters')
            .not()
            .isIn(['12345', 'password', 'god']).withMessage('Do not use a common word (such as 12345, password, god) as the password'),

        
    ]
}
/* end of change password */


/* start change account settings */
const changeAccountSettingValidationRules = () => {
    return [
        body('account_setting')
            .trim()
            .notEmpty().withMessage('Please enter accounts setting.')
            .isLength({ min: 1 }).withMessage('Accounts setting require minimun 1 Letters')
            .isNumeric().withMessage('Accounts setting must be number.')
            .matches(/^[0-1\s]+$/).withMessage('Accounts setting must be 0 (Active) or 1 (Deactive).')
    ]
}
/* end of change account settings */

module.exports = {
    validationRulesProfile,
    validateProfile,
    validationRulesViewProfile,
    validationRules,
    editEMailValidationRules,
    verifyEMailValidationRules,
    changePasswordValidationRules,
    changeAccountSettingValidationRules
}