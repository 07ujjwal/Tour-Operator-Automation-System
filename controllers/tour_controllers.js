const Tour = require('../model/tour_model');
const Features = require('../utils/api_features');
const AppError = require('../utils/app_error');
const catchError = require('../utils/catch_error');

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchError(async (req, res, next) => {
  const features = new Features(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchError(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('Invalid Tour Id', 404));
  }

  res.status(200).json({
    message: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchError(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchError(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.params.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('Invalid Tour Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchError(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('Invalid Tour Id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMonthlyPlan = catchError(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-20`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },

    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  if (!plan) {
    return next(new AppError('Invalid Tour data', 404));
  }

  res.status(200).json({
    status: 'sucess',
    length: plan.length,
    data: {
      plan,
    },
  });
});
