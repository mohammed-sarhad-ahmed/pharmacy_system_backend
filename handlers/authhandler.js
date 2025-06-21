const { UserModel } = require('../model/user');
const AppError = require('../utils/apperror');

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
  await res.status(200).send({
    status: 'Success',
    data: {
      newUser
    }
  });
};

exports.signin = async (req, res, next) => {};
