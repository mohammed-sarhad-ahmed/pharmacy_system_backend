const express = require('express');
const { protectRoute } = require('../handlers/auth_handler');
const { updateMe, uploadLogo } = require('../handlers/profile_handler');

const Router = express.Router();

Router.use(protectRoute);
Router.post('/update-me', uploadLogo, updateMe);

module.exports = Router;
