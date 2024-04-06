var express = require('express');
var router = express.Router();

//Middleware
const { validationRules, validate } = require.main.require('../middleware/sports/sports.js');

var sportsModel = require.main.require('../model/sports/sports.model.js');

/* Sports List. */
router.get('/', async function(req, res, next) {
    sportsModel.sports_list(req, res);
});


/* Add New Sports. */
router.post('/add_sports', validationRules(), validate, async function(req, res, next) {
    sportsModel.sports_add(req, res);
});

module.exports = router;
