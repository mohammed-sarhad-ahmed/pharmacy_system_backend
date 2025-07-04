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
    profilePicture: {
      type: String
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
