const AppError = require('../utils/apperror');
const {
  changeCamelCaseToNormalCase
} = require('../utils/changeCamelCaseToNormalCase');

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = (err) => {
  const [field, value] = Object.entries(err.errorResponse.keyValue)[0];
  const fieldNormalCase = changeCamelCaseToNormalCase(field);
  const message = `The ${fieldNormalCase} '${value}' is already in use. Please choose a different ${fieldNormalCase}.`;
  return new AppError(message, 400);
};

function sendDevError(res, err) {
  res.status(err.statusCode).send({
    message: err.message,
    status: err.status,
    statusCode: err.statusCode,
    stack: err.stack
  });
}

function sendProdError(res, err) {
  if (err.isOperational) {
    res.status(err.statusCode).send({
      status: err.status,
      message: err.message
    });
  } else {
    console.error(err);
    res.status(500).send({
      status: 'error',
      message: 'Something went very wrong '
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = Object.create(err);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.errorResponse?.code === 11000)
    error = handleDuplicateFieldsDB(error);
  if (process.env.NODE_ENV === 'dev') {
    sendDevError(res, error);
  } else if (process.env.NODE_ENV === 'prod') {
    sendProdError(res, error);
  }
};
