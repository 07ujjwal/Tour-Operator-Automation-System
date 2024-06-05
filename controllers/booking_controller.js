const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../model/user_model');
const Booking = require('../model/booking_model');
const Features = require('../utils/api_features');
const AppError = require('../utils/app_error');
const catchError = require('../utils/catch_error');
const Tour = require('../model/tour_model');

exports.createBooking = catchError(async (req, res, next) => {
  const newBooking = req.body;

  const createdBooking = await Booking.create(newBooking);

  res.status(200).json({
    message: 'success',
    data: {
      createdBooking,
    },
  });
});

exports.getAllBookings = catchError(async (req, res, next) => {
  let filter = {};

  const features = new Features(Booking.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bookings = await features.query;

  res.status(200).json({
    message: 'success',
    length: bookings.length,
    data: {
      bookings,
    },
  });
});

exports.getBooking = catchError(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user')
    .populate('tour');

  if (!booking) {
    return next(new AppError('No booking found!'));
  }

  res.status(200).json({
    message: 'success',
    data: {
      booking,
    },
  });
});

exports.updateBooking = catchError(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!booking) {
    return next(new AppError('No booking found!'));
  }

  res.status(200).json({
    message: 'success',
    data: {
      booking,
    },
  });
});

exports.getCheckoutSession = catchError(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});


exports.createBookingCheckout = catchError(async (req, res, next) => {
  
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});


exports.deleteBooking = catchError(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found!'));
  }

  res.status(204).json({
    message: 'success',
    data: null,
  });
});
