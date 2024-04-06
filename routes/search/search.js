var express = require('express');
var router = express.Router();

//Middleware
const { validateRule,validationRulesSearch,validationRules,validationRulesAccept } = require.main.require('../middleware/search/search.js')
const validationRulesToken = require.main.require('../routes/token.js');

//Model
var searchModel = require.main.require('../model/search/search.model.js');

/* Search Form. */
router.post('/', validationRulesToken(), validationRulesSearch(), validateRule, function(req, res, next) {
    searchModel.search_team(req, res);
});

/* Start Send challenge Form */
router.post('/send_challenge', validationRulesToken(), validationRules(), validateRule, function(req, res, next) {
    searchModel.send_challenge(req, res);
});
/* End Send challenge Form */

/* Start Receive challenge Form */
router.post('/receive_challenge', validationRulesToken(), validationRulesSearch(), validateRule, function(req, res, next) {
    searchModel.receive_challenge(req, res);
});
/* End Receive challenge Form */

/* Start Accept challenge Form */
router.post('/accept_challenge', validationRulesToken(), validationRulesAccept(), validateRule, function(req, res, next) {
    searchModel.accept_challenge(req, res);
});
/* End Accept challenge Form */


/* Start Reject challenge Form */
router.post('/reject_challenge', validationRulesToken(), validationRulesAccept(), validateRule, function(req, res, next) {
    searchModel.reject_challenge(req, res);
});
/* End Reject challenge Form */


/* count challenges. */
router.get('/challenges_count', validationRulesToken(), validateRule, function(req, res, next) {
    searchModel.challenges_count(req, res);
});

/* update count challenges. */
router.get('/update_challenges_count', validationRulesToken(), validateRule, function(req, res, next) {
    searchModel.update_challenges_count(req, res);
});

module.exports = router;
