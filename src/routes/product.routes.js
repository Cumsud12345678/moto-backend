const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const optionalAuth = require('../middlewares/optionalAuth.middleware');
const Product = require('../models/product.model');

const {
  getProducts,
  createProduct,

  getSimilarProducts,

  clickProduct,

  getMetadata,
  deleteProduct,
  getFavoritesNotLogin,

  getFilteredProducts,

  getUserProducts,

  updateProduct,

  getProductDetails,

} = require('../controllers/product.controller');


// HOME 
router.get('/', optionalAuth, getProducts);

// AUTOS
router.get('/autos', getFilteredProducts);

// DETAILS
router.get('/details/:id', optionalAuth, getProductDetails)
router.get('/similars/:id', getSimilarProducts);
router.get('/:id/click', clickProduct)

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

// Sitemap
router.get('/sitemap.xml', async (req, res) => {
  const products = await Product.find({ isActive: true }).select('_id updatedAt')
  const urls = products.map(p => `
    <url>
      <loc>https://sənin-domenin.com/elanlar/${p._id}</loc>
      <lastmod>${p.updatedAt.toISOString()}</lastmod>
    </url>
  `).join('')

  res.header('Content-Type', 'application/xml')
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>https://dir-indexed-five-prep.trycloudflare.com/</loc></url>
      <url><loc>https://dir-indexed-five-prep.trycloudflare.com/autos</loc></url>
      ${urls}
    </urlset>`)
})

// router.get('/search', getFilteredData)

module.exports = router