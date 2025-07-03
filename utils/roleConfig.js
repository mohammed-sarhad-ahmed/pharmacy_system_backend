const SupplierModel = require('../model/supplier');
const PharmacyModel = require('../model/pharmacy');

module.exports = {
  pharmacy: {
    model: PharmacyModel,
    // eslint-disable-next-line arrow-body-style
    extract: ({ name, location }) => {
      return { name, location };
    }
  },
  supplier: {
    model: SupplierModel,
    // eslint-disable-next-line arrow-body-style
    extract: ({ name }) => {
      return { name };
    }
  }
};
