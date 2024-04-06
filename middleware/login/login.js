const { body, validationResult } = require.main.require('../routes/require.js');
const { query } = require.main.require('../routes/require.js');
const { header } = require.main.require('../routes/require.js');
const { jwt } = require.main.require('../routes/require.js');

/* Start login code */
const validationRulesLogin = () => {
    return [
        // email validation
        body('email')
            .trim()
            .notEmpty().withMessage('Please enter email id.')
            .isEmail().withMessage('Please enter correct email id')
            .escape(),

        // password validation
        body('password')
            .trim()
            .notEmpty().withMessage('Please enter password.')
    ]
}

const validateLogin = (req, res, next) => {
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

/* end login code */

/* start of forget password */
const validationRulesForgetPassword = () => {
    return [
        // email validation
        body('email')
            .trim()
            .notEmpty().withMessage('Please enter email id.')
            .isEmail().withMessage('Please enter correct email id')
            .escape(),
    ]
}
/* end of forget password */

/* start of forget password */
const validationRulesChangePassword = () => {
    return [
        // email validation
        body('email')
            .trim()
            .notEmpty().withMessage('Please enter email id.')
            .isEmail().withMessage('Please enter correct email id')
            .escape(),

        // OTP validation
        body('otp')
            .trim()
            .notEmpty().withMessage('Please enter OTP.')
            .isInt({ min:1}).withMessage('Please enter correct OTP')
            .escape(),

        // password must be at least 5 chars long
        body('new_password')
            .trim()
            .notEmpty().withMessage('Please enter new password.')
            .isLength({ min: 5 }).withMessage('New password require minimun 5 Letters')
            .not()
            .isIn(['12345', 'password', 'god']).withMessage('Do not use a common word (such as 12345, password, god) as the password'),
    ]
}
/* end of forget password */


/* Token Authorization Start */
const validationRulesToken = () => {
    return [
        // header validation
        header('authorization')
        .exists({ checkFalsy: true })
        .withMessage("Missing Authorization Header") // you can specify the message to show if a validation has failed
        .bail() // not necessary, but it stops execution if previous validation failed
        //you can chain different validation rules 
        .contains("Bearer")
        .withMessage("Authorization Token is not Bearer")
        .custom((value,{ req, res }) => {
            var headerToken = (value).split(" ")[1];

            jwt.verify(headerToken, 'KT9@6!11O', function(err, decoded) {
                if (err) {
                    throw new Error('Token expired or incorrect!');
                }
            });
            // Indicates the success of this synchronous custom validator
            return true;
          })
    ]
}
/* Token Authorization End */


/* Start Login Resend OTP */

const validationRulesOtp = () => {
    return [
        // email validation
        query('email')
            .trim()
            .notEmpty().withMessage('Please enter email id.')
            .isEmail().withMessage('Please enter correct email id'),
    ]
}

/* End of Login Resend OTP */


module.exports = {
    validationRulesLogin,
    validateLogin,
    validationRulesToken,
    validationRulesForgetPassword,
    validationRulesChangePassword,
    validationRulesOtp
}