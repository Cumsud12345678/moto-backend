const express = require('express')
const router = express.Router()
const upload = require('../../middlewares/upload.middleware')
const auth = require('../../middlewares/auth.middleware')
const isAdmin = require('../../middlewares/isAdmin.middleware')

const {
  getAdsense,
  createAdsense,
  clickAdsense,
  deleteAdsense
} = require('../../controllers/admin/adminAdsense.controller')

router.get('/', auth, isAdmin, getAdsense)
router.post('/create', auth, isAdmin, upload.single('image'), createAdsense)
router.put('/:id', clickAdsense)
router.delete('/:id', auth, isAdmin, deleteAdsense)

module.exports = router