const mongoose = require('mongoose')

const deletedProductSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone: Number,
  product_id: String,
  description: String
}, {
  timestamps: true
})

module.exports = mongoose.model('DeletedProduct', deletedProductSchema)