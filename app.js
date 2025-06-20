const express = require('express');
const { config } = require('dotenv');

const app = express();

if (process.env.NODE_ENV === 'dev') {
  config({
    path: './dev.env'
  });
} else {
  config({
    path: './prod.env'
  });
}

module.exports = app;
