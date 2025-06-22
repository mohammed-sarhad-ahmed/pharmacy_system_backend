const jwt = require('jsonwebtoken');
const validator = require('validator');
const { UserModel } = require('../model/user');
const AppError = require('../utils/apperror');
const convertPhoneNumberForDbSearch = require('../utils/convertphonenumberfordbsearch');

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
  const { identifier, password } = req.body;
  if (!identifier.trim() || !password.trim()) {
    return next(
      new AppError(
        'Please provide identifier (email or phone number) and password.',
        400
      )
    );
  }
  let user;
  if (validator.isEmail(identifier)) {
    const email = identifier;
    user = await UserModel.findOne({
      email: email.toLowerCase()
    }).select('+password');
  } else {
    const phoneNumber = convertPhoneNumberForDbSearch(identifier);
    user = await UserModel.findOne({
      phoneNumber
    }).select('+password');
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect identifier or password', 401));
  }
  const token = await signJwtAsync({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP
  });

  res.status(200).json({
    status: 'success',
    token
  });
};
