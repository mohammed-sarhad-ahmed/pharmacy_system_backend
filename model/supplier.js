const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'A user has to be linked a supplier']
    },
    name: {
      type: String,
      required: [true, 'The supplier name is required.']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Supplier', supplierSchema);
