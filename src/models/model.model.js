const mongoose = require('mongoose')

const modelSchema = mongoose.Schema({
  label: String,
  make: { type: mongoose.Schema.Types.ObjectId, ref: 'Make' }
})

module.exports = mongoose.model('Model', modelSchema)