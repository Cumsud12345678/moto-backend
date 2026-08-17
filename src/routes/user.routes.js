const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { otpLimiter, verifyLimiter } = require('../middlewares/rateLimit.middleware');

const {
  setFavori,
  deleteFavori,
  getFavorites,
} = require('../controllers/user.controller');

// FAVORITES KAYITLI USERLER UCUN
router.get('/favorites', auth, getFavorites);
router.post('/favorites', auth, setFavori);
router.delete('/favorites/:id', auth, deleteFavori);

module.exports = router