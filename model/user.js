const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const shaHash = require('../utils/sha_hash');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [
        true,
        'Email address is required. Please enter your business email.'
      ],
      unique: true,
      index: true,
      validate: [
        {
          validator: validator.isEmail,
          message:
            'The email you entered is invalid. Please provide a valid email address.'
        }
      ]
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    tokenVersion: {
      type: Number,
      required: true
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
      required: [true, 'First Phone number is required.'],
      set: (v) => {
        v = v.replace(/^0/, '').replace(/^\+9640/, '+964');
        if (!v.startsWith('+964')) v = `+964${v}`;
        return v;
      },
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
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    emailVerificationCode: String,
    emailVerificationExpire: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => {
  await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = shaHash(resetToken);
  this.passwordResetTokenExpires = 1000 * 60 * 10 + Date.now();

  return resetToken;
};

userSchema.set('toJSON', {
  transform: (_doc, ret, _options) => {
    delete ret.password;
    delete ret.passwordConfirm;
    delete ret.passwordResetToken;
    delete ret.passwordResetTokenExpires;
    delete ret.__v;
    delete ret.active;
    delete ret.emailVerificationCode;
    delete ret.emailVerificationExpire;
    delete ret.tokenVersion;
    return ret;
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // we need await do not remove it vscode is being stupid
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({
    active: { $ne: false }
  });

  next();
});

const UserModel = mongoose.model('User', userSchema);

exports.UserModel = UserModel;
