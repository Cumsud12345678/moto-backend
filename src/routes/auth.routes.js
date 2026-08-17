const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { otpLimiter, verifyLimiter } = require('../middlewares/rateLimit.middleware');

const {
  register,
  registerValidate,
  login,
  loginValidate,
  getMe,
  updateUser,
  logout
} = require('../controllers/auth.controller');

// REGISTER 
router.post('/register', otpLimiter, register);
router.post('/register/verify', verifyLimiter, registerValidate);

// LOGIN
router.post('/login', otpLimiter, login);
router.post('/login/verify', verifyLimiter, loginValidate);

// USER
router.get('/me', auth, getMe);
router.put('/:id', auth, upload.single('profile'), updateUser);

// LOGOUT
router.get('/logout', logout);

module.exports = router