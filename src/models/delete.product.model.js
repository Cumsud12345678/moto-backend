const mongoose = require('mongoose')

const deletedProductSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: String,
  phone: Number,
  reason: String,
  deletedBy: String,
  type: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('DeletedProduct', deletedProductSchema)