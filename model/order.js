const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    medicines: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          required: [true, 'Medicine id is required'],
          ref: 'Medicine'
        }
      ],

      validation: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one medicine has to be in an order'
      }
    },
    pharmacy: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Pharmacy id is required'],
      ref: 'Pharmacy'
    },
    supplier: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Supplier id is required'],
      ref: 'Supplier'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Medicine', orderSchema);
