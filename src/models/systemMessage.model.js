const mongoose = require('mongoose')

const systemMessageSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ['information', 'punishment', 'success'],
    default: 'information'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
}, {
  timestamps: true
})

module.exports = mongoose.model('systemMessage', systemMessageSchema)