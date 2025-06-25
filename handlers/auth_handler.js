const jwt = require('jsonwebtoken');
const validator = require('validator');
const { promisify } = require('util');
const crypto = require('crypto');
const { UserModel } = require('../model/user');
const AppError = require('../utils/app_error');
const sendEmail = require('../utils/email');

function signTokenAsync(payload, secret, options) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
}

async function logUserIn(res, next, user, sendUser = false) {
  try {
    const token = await signTokenAsync(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXP }
    );

    let data;

    if (sendUser) {
      data = {
        user,
        token
      };
    } else {
      data = {
        token
      };
    }
    res.status(201).json({
      status: 'success',
      data
    });
  } catch (err) {
    return next(
      new AppError(
        'Something went wrong while logging you in. Please try again later.',
        500
      )
    );
  }
}

exports.signup = async (req, res, next) => {
  const { name, email, phoneNumber, password, passwordConfirm, role } =
    req.body;

  if (req.body.role?.toLowerCase() === 'admin') {
    return next(new AppError('You cannot assign yourself as admin.', 403));
  }
  const newUser = await UserModel.create({
    name,
    email: email.toLowerCase().trim(),
    phoneNumber,
    password,
    passwordConfirm,
    role
  });
  await logUserIn(res, next, newUser, true);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email.trim() || !password.trim()) {
    return next(new AppError('Please provide email and password.', 400));
  }
  if (!validator.isEmail(email)) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const user = await UserModel.findOne({
    email: email.toLowerCase().trim()
  }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  await logUserIn(res, next, user, true);
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

//this is more readable than what eslint suggest
// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
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
    return res.status(200).json({
      message:
        'If your email exists in our database, you have received a link to reset your password'
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateModifiedOnly: true });

  const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
  const message = `You requested a password reset. Submit a request to: ${resetUrl}.\n\nThis link is valid for 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset (valid for 10 minutes)',
      message
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
        'Something went wrong during sending the email. Please try again later!'
      )
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('token is either invalid or expired.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  await logUserIn(res, next, user);
};

exports.updatePassword = async (req, res, next) => {
  const user = await UserModel.findOne({
    email: req.user.email
  });

  await user.correctPassword(req.body.oldPassword, user.password);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  await logUserIn(res, next, user);
};
