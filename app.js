const express = require('express');
const { config } = require('dotenv');
const authRouter = require('./routes/authroute');
const AppError = require('./utils/apperror');
const handleError = require('./handlers/errorhandler');

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

app.all('/{*everything}', (req, res, next) => {
  next(new AppError('route not found', 404));
});

app.use(handleError);

module.exports = app;
