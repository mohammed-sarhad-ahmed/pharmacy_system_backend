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

Router.use(protectRoute);
Router.route('/')
  .post(restrictTo('supplier', 'admin'), addMedicine)
  .get(getMedicines);
Router.route('/:id')
  .get(getMedicine)
  .patch(restrictTo('supplier', 'admin'), updateMedicine)
  .delete(restrictTo('supplier', 'admin'), deleteMedicine);

module.exports = Router;
