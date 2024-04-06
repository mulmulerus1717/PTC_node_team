var express = require('express');
var router = express.Router();

//Middleware
const { validationRules, validate } = require.main.require('../middleware/location/location.js')

//Model
var locationModel = require.main.require('../model/location/location.model.js');

/* Location. */
router.get('/', validationRules(), validate, function(req, res, next) {
   locationModel.location(req, res);
});

module.exports = router;