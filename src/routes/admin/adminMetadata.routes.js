const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/upload.middleware');

const {
  getMetadata,
  createMetadata,
  deleteMetadata
} = require('../../controllers/admin/adminMetadata.controller');

router.get('/', getMetadata)
router.post('/', upload.single('logo'), createMetadata)
router.delete('/', deleteMetadata)

module.exports = router