const mongoose = require('mongoose');

const pharmacySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'A user has to be linked a pharmacy']
    },
    name: {
      type: String,
      required: [true, 'The pharmacy name is required.']
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

module.exports = mongoose.model('Pharmacy', pharmacySchema);
