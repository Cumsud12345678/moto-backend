const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
  getUserProducts,
  deactiveProduct,
  activeProduct,
  deleteProduct,
  updateProduct,
  getProductStats,

  getDeletedProducts,
  getDeletedProduct,
  deleteDeletedProducts
} = require('../../controllers/admin/adminProduct.controller');

router.get('/', getProducts)
router.get('/search', getProduct)
router.get('/user/:id', getUserProducts)
router.put('/deactive/:id', deactiveProduct)
router.put('/active/:id', activeProduct)
router.delete('/delete/:id', deleteProduct)
router.get('/stats', getProductStats)

router.get('/deleted', getDeletedProducts)
router.get('/deleted/search', getDeletedProduct)
router.delete('/deleted/:id', deleteDeletedProducts)

module.exports = router