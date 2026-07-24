const mongoose = require('mongoose')
const { type } = require('node:os')

const favoriSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
})

favoriSchema.index(
  { user: 1, product: 1 },
  { unique: true }
)

module.exports = mongoose.model('Favori', favoriSchema)