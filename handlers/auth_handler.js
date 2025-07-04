const jwt = require('jsonwebtoken');
const validator = require('validator');
const { promisify } = require('util');
const { UserModel } = require('../model/user');
const AppError = require('../utils/app_error');
/* ignore next line if your are getting a waring vscode is being stupid */
const ResetEmail = require('../utils/reset_email');
const VerifyEmail = require('../utils/email_verification');
const htmlTagSanitizer = require('../utils/html_tag_sanitizer');
const generateSecureCode = require('../utils/generate_secure_code');
const shaHash = require('../utils/sha_hash');
const roleConfig = require('../utils/roleConfig');

function signTokenAsync(payload, secret, options) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
}

const sendVerifyToken = async (user, code, name = 'dear user') => {
  try {
    const verifyEmail = new VerifyEmail(
      'email_verification',
      name,
      user.email,
      'Email Verification',
      code
    );
    await verifyEmail.sendEmail();
  } catch (err) {
    console.error('Something went wrong during send the email');
    user.emailVerificationExpire = undefined;
    user.emailVerificationCode = undefined;
    await user.save({ validateModifiedOnly: true });
  }
};

const findUserWithCode = async (code, type) => {
  const hashedToken = shaHash(code);
  let options = {};
  if (type === 'password_reset') {
    options = {
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() }
    };
  } else if (type === 'email_verification') {
    options = {
      emailVerificationCode: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    };
  }
  const user = await UserModel.findOne(options);
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
      { id: user.id, tokenVersion: user.tokenVersion },
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
      const profile = await roleConfig[user.role].model.findOne({
        user: user._id
      });
      res.status(statusCode).json({
        status: 'success',
        data: {
          user,
          profile
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
  const { email, phoneNumber, password, passwordConfirm, role } = req.body;

  if (!role) {
    return next(
      new AppError('You have to provide a role', 400, 'field_missing_error')
    );
  }

  const normalizedRole = role.toLowerCase();

  if (normalizedRole === 'admin') {
    return next(
      new AppError(
        'You cannot assign yourself as admin.',
        403,
        'permission_error'
      )
    );
  }

  const config = roleConfig[normalizedRole];

  if (!config) {
    return next(
      new AppError(
        'The role you provided is invalid',
        400,
        'invalid_field_error'
      )
    );
  }
  const code = generateSecureCode(6);
  const codeExpire = new Date(Date.now() + 1000 * 10 * 60);

  const userData = {
    email: email.toLowerCase().trim(),
    phoneNumber,
    password,
    passwordConfirm,
    role: normalizedRole,
    tokenVersion: 1,
    emailVerificationCode: shaHash(code),
    emailVerificationExpire: codeExpire
  };

  const roleData = config.extract(req.body);
  const { model: RoleModel } = config;
  const newUser = await UserModel.create(userData);
  roleData.user = newUser._id;
  const profile = await RoleModel.create(roleData);
  res.status(200).json({
    status: 'success',
    message: 'Account creation was successful'
  });
  await sendVerifyToken(newUser, code, profile.name);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase()?.trim();
  const trimmedPassword = password?.trim();
  if (!normalizedEmail || !trimmedPassword) {
    return next(
      new AppError(
        'Please provide email and password.',
        400,
        'field_missing_error'
      )
    );
  }
  if (!validator.isEmail(normalizedEmail)) {
    return next(
      new AppError('Incorrect email or password', 401, 'invalid_field_error')
    );
  }
  const user = await UserModel.findOne({
    email: normalizedEmail
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('Incorrect email or password', 401, 'invalid_field_error')
    );
  }
  if (!user.isEmailVerified) {
    return next(
      new AppError('Please verify your email', 400, 'email_not_verified_error')
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

  if (currentUser.tokenVersion > decoded.tokenVersion) {
    return next(
      new AppError(
        'The login token is no longer valid, Please login again.',
        401,
        'invalid_token_error'
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
    if (!req.user || !roles.includes(req.user.role)) {
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
  const normalizedEmail = email?.toLowerCase()?.trim();
  const user = await UserModel.findOne({
    email: normalizedEmail,
    active: true
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

  const profile = await roleConfig[user.role].model.findOne({
    user: user._id,
    active: true
  });

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateModifiedOnly: true });

  const resetUrl = `${req.protocol}://${req.get('host')}/auth/password-reset-page/${resetToken}`;
  try {
    const resetEmail = new ResetEmail(
      'reset_password',
      profile.name,
      user.email,
      'Password Reset',
      resetUrl
    );
    await resetEmail.sendEmail();

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
  const user = await findUserWithCode(req.params.token, 'password_reset');

  if (!user) {
    return res.render('invalid_reset_token');
  }
  const { protocol } = req;
  const host = req.get('host');
  res.render('reset_password', { error: null, token, protocol, host });
};

exports.resetPassword = async (req, res, next) => {
  console.log(req.params.token);
  const user = await findUserWithCode(req.params.token, 'password_reset');
  if (!user) {
    return next(
      new AppError(
        'Token is either invalid or expired.',
        400,
        'invalid_token_error'
      )
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  await res.status(200).json({
    status: 'success'
  });
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

exports.updateMyPhoneNumber = async (req, res, next) => {
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
        400,
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
  const data = filterObj(req.body, 'phoneNumber');
  const user = await UserModel.findByIdAndUpdate(req.user.id, data, {
    runValidators: true,
    new: true
  });

  res.status(200).json({
    message: 'success',
    data: {
      user
    }
  });
};

exports.verifyEmail = async (req, res, next) => {
  const user = await findUserWithCode(
    req.params.emailVerificationCode,
    'email_verification'
  );
  if (!user) {
    return next(
      new AppError(
        'The code you have provided is either incorrect or expired, please send another request',
        400,
        'email_verification_error'
      )
    );
  }
  user.isEmailVerified = true;
  user.emailVerificationExpire = undefined;
  user.emailVerificationCode = undefined;
  await user.save({ validateModifiedOnly: true });
  console.log(`Email verified: ${user.email}`);
  await logUserIn(res, next, user, 200, true);
};

exports.deleteMe = async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(req.user.id, {
    active: false
  });
  if (!user) {
    return next(new AppError('User not found', 404, 'item_not_exist_error'));
  }

  const { model: ProfileModel } = roleConfig[user.role];

  await ProfileModel.findOneAndUpdate(
    {
      user: user.id
    },
    { active: false }
  );

  res.status(204).json({
    message: 'success'
  });
};

exports.sendVerifyCodeAgain = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(
      new AppError('Please provide an email', 400, 'field_missing_error')
    );
  }

  const normalizedEmail = email?.toLowerCase()?.trim();
  const user = await UserModel.findOne({
    email: normalizedEmail,
    active: true
  });

  if (!user) {
    const randomDelay = Math.floor(1823 + Math.random() * 1000);

    await new Promise((resolve) => {
      setTimeout(resolve, randomDelay);
    });

    return res.status(200).json({
      message:
        'If your email exists in our database, you have received the code again.'
    });
  }

  const code = generateSecureCode(6);
  user.emailVerificationCode = shaHash(code);
  user.emailVerificationExpire = new Date(Date.now() + 10 * 60 * 1000);

  const profile = await roleConfig[user.role].model.findOne({
    user: user._id,
    active: true
  });

  if (!profile) {
    return next(new AppError('Something went wrong', 500, 'generic_error'));
  }

  await Promise.all([
    user.save({ validateModifiedOnly: true }),
    sendVerifyToken(user, code, profile.name)
  ]);
  res.status(200).json({
    status: 'success',
    message:
      'If your email exists in our database, you have received the code again.'
  });
};

exports.logout = async (req, res, next) => {
  const user = await UserModel.findById(req.user.id);
  user.tokenVersion += 1;
  await user.save({
    validateModifiedOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
};

exports.updateMyEmail = async (req, res, next) => {
  res.status(501).json({
    message: 'not implemented yet!'
  });
};
