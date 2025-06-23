// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { promisify } = require('util');
const { UserModel } = require('../model/user');
const AppError = require('../utils/apperror');

function signJwtAsync(payload, secret, options) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    });
  });
}

exports.signup = async (req, res, next) => {
  const { name, email, phoneNumber, password, passwordConfirm, role } =
    req.body;

  if (req.body.role?.toLowerCase() === 'admin') {
    return next(new AppError('You cannot assign yourself as admin.', 403));
  }
  const newUser = await UserModel.create({
    name,
    email,
    phoneNumber,
    password,
    passwordConfirm,
    role
  });
  newUser.password = undefined;
  res.status(200).json({
    status: 'success',
    data: {
      newUser
    }
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email.trim() || !password.trim()) {
    return next(new AppError('Please provide email and password.', 400));
  }
  if (!validator.isEmail(email)) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const user = UserModel.find();
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = await signJwtAsync({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP
  });

  res.status(200).json({
    status: 'success',
    token
  });
};

exports.protectRoute = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await UserModel.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = currentUser;
  next();
};
