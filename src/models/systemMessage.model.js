const mongoose = require('mongoose')

const systemMessageSchema = mongoose.Schema({
  status: {
    type: String,
    enum: ['accent', 'danger', 'warning', 'success'],
    default: 'information'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views: {
    type: Boolean,
    default: false
  },
  message: String,
}, {
  timestamps: true
})

module.exports = mongoose.model('systemMessage', systemMessageSchema)