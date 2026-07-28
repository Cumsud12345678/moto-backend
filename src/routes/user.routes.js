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
  logout,

  getMe,

  setFavori,
  deleteFavori,
  getFavorites,

  updateUser
} = require('../controllers/user.controller');

// REGISTER 
router.post('/register', otpLimiter, register);
router.post('/register/verify', verifyLimiter, registerValidate);

// LOGIN
router.post('/login', otpLimiter, login);
router.post('/login/verify', verifyLimiter, loginValidate);

// LOGOUT
router.get('/logout', logout);

// FAVORITES KAYITLI USERLER UCUN
router.get('/favorites', auth, getFavorites);
router.post('/favorites', auth, setFavori);
router.delete('/favorites/:id', auth, deleteFavori);

// USER
router.get('/me', auth, getMe);
router.put('/:id', auth, upload.single('profile'), updateUser);

module.exports = router