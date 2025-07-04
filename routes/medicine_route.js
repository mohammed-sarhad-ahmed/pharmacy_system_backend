const express = require('express');
const {
  addMedicine,
  getMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine
} = require('../handlers/medicine_handler');
const { protectRoute, restrictTo } = require('../handlers/auth_handler');

const Router = express.Router();

Router.use(protectRoute, restrictTo('supplier', 'admin'));
Router.route('/').post(addMedicine).get(getMedicines);
Router.route('/:id')
  .get(getMedicine)
  .patch(updateMedicine)
  .delete(deleteMedicine);

module.exports = Router;
