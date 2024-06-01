const Review = require('../model/reviews_model');
const Features = require('../utils/api_features');
const AppError = require('../utils/app_error');
const catchError = require('../utils/catch_error');

exports.createReview = catchError(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = req.body;

  const createdReview = await Review.create(newReview);

  console.log(createdReview);

  res.status(200).json({
    message: 'success',
    data: {
      createdReview,
    },
  });
});

exports.getAllReviews = catchError(async (req, res, next) => {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };

  const features = new Features(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query;

  res.status(200).json({
    message: 'success',
    length: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = catchError(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found!'));
  }

  res.status(200).json({
    message: 'success',
    data: {
      review,
    },
  });
});

exports.deleteReview = catchError(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError('No review found!'));
  }

  res.status(204).json({
    message: 'success',
    data: null,
  });
});

exports.updateReview = catchError(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(new AppError('No review found!'));
  }

  res.status(200).json({
    message: 'success',
    data: {
      review,
    },
  });
});


