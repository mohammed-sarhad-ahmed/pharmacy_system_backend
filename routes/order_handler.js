const express = require('express');
const { protectRoute, restrictTo } = require('../handlers/auth_handler');
const {
  getOrder,
  addOrder,
  getOrders,
  deleteOrder,
  updateOrder
} = require('../handlers/order_handler');

const Router = express.Router();

Router.use(protectRoute);

Router.route('/')
  .get(getOrders)
  .post(restrictTo('admin', 'supplier'), addOrder);

Router.route('/:id')
  .get(getOrder)
  .patch(restrictTo('admin', 'supplier'), updateOrder)
  .delete(restrictTo('admin', 'supplier'), deleteOrder);

module.exports = Router;
