const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/app_error');
const filterObj = require('../utils/filter_obj');
const roleConfig = require('../utils/roleConfig');

const storage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.memeType.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Only images are allowed to be uploaded as a logo.',
        400,
        'invalid_field_error'
      ),
      false
    );
  }
};

const upload = multer({
  fileFilter: multerFilter,
  storage: storage
});

exports.uploadLogo = upload.single('logo');

exports.resizeLogo = (req, res, next) => {
  if (!req.file) return next();
  req.file.fileName = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({
      quality: 90
    })
    .toFile(`/public/profile_pictures/${req.file.fileName}`);
};

exports.updateMe = async (req, res, next) => {
  if (req.body.passwordConfirm || req.body.password) {
    return next(
      new AppError(
        'You can not use this route to change password, Please use /auth/update-my-password',
        400,
        'wrong_path_error'
      )
    );
  }

  if (req.body.email) {
    return next(
      new AppError(
        'You can not use this route to change email, Please use /auth/update-my-email',
        400,
        'wrong_path_error'
      )
    );
  }
  if (req.body.role?.toLowerCase() === 'admin') {
    return next(
      new AppError(
        'You cannot assign yourself as admin.',
        403,
        'permission_error'
      )
    );
  }
  const data = filterObj(req.body, 'phoneNumber', 'name');
  if (req.file) data.logo = req.file.fileName;
  const { model: RoleModel } = roleConfig[req.user.role];
  const user = await RoleModel.findByIdAndUpdate(req.user.id, data, {
    runValidators: true,
    new: true
  });

  res.status(200).json({
    message: 'success',
    data: {
      user
    }
  });
};
