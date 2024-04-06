var express = require('express');
var router = express.Router();

//Middleware
const { validationRulesListing,validationRulesAccept,validationRulesSendMessage,validateRule } = require.main.require('../middleware/chat/chat.js')
const validationRulesToken = require.main.require('../routes/token.js');

//Model
var chatModel = require.main.require('../model/chat/chat.model.js');

/* Search Form. */
router.post('/', validationRulesToken(), validationRulesListing(), validateRule, function(req, res, next) {
    chatModel.chat_list(req, res);
});

/* Chat message list. */
router.post('/chat_messages', validationRulesToken(), validationRulesAccept(), validateRule, function(req, res, next) {
    chatModel.chat_message(req, res);
});


/* send message. */
router.post('/send_messages', validationRulesToken(), validationRulesSendMessage(), validateRule, function(req, res, next) {
    chatModel.send_messages(req, res);
});


/* count message. */
router.get('/message_count', validationRulesToken(), validateRule, function(req, res, next) {
    chatModel.message_count(req, res);
});

/* update count message. */
router.get('/update_message_count', validationRulesToken(), validateRule, function(req, res, next) {
    chatModel.update_message_count(req, res);
});

module.exports = router;
