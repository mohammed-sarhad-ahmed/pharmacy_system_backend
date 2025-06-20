const express = require('express');
const { signup, signin } = require('../handlers/authhandler');

const Router = express.Router();

Router.post('/signup', signup);
Router.post('/signin', signin);

module.exports = Router;
