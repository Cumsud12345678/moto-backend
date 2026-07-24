const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

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
router.post('/register', register);
router.post('/register/verify', registerValidate);

// LOGIN
router.post('/login', login);
router.post('/login/verify', loginValidate);

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