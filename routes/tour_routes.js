const express = require('express');
const reviewsRouter = require('./reviews_router');
const tour_controller = require('./../controllers/tour_controllers');
const { protect, ristrictUser } = require('../controllers/auth_controller');
const { createReview } = require('../controllers/reviews_controller');

const router = express.Router();

router.use('/:tourId/reviews', reviewsRouter);

router
  .route('/monthly-plan/:year')
  .get(
    protect,
    ristrictUser('lead-guide', 'admin', 'guide'),
    tour_controller.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/:unit')
  .get(tour_controller.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tour_controller.getDistances);

router
  .route('/')
  .get(tour_controller.getAllTours)
  .post(
    protect,
    ristrictUser('lead-guide', 'admin'),
    tour_controller.createTour
  );

router
  .route('/:id')
  .get(tour_controller.getTour)
  .patch(
    protect,
    ristrictUser('lead-guide', 'admin'),
    tour_controller.uploadTourImages,
    tour_controller.resizeTourImages,
    tour_controller.updateTour
  )
  .delete(
    protect,
    ristrictUser('lead-guide', 'admin'),
    tour_controller.deleteTour
  );

router
  .route('/:tourId/reviews')
  .post(protect, ristrictUser('admin', 'lead-guide', 'guide'), createReview);

module.exports = router;
