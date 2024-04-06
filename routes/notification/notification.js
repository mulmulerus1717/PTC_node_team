var express = require('express');
var router = express.Router();

//Middleware
const { validateRule, addNotificationValidationRules, seenNotificationValidationRules } = require.main.require('../middleware/notification/notification.js')
const validationRulesToken = require.main.require('../routes/token.js');

//Model
var notificationModel = require.main.require('../model/notification/notification.model.js');

/* notification fetch */
router.post('/', validationRulesToken(), validateRule, function(req, res, next) {
    notificationModel.notifications_listing(req, res);
});


/* notification add */
router.post('/add', validationRulesToken(), addNotificationValidationRules(), validateRule, function(req, res, next) {
    notificationModel.notifications_add(req, res);
});


/* notification count */
router.get('/notification_count', validationRulesToken(), validateRule, function(req, res, next) {
    notificationModel.notifications_count(req, res);
});

/* notification update */
router.post('/notification_seen', validationRulesToken(), seenNotificationValidationRules(), validateRule, function(req, res, next) {
    notificationModel.notification_seen(req, res);
});

module.exports = router;
