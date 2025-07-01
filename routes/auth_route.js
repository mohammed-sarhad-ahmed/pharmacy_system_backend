const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updateMyPassword,
  protectRoute,
  updateMe,
  deleteMe,
  updateMyEmail,
  showResetPasswordPage,
  sendVerifyCodeAgain
} = require('../handlers/auth_handler');

const Router = express.Router();

Router.post('/signup', signup);
Router.post('/login', login);
Router.post('/forgot-password', forgotPassword);
Router.get('/password-reset-page/:token', showResetPasswordPage);
Router.get('/get-verification-code-again', sendVerifyCodeAgain);
Router.patch('/reset-password/:token', resetPassword);
Router.patch('/update-my-password', protectRoute, updateMyPassword);
Router.patch('/update-my-email', protectRoute, updateMyEmail);
Router.patch('/update-me', protectRoute, updateMe);
Router.patch('/delete-me', protectRoute, deleteMe);

module.exports = Router;
