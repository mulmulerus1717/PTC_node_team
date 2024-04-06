var express = require('express');
var router = express.Router();

//Middleware
const { validationRules,validateRule } = require.main.require('../middleware/block/block.js')
const validationRulesToken = require.main.require('../routes/token.js');

//Model
var blockModel = require.main.require('../model/block/block.model.js');

/* block list. */
router.post('/', validationRulesToken(), validateRule, function(req, res, next) {
    blockModel.block_list(req, res);
});


/* Add block. */
router.post('/add', validationRulesToken(), validationRules(), validateRule, function(req, res, next) {
    blockModel.block_add(req, res);
});

/* Unblock. */
router.post('/unblock', validationRulesToken(), validationRules(), validateRule, function(req, res, next) {
    blockModel.unblock(req, res);
});

module.exports = router;
