const AppError = require('../utils/app_error');
const {
  changeCamelCaseToNormalCase
} = require('../utils/change_camel_case_to_normal_case');

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(' & ')}`;
  return new AppError(message, 400, 'validation_error');
};

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'cast_error');
}

const handleDuplicateFieldsDB = (err) => {
  const [field, value] = Object.entries(err.errorResponse.keyValue)[0];
  const fieldNormalCase = changeCamelCaseToNormalCase(field);
  const message = `The ${fieldNormalCase} '${value}' is already in use.`;
  return new AppError(message, 400, 'duplicated_field_error');
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401, 'jwt_error');

const handleJWTExpiredError = () =>
  new AppError(
    'Your token has expired! Please log in again.',
    401,
    'jwt_expired'
  );

function sendDevError(res, err) {
  res.status(err.statusCode).send({
    message: err.message,
    type: err.type,
    error: err,
    status: err.status,
    statusCode: err.statusCode,
    stack: err.stack
  });
}

function sendProdError(res, err) {
  if (err.isOperational) {
    res.status(err.statusCode).send({
      status: err.status,
      type: err.type,
      message: err.message
    });
  } else {
    console.error(err);
    res.status(500).send({
      status: 'error',
      type: 'generic_error',
      message: 'Something went very wrong.'
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.type = err.type || 'generic_error';
  let error = Object.create(err);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.errorResponse?.code === 11000)
    error = handleDuplicateFieldsDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'dev') {
    sendDevError(res, error);
  } else if (process.env.NODE_ENV === 'prod') {
    sendProdError(res, error);
  }
};
