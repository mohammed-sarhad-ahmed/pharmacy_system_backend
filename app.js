const express = require('express');
const { config } = require('dotenv');
const authRouter = require('./routes/authroute');

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

app.use(express.json());

app.use('/auth', authRouter);

app.all('*', (req, res, next) => {
  next('wrote was not found');
});

app.use((err, req, res, next) => {
  res.send(err);
});

module.exports = app;
