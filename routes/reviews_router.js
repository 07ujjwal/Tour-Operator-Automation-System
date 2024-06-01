const express = require('express');
const {
  createReview,
  getAllReviews,
  updateReview,
  getReview,
  deleteReview,
} = require('../controllers/reviews_controller');
const { protect, ristrictUser } = require('../controllers/auth_controller');

const router = express.Router({ mergeParams: true }); // by default we can only use parameters of our own router

router
  .route('/')
  .get(getAllReviews)
  .post(protect, ristrictUser('user', 'admin'), createReview);

router.use(protect, ristrictUser('user', 'admin'));

router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
