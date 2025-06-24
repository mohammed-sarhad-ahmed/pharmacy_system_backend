const express = require('express');
const { config } = require('dotenv');
const authRouter = require('./routes/auth_route');
const AppError = require('./utils/app_error');
const handleError = require('./handlers/error_handler');

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
