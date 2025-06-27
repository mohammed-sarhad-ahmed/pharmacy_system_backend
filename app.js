const express = require('express');
const { config } = require('dotenv');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
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

// app.use(helmet());

// const limiter = rateLimit({
//   limit: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!'
// });

// app.use(limiter);

app.use(
  express.json({
    limit: '10kb'
  })
);

// app.use(mongoSanitize());

// app(hpp());

app.use('/auth', authRouter);

app.all('/{*everything}', (req, res, next) => {
  next(new AppError('route not found', 404));
});

app.use(handleError);

module.exports = app;
