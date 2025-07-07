const MedicineModel = require('../model/medicine');
const AppError = require('../utils/app_error');
const APIFeatures = require('../utils/api_features');

exports.addMedicine = async (req, res, next) => {
  const newMedicine = await MedicineModel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newMedicine }
  });
};

exports.getMedicines = async (req, res, next) => {
  const { query } = new APIFeatures(MedicineModel.find(), req.query)
    .filter()
    .limitFields()
    .paginate()
    .sort();
  const medicines = await query
    .populate({
      path: 'supplier',
      select: '-__v -createdAt -updatedAt'
    })
    .select('-__v -createdAt -updatedAt')
    .lean();

  res.status(200).json({
    status: 'success',
    data: { medicines }
  });
};

exports.getMedicine = async (req, res, next) => {
  const medicine = await MedicineModel.findById(req.params.id).populate({
    path: 'supplier'
  });
  if (!medicine) {
    return next(
      new AppError(
        'No medicine was found with that id',
        404,
        'item_not_exist_error'
      )
    );
  }
  res.status(200).json({
    status: 'success',
    data: { medicine }
  });
};

exports.updateMedicine = async (req, res, next) => {
  const medicine = await MedicineModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  if (!medicine) {
    return next(
      new AppError(
        'No medicine was found with that id',
        404,
        'item_not_exist_error'
      )
    );
  }
  res.status(200).json({
    status: 'success',
    data: { medicine }
  });
};

exports.deleteMedicine = async (req, res, next) => {
  const medicine = await MedicineModel.findByIdAndDelete(req.params.id);
  if (!medicine) {
    return next(
      new AppError(
        'No medicine was found with that id',
        404,
        'item_not_exist_error'
      )
    );
  }
  res.status(204).end();
};
