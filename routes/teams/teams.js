var express = require('express');
var router = express.Router();

//Middleware
const { validateRule,validationRulesTeams,validationRules,validationRulesAccept,validationRulesCitySports,validationRulesAddSport } = require.main.require('../middleware/teams/teams.js')
const validationRulesToken = require.main.require('../routes/token.js');

//Model
var teamsModel = require.main.require('../model/teams/teams.model.js');

/* Start Receive request Form */
router.post('/receive_request', validationRulesToken(), validationRulesTeams(), validateRule, function(req, res, next) {
    teamsModel.receive_challenge(req, res);
});
/* End Receive request Form */


/* Start accept request Form */
router.post('/accept_request', validationRulesToken(), validationRulesAccept(), validateRule, function(req, res, next) {
    teamsModel.accept_request(req, res);
});
/* End accept request Form */

/* Start reject request Form */
router.post('/reject_request', validationRulesToken(), validationRulesAccept(), validateRule, function(req, res, next) {
    teamsModel.reject_request(req, res);
});
/* End reject request Form */

/* Start reject request Form */
router.post('/team_players', validationRulesToken(), validateRule, function(req, res, next) {
    teamsModel.team_players(req, res);
});
/* End reject request Form */

module.exports = router;
