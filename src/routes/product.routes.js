const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const optionalAuth = require('../middlewares/optionalAuth.middleware');

const {
  getProducts,
  createProduct,

  getSimilarProducts,

  getMetadata,
  deleteProduct,
  getFavoritesNotLogin,

  getFilteredProducts,

  getUserProducts,

  updateProduct,

  getProductDetails
} = require('../controllers/product.controller');


// HOME 
router.get('/', optionalAuth, getProducts);

// AUTOS
router.get('/autos', getFilteredProducts);

// DETAILS
router.get('/details/:id', getProductDetails)
router.get('/similars/:id', getSimilarProducts);

// METADATA
router.get('/metadata', getMetadata);

// BOOKMARKS KAYITSIZ USERLER UCUN
router.post('/not/login/favorites', getFavoritesNotLogin);

// NEW
router.post('/create', auth, upload.array('images', 10), createProduct);

// PROFILE
router.get('/user/:id', auth, getUserProducts)
router.delete('/delete/:id', auth, deleteProduct);
router.put('/update/:id', auth,  upload.array('newImages'), updateProduct)


// router.get('/search', getFilteredData)

module.exports = router