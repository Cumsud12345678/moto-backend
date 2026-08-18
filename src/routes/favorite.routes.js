const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const {
  setFavori,
  deleteFavori,
  getFavorites,

  getFavoritesNotLogin
} = require('../controllers/favorite.controller');

// FAVORITES KAYITLI USERLER UCUN
router.get('/', auth, getFavorites);
router.post('/', auth, setFavori);
router.delete('/:id', auth, deleteFavori);

// FAVORITES KAYITSIZ USERLER UCUN
router.post('/not/login', getFavoritesNotLogin);

module.exports = router