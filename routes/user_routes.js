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
router.patch('/updateLoginData', protect, user_controller.updateUserData);

router.get('/me', protect, user_controller.getMe, user_controller.getUser);
router.patch(
  '/updateMe',
  protect,
  user_controller.uploadUserPhoto,
  user_controller.resizeUserPhoto,
  user_controller.updateUserData
);

router.use(protect, ristrictUser('admin'));

router
  .route('/')
  .get(user_controller.getAllUsers)
  .post(user_controller.createUser);

router
  .route('/:id')
  .get(user_controller.getUser)
  .delete(user_controller.deleteUser);

module.exports = router;
