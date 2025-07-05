const SupplierModel = require('../model/supplier');
const PharmacyModel = require('../model/pharmacy');

// eslint-disable-next-line arrow-body-style
const baseExtractor = ({ name, phoneNumber }) => {
  return { name, phoneNumber };
};

module.exports = {
  pharmacy: {
    model: PharmacyModel,
    extract: (obj) => {
      const filteredObj = baseExtractor(obj);

      return filteredObj;
    }
  },
  supplier: {
    model: SupplierModel,
    extract: (obj) => {
      const filteredObj = baseExtractor(obj);

      return filteredObj;
    }
  }
};
