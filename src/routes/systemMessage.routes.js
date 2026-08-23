const express = require('express');
const router = express.Router();

const {
  getMessages
} = require('../controllers/systemMessage.controller');

router.get('/:id', getMessages)

module.exports = router