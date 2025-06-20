const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    passwordConfirm: {
      type: String,
      required: true,
      minlength: 8
    }
  },
  {
    timestamps: true
  }
);

const UserModel = mongoose.model('User', userSchema);

exports.UserModel = UserModel;
