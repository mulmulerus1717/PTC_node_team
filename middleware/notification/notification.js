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


/* start add notification */
const addNotificationValidationRules = () => {
    return [
        body('token_id')
            .trim()
            .notEmpty().withMessage('Please enter token id.')
            .isLength({ min: 1 }).withMessage('Token id required')
            .matches(/^[A-Za-z0-9\s]+$/).withMessage('Token id must be alphabets and numbers.'),

        body('description')
            .trim()
            .notEmpty().withMessage('Please enter description.')
            .isLength({ min: 1 }).withMessage('description required'),

        body('link')
            .trim()
            .notEmpty().withMessage('Please enter link.')
            .isLength({ min: 1 }).withMessage('link required'),
    ]
}
/* end add notification */



/* start update seen notification */
const seenNotificationValidationRules = () => {
    return [
        body('notification_id')
            .trim()
            .notEmpty().withMessage('Notification id cannot be empty.')
            .isLength({ min: 1 }).withMessage('Notification id required.')
            .matches(/^[0-9\s]+$/).withMessage('Notification id must be numbers.'),
    ]
}
/* end update seen notification */

module.exports = {
    validateRule,
    addNotificationValidationRules,
    seenNotificationValidationRules
}