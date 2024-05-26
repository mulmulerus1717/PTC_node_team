var express = require('express');
var router = express.Router();

//Middleware
const { validateRule } = require.main.require('../middleware/authorize/authorize.js')
const validationRulesToken = require.main.require('../routes/token.js');
const validationRulesTokenDestroy = require.main.require('../routes/token_destroy.js');

//Model
var tokenDestroyModel = require.main.require('../model/authorize/authorize.model.js');

/* authorize Form. */
router.get('/', validationRulesToken(), validateRule, function(req, res, next) {
    //valid token
    tokenDestroyModel.authorize(req, res);
});

/* authorize Destroy. */
router.get('/destroy', validationRulesTokenDestroy(), validateRule, function(req, res, next) {
    tokenDestroyModel.authorize_destroy(req, res);
});

/* authorize Form. */
router.get('/admin', validationRulesToken(), validateRule, function(req, res, next) {
    //valid token
    tokenDestroyModel.authorize_admin(req, res);
});

/* authorize Destroy. */
router.get('/destroy_admin', validationRulesTokenDestroy(), validateRule, function(req, res, next) {
    tokenDestroyModel.authorize_admin_destroy(req, res);
});


module.exports = router;
