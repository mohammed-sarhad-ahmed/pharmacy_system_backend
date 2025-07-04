const express = require('express');
const { config } = require('dotenv');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('mongo-sanitize');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth_route');
const AppError = require('./utils/app_error');
const handleError = require('./handlers/error_handler');
const htmlTagSanitizer = require('./utils/html_tag_sanitizer');
const medicineRouter = require('./routes/medicine_route');

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

app.set('view engine', 'ejs');

app.use(cookieParser());

app.use(helmet());

const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use(limiter);

app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = req.query[key][0];
    }
  }

  req.body = htmlTagSanitizer(mongoSanitize(req.body));
  req.query = mongoSanitize(req.query);
  req.params = mongoSanitize(req.params);
  next();
});

app.use(express.static('public'));

app.use('/auth', authRouter);
app.use('/medicine', medicineRouter);

app.all('/{*everything}', (req, res, next) => {
  next(new AppError('route not found', 404));
});

app.use(handleError);

module.exports = app;
