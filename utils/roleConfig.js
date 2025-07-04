const SupplierModel = require('../model/supplier');
const PharmacyModel = require('../model/pharmacy');

module.exports = {
  pharmacy: {
    model: PharmacyModel,
    // eslint-disable-next-line arrow-body-style
    extract: ({ name, profilePicture }) => {
      return { name, profilePicture };
    }
  },
  supplier: {
    model: SupplierModel,
    // eslint-disable-next-line arrow-body-style
    extract: ({ name, profilePicture }) => {
      return { name, profilePicture };
    }
  }
};
