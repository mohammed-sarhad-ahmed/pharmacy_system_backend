const express = require('express');
const { signup, login } = require('../handlers/authhandler');

const Router = express.Router();

Router.post('/signup', signup);
Router.post('/login', login);

module.exports = Router;
