const { query,validationResult } = require.main.require('../routes/require.js');

/* Location Validation */
const validationRules = () => {
    return [

        // Location validation
        query('name')
            .trim()
            .notEmpty().withMessage('Please enter Location Name.')
            .isLength({ min: 3 }).withMessage('Location name must be of 3 characters long.')
            .matches(/^[A-Za-z\s]+$/).withMessage('Location name must be alphabetic.')
            .escape(),

        // Location validation
        query('id')
            .trim()
            .notEmpty().withMessage('Please select location id.')
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

/* End of location validation */


module.exports = {
    validationRules,
    validate
}