const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        'Business name is required. Please provide the name of your business.'
      ]
    },
    email: {
      type: String,
      required: [
        true,
        'Email address is required. Please enter your business email.'
      ],
      unique: true,
      validate: [
        {
          validator: validator.isEmail,
          message:
            'The email you entered is invalid. Please provide a valid email address.'
        }
      ]
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required.'],
      set: v => v.replace(/^\+9640/, '+964'),
      unique: true,
      validate: {
        validator: v => /^\+9647[578]\d{8}$/.test(v),
        message: props => `${props.value} is not a valid Iraqi phone number.`
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required. Please create a password.'],
      minlength: [8, 'Password must be at least 8 characters long.']
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        validator: function(passwordConfirm) {
          return this.password === passwordConfirm;
        },
        message:
          'Passwords do not match. Please make sure both entries are the same.'
      }
    }
  },
  {
    timestamps: true
  }
);

const UserModel = mongoose.model('User', userSchema);

exports.UserModel = UserModel;
