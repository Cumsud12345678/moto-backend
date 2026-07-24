const mongoose = require('mongoose')

const colorSchema = mongoose.Schema({
  label: String
})

module.exports = mongoose.model('Color', colorSchema)