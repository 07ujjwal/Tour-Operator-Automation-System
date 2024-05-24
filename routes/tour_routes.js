const express = require('express');
const tour_controller = require('./../controllers/tour_controllers');
const { protect, ristrictUser } = require('../controllers/auth_controller');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tour_controller.aliasTopTour, tour_controller.getAllTours);

router.route('/monthly-plan/:year').get(tour_controller.getMonthlyPlan);

router
  .route('/')
  .get(protect, tour_controller.getAllTours)
  .post(tour_controller.createTour);

router
  .route('/:id')
  .get(tour_controller.getTour)
  .patch(tour_controller.updateTour)
  .delete(
    protect,
    ristrictUser('lead-guide', 'admin'),
    tour_controller.deleteTour
  );

module.exports = router;
