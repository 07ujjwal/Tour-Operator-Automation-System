const { promisify } = require('util');
const User = require('../model/user_model');
const AppError = require('../utils/app_error');
const catchError = require('../utils/catch_error');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSenderToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'sucess',
    token,
    data: {
      user: user,
    },
  });
};

exports.sighUp = catchError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSenderToken(newUser, 201, res);
});

exports.logIn = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return next(new AppError('Please Enter Email', 400));
  }

  if (!password) {
    return next(new AppError('Please Enter Password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('No User Found', 401));
  }

  if (!(await user.checkPassword(JSON.stringify(password), user.password))) {
    return next(new AppError('Incorrect Email or Password', 401));
  }

  createSenderToken(user, 200, res);
});

exports.protect = catchError(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const securedUser = await User.findById(decoded.id);

  if (!securedUser) {
    return new AppError(
      'The user belonging to this data does no longer exist.',
      401
    );
  }

  if (securedUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = securedUser;

  next();
});

exports.ristrictUser = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userType)) {
      return next(
        new AppError("You Don't have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no useer with this email!', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  console.log(user.email);

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
  next();
});

exports.resetPassword = catchError(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  console.log(user);

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSenderToken(user, 200, res);
});

exports.updatePassword = catchError(async (req, res, next) => {
  const user = await User.findOne({
    _id: req.user.id,
  }).select('+password');

  console.log(req.user.id);

  const isPasswordCorrect = await user.checkPassword(
    req.body.passwordCurrent,
    user.password
  );

  if (!isPasswordCorrect) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSenderToken(user, 200, res);
});
