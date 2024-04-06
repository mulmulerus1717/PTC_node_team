var express = require('express');
var router = express.Router();

//Middleware
const { validationRules, validate, validationRulesOtp, validateOtp, resendValidationRulesOtp, resendValidateOtp } = require.main.require('../middleware/signup/signup.js')

//Model
var signupModel = require.main.require('../model/signup/signup.model.js');

/* Signup Form. */
router.post('/', validationRules(), validate, function(req, res, next) {
    signupModel.save_team(req, res);
});

/* Signup Form OTP. */
router.get('/otp_verification', validationRulesOtp(), validateOtp, function(req, res, next) {
    signupModel.validateOTP(req, res);
});

/* Signup Form OTP. */
router.get('/otp_resend', resendValidationRulesOtp(), resendValidateOtp, function(req, res, next) {
    signupModel.resendOTP(req, res);
});


/* Signup Form OTP Email Verify. */
router.get('/otp_resend_email_verify', resendValidationRulesOtp(), resendValidateOtp, function(req, res, next) {
    signupModel.resendOTPEmailVerify(req, res);
});


/* Signup with Facebook. */
router.get('/data_deletion_facebook', function(req, res, next) {
    signupModel.datadeletionfacebook(req, res);
});

module.exports = router;
