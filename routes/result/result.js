var express = require('express');
var router = express.Router();

//Middleware
const { validationRules,validationRulesAddResult,validationRulesAllResult,validateRule } = require.main.require('../middleware/result/result.js')
const validationRulesToken = require.main.require('../routes/token.js');

//Model
var resultModel = require.main.require('../model/result/result.model.js');

/* result list. */
router.get('/', validationRulesToken(), validationRules(), validateRule, function(req, res, next) {
    resultModel.result_list(req, res);
});


/* Add result. */
router.post('/add', validationRulesToken(), validationRulesAddResult(), validateRule, function(req, res, next) {
    resultModel.result_add(req, res);
});


/* All result. */
router.post('/all_result', validationRulesToken(), validationRulesAllResult(), validateRule, function(req, res, next) {
    resultModel.all_result(req, res);
});

module.exports = router;
