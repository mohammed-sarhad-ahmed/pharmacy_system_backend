const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'A user has to be linked a supplier']
    },
    name: {
      type: String,
      required: [true, 'The supplier name is required.']
    },
    logo: {
      type: String
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

module.exports = mongoose.model('Supplier', supplierSchema);
