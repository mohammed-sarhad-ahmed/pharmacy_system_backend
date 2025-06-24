const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword
} = require('../handlers/auth_handler');

const Router = express.Router();

Router.post('/signup', signup);
Router.post('/login', login);

Router.post('/forgot-password', forgotPassword);
Router.patch('/reset-password/:token', resetPassword);

module.exports = Router;
