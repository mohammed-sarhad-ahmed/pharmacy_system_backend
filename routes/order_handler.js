const express = require('express');
const { protectRoute } = require('../handlers/auth_handler');
const {
  getOrder,
  addOrder,
  getOrders,
  deleteOrder,
  updateOrder
} = require('../handlers/order_handler');

const Router = express.Router();

Router.use(protectRoute);

Router.route('/').get(getOrders).post(addOrder);

Router.route('/:id').get(getOrder).patch(updateOrder).delete(deleteOrder);

module.exports = Router;
