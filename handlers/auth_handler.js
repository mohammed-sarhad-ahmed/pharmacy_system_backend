const jwt = require('jsonwebtoken');
const validator = require('validator');
const { promisify } = require('util');
const crypto = require('crypto');
const { UserModel } = require('../model/user');
const AppError = require('../utils/app_error');
const sendEmail = require('../utils/email');
const htmlTagSanitizer = require('../utils/html_tag_sanitizer');

function signTokenAsync(payload, secret, options) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
}

const findUserWithResetToken = async (req) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() }
  });
  return user;
};

function filterObj(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) {
      newObj[field] = obj[field];
    }
  });
  return newObj;
}

async function logUserIn(res, next, user, statusCode, sendUser = false) {
  try {
    const token = await signTokenAsync(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXP }
    );
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXP * 1000 * 3600 * 24
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'prod') {
      cookieOptions.secure = true;
    }

    res.cookie('jwt', token, cookieOptions);

    if (sendUser) {
      res.status(statusCode).json({
        status: 'Success',
        data: {
          user
        }
      });
    } else {
      res.status(statusCode).json({
        status: 'success'
      });
    }
  } catch (err) {
    return next(
      new AppError(
        'Something went wrong while logging you in. Please try again later.',
        500,
        'server_error'
      )
    );
  }
}

exports.signup = async (req, res, next) => {
  const {
    name,
    email,
    phoneNumberOne,
    phoneNumberTwo,
    password,
    passwordConfirm,
    role
  } = req.body;

  if (req.body.role?.toLowerCase() === 'admin') {
    return next(
      new AppError(
        'You cannot assign yourself as admin.',
        403,
        'permission_error'
      )
    );
  }
  const newUser = await UserModel.create({
    name,
    email: email.toLowerCase().trim(),
    phoneNumberOne,
    phoneNumberTwo,
    password,
    passwordConfirm,
    role
  });
  await logUserIn(res, next, newUser, 201, true);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email.trim() || !password.trim()) {
    return next(
      new AppError(
        'Please provide email and password.',
        400,
        'field_missing_error'
      )
    );
  }
  if (!validator.isEmail(email.trim().toLowerCase())) {
    return next(
      new AppError('Incorrect email or password', 401, 'invalid_field_error')
    );
  }
  const user = await UserModel.findOne({
    email: email.toLowerCase().trim()
  }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('Incorrect email or password', 401, 'invalid_field_error')
    );
  }
  await logUserIn(res, next, user, 200, true);
};

exports.protectRoute = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to get access.',
        401,
        'authentication_error'
      )
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await UserModel.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
        'item_not_exist_error'
      )
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again.',
        401,
        'field_changed_error'
      )
    );
  }

  req.user = currentUser;
  next();
};

//this is more readable than what eslint suggest
// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403,
          'permission_error'
        )
      );
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await UserModel.findOne({
    email: email.toLowerCase().trim()
  });

  if (!user) {
    const randomDelay = Math.floor(1823 + Math.random() * 1000);

    await new Promise((resolve) => {
      setTimeout(resolve, randomDelay);
    });

    return res.status(200).json({
      message:
        'If your email exists in our database, you have received a link to reset your password'
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateModifiedOnly: true });

  const resetUrl = `${req.protocol}://${req.get('host')}/auth/password-reset-page/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      name: user.name,
      subject: 'Password reset (valid for 10 minutes)',
      resetUrl
    });

    res.status(200).json({
      message:
        'If your email exists in our database, you have received a link to reset your password'
    });
  } catch (err) {
    user.passwordResetTokenExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateModifiedOnly: true });
    console.error('Email send error:', err);
    return next(
      new AppError(
        'Something went wrong during sending the email. Please try again later!',
        500,
        'server_error'
      )
    );
  }
};

exports.showResetPasswordPage = async (req, res, next) => {
  const token = htmlTagSanitizer(req.params.token);
  if (!token || token.trim() === '') {
    return res.render('reset_password', {
      error: 'No token was provided. This page is only for valid users'
    });
  }
  const user = await findUserWithResetToken(req);
  if (!user) {
    return res.render('reset_password', {
      error: 'invalid token'
    });
  }
  const { protocol } = req;
  const host = req.get('host');
  res.render('reset_password', { error: null, token, protocol, host });
};

exports.resetPassword = async (req, res, next) => {
  const user = await findUserWithResetToken(req);
  if (!user) {
    return next(
      new AppError('Token is either invalid or expired.', 400, 'invalid_token')
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  await logUserIn(res, next, user, 200);
};

exports.updateMyPassword = async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  if (!currentPassword || !password || !passwordConfirm) {
    return next(
      new AppError(
        'Please provide all password fields',
        400,
        'field_missing_error'
      )
    );
  }

  const user = await UserModel.findById(req.user.id).select('+password');

  const isCorrect = await user.correctPassword(currentPassword, user.password);
  if (!isCorrect) {
    return next(
      new AppError(
        'Your current password is not correct',
        401,
        'field_incorrect_error'
      )
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  await logUserIn(res, next, user, 200);
};

exports.updateMe = async (req, res, next) => {
  if (req.body.passwordConfirm || req.body.password) {
    return next(
      new AppError(
        'You can not use this route to change password, Please use /auth/update-my-password',
        400,
        'wrong_path_error'
      )
    );
  }

  if (req.body.email) {
    return next(
      new AppError(
        'You can not use this route to change email, Please use /auth/update-my-email',
        'wrong_path_error'
      )
    );
  }
  if (req.body.role?.toLowerCase() === 'admin') {
    return next(
      new AppError(
        'You cannot assign yourself as admin.',
        403,
        'permission_error'
      )
    );
  }
  const data = filterObj(req.body, 'name', 'phoneNumberOne', 'PhoneNumberTwo');
  const user = await UserModel.findByIdAndUpdate(req.user.id, data, {
    runValidators: true,
    new: true
  });

  res.status(200).json({
    message: 'Success',
    data: {
      user
    }
  });
};

exports.deleteMe = async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.user.id, {
    active: false
  });
  res.status(204).json({
    message: 'Success'
  });
};

exports.updateMyEmail = async (req, res, next) => {
  res.status(204).json({
    message: 'not implemented yet!'
  });
};
