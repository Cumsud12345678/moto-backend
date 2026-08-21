const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const optionalAuth = require('../middlewares/optionalAuth.middleware');

const {
  getProducts,
  createProduct,

  getSimilarProducts,

  clickProduct,

  getMetadata,
  deleteProduct,

  getFilteredProducts,

  getUserProduct,
  getUserProducts,
  getUserActiveProducts,
  getUserDeactiveProducts,

  updateProduct,

  getProductDetails,

  setActiveProduct,

  sitemap,

} = require('../controllers/product.controller');


// HOME 
router.get('/', optionalAuth, getProducts);

// AUTOS
router.get('/autos', optionalAuth, getFilteredProducts);

// DETAILS
router.get('/details/:id', optionalAuth, getProductDetails)
router.get('/similars/:id', optionalAuth, getSimilarProducts);
router.get('/user/product/:id', auth, getUserProduct)

// METADATA
router.get('/metadata', getMetadata);

// NEW
router.post('/create', auth, upload.array('images', 10), createProduct);

// PROFILE
router.get('/user/:id', auth, getUserProducts)
router.get('/user/active/:id', auth, getUserActiveProducts)
router.get('/user/deactive/:id', auth, getUserDeactiveProducts)

router.delete('/delete/:id', auth, deleteProduct);
router.get('/actived/:id', auth, setActiveProduct)
router.put('/update/:id', auth,  upload.array('newImages'), updateProduct)
router.get('/click/:id', clickProduct)

// Sitemap
router.get('/sitemap.xml', sitemap)


module.exports = router