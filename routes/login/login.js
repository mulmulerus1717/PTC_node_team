var express = require('express');
var router = express.Router();

//Middleware
const { 
    validationRulesLogin, 
    validateLogin, 
    validationRulesToken, 
    validationRulesForgetPassword,
    validationRulesChangePassword,
    validationRulesOtp } = require.main.require('../middleware/login/login.js')

//Model
var loginModel = require.main.require('../model/login/login.model.js');

/* Login Form. */
router.post('/', validationRulesLogin(), validateLogin, function(req, res, next) {
    loginModel.login_team(req, res);
});

/* Forget Password */
router.post('/forget_password', validationRulesForgetPassword(), validateLogin, function(req, res, next) {
    loginModel.forget_password(req, res);
});

/* Forget Password OTP Validate */
router.post('/change_password', validationRulesChangePassword(), validateLogin, function(req, res, next) {
    loginModel.change_password(req, res);
});

//sample APis for all authorization 
router.get('/token_with_author', validationRulesLogin(), validationRulesToken(), validateLogin, function(req, res, next) {
    res.send(req.headers["authorization"]);
});

/* Login Form OTP. */
router.get('/otp_resend', validationRulesOtp(), validateLogin, function(req, res, next) {
    loginModel.resendOTP(req, res);
});

/* Login Form. */
router.post('/admin_login', validationRulesLogin(), validateLogin, function(req, res, next) {
    loginModel.login_admin_team(req, res);
});

module.exports = router;