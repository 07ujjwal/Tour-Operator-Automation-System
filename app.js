const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tour_routes');
const userRouter = require('./routes/user_routes');
const reviewsRouter = require('./routes/reviews_router');
const AppError = require('./utils/app_error');
const globalErrorHandler = require('./controllers/error_controller');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const app = express();

// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'developement') {
  app.use(morgan('dev'));
}

// rate limiter.....
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

// nosql query injection protection,,,,
app.use(mongoSanitize());
// html code injection protection...
app.use(xss());
// prevents parameter pollution...
app.use(
  hpp({
    whitelist: ['duration', 'ratingsAverage'],
  })
);

app.use('/api', limiter);

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewsRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handling middleware....

app.use(globalErrorHandler);

module.exports = app;
