const { UserModel } = require('../model/user');

exports.signup = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password, passwordConfirm, role } =
      req.body;

    if (req.body.role?.toLowerCase() === 'admin') {
      return res
        .status(403)
        .json({ message: 'You cannot assign yourself as admin.' });
    }

    const newUser = await UserModel.create({
      name,
      email: {
        value: email
      },
      phoneNumber,
      password,
      passwordConfirm,
      role
    });
    res.status(200).send({
      status: 'Success',
      data: {
        newUser
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.signin = async (req, res, next) => {};
