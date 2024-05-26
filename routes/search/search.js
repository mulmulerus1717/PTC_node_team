var express = require('express');
var router = express.Router();

//Middleware
const { validateRule,validationRulesSearch,validationRules,validationRulesAccept,validationRulesCitySports,validationRulesAddSport } = require.main.require('../middleware/search/search.js')
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


/* Search city sports. */
router.post('/city_sports', validationRulesToken(), validationRulesCitySports(), validateRule, function(req, res, next) {
    searchModel.search_city_sports(req, res);
});

/* Add city sports. */
router.post('/add_sports', validationRulesToken(), validationRulesAddSport(), validateRule, function(req, res, next) {
    searchModel.add_sports_city(req, res);
});

router.post('/add_link', validationRulesAccept(), validateRule, function(req, res, next) {
    searchModel.add_link(req, res);
});

router.post('/all_challenges', validationRulesSearch(), function(req, res, next) {
    searchModel.all_challenges(req, res);
});

router.post('/live_match', validationRulesAccept(), function(req, res, next) {
    searchModel.live_match(req, res);
});

router.post('/add_team', validationRulesToken(), validateRule, function(req, res, next) {
    searchModel.add_team(req, res);
});

router.post('/all_teams', validationRulesToken(), function(req, res, next) {
    searchModel.all_teams(req, res);
});

router.post('/add_player', validationRulesToken(), validateRule, function(req, res, next) {
    searchModel.add_player(req, res);
});

router.post('/add_turf_matches', validationRulesToken(), validateRule, function(req, res, next) {
    searchModel.add_turf_matches(req, res);
});

router.post('/all_teams_players', validationRulesToken(), validateRule, function(req, res, next) {
    searchModel.all_teams_players(req, res);
});

router.post('/delete_player', validationRulesToken(), validateRule, function(req, res, next) {
    searchModel.delete_player(req, res);
});

router.post('/all_matches', validationRulesToken(), validateRule, function(req, res, next) {
    searchModel.all_matches(req, res);
});

router.post('/update_turf_matches', validationRulesToken(), validateRule, function(req, res, next) {
    searchModel.update_turf_matches(req, res);
});

router.post('/delete_match', validationRulesToken(), validateRule, function(req, res, next) {
    searchModel.delete_match(req, res);
});

router.post('/live_result', validationRulesAccept(), function(req, res, next) {
    searchModel.live_result(req, res);
});

router.post('/live_result_players', validationRulesAccept(), function(req, res, next) {
    searchModel.live_result_players(req, res);
});

router.post('/delete_team', validationRulesAccept(), function(req, res, next) {
    searchModel.delete_team(req, res);
});

router.post('/admin_stats', validationRulesAccept(), function(req, res, next) {
    searchModel.admin_stats(req, res);
});

module.exports = router;
