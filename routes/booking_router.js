const express = require('express');
const bookingController = require('./../controllers/booking_controller');
const { ristrictUser, protect } = require('../controllers/auth_controller');

const router = express.Router();

router.use(protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(ristrictUser('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
