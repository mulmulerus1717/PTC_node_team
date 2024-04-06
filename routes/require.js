const { body, validationResult } = require('express-validator');
const { query } = require('express-validator');
const { header } = require('express-validator');
const { check } = require('express-validator');
const jwt = require('jsonwebtoken');

module.exports = {
    body,
    validationResult,
    jwt,
    header,
    query,
    check
}