const express = require('express');

const Router = express.Router();

Router.route('/').path().get();

module.exports = Router;
