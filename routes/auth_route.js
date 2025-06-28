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
  showResetPasswordPage
} = require('../handlers/auth_handler');

const Router = express.Router();

Router.post('/signup', signup);
Router.post('/login', login);
Router.post('/forgot-password', forgotPassword);
Router.patch('/reset-password/:token', resetPassword);
Router.get('/password-reset-page/:token', showResetPasswordPage);

//add all protected routes after next line
Router.use(protectRoute);
Router.patch('/update-my-password', protectRoute, updateMyPassword);
Router.patch('/update-my-email', protectRoute, updateMyEmail);
Router.patch('/update-me', protectRoute, updateMe);
Router.patch('/delete-me', protectRoute, deleteMe);

module.exports = Router;
