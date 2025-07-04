const OrderModel = require('../model/order');
const AppError = require('../utils/app_error');
const APIFeatures = require('../utils/api_features');

exports.addOrder = async (req, res, next) => {
  const newOrder = await OrderModel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newOrder }
  });
};

exports.getOrders = async (req, res, next) => {
  const { query } = new APIFeatures(OrderModel.find(), this.query)
    .filter()
    .limitFields()
    .paginate()
    .sort();

  const orders = await query;
  res.status(200).json({
    status: 'success',
    data: { orders }
  });
};

exports.getOrder = async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(
      new AppError(
        'No order was found with that id',
        404,
        'item_not_exist_error'
      )
    );
  }
  res.status(200).json({
    status: 'success',
    data: { order }
  });
};

exports.updateOrder = async (req, res, next) => {
  const order = await OrderModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!order) {
    return next(
      new AppError(
        'No order was found with that id',
        404,
        'item_not_exist_error'
      )
    );
  }
  res.status(200).json({
    status: 'success',
    data: { order }
  });
};

exports.deleteOrder = async (req, res, next) => {
  const order = await OrderModel.findByIdAndDelete(req.params.id);
  if (!order) {
    return next(
      new AppError(
        'No order was found with that id',
        404,
        'item_not_exist_error'
      )
    );
  }
  res.status(204).end();
};
