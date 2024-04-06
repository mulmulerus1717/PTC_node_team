var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({status:200, message:'respond with a resource'});
});

module.exports = router;
