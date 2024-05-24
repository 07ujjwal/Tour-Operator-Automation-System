const express = require('express');
const user_controller = require('./../controllers/user_controllers');
const {
  sighUp,
  logIn,
  protect,
  ristrictUser,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/auth_controller');

const router = express.Router();

router.post('/sighup', sighUp);
router.post('/login', logIn);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protect, updatePassword);
router.patch('/updateLoginData', protect, user_controller.updateUserLoginData);

router
  .route('/')
  .get(user_controller.getAllUsers)
  .post(user_controller.createUser);

router
  .route('/:id')
  .get(user_controller.getUser)
  .patch(user_controller.updateUser)
  .delete(user_controller.deleteUser);

module.exports = router;
