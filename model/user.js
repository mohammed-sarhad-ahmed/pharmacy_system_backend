const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
      value: {
        type: String,
        index: true,
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
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    role: {
      type: String,
      enum: ['pharmacy', 'supplier', 'delivery', 'admin'],
      required: [true, 'Role is required. Please enter your role.'],
      validate: {
        validator: function (val) {
          if (this.isNew && val === 'admin') return false;
          return true;
        },
        message: 'You are not allowed to register as an admin.'
      }
    },
    approved: {
      type: Boolean,
      default: false
    },
    phoneNumber: {
      type: String,
      index: true,
      required: [true, 'Phone number is required.'],
      set: (v) => v.replace(/^\+9640/, '+964'),
      unique: true,
      validate: {
        validator: (v) => /^\+9647[578]\d{8}$/.test(v),
        message: (props) => `${props.value} is not a valid Iraqi phone number.`
      }
    },
    password: {
      type: String,
      select: false,
      required: [true, 'Password is required. Please create a password.'],
      minlength: [8, 'Password must be at least 8 characters long.']
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        validator: function (passwordConfirm) {
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

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => {
  await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});

const UserModel = mongoose.model('User', userSchema);

exports.UserModel = UserModel;
