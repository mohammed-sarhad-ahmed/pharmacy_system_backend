const { UserModel } = require('../model/user');

exports.signup = async (req, res, next) => {
  try {
    await UserModel.create(req.body);
  } catch (error) {
    console.log('error happened :' + error.message);
  }
  res.end();
};

exports.signin = async (req, res, next) => {};
