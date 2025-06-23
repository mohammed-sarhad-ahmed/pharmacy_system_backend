const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword
} = require('../handlers/authhandler');

const Router = express.Router();

Router.post('/signup', signup);
Router.post('/login', login);

Router.post('/forgotpassword', forgotPassword);
Router.post('/resetpassword', resetPassword);

module.exports = Router;
