const { header } = require.main.require('../routes/require.js');
const { jwt } = require.main.require('../routes/require.js');

/* Token Authorization Start */
module.exports = validationRulesToken = () => {
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