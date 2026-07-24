const mongoose = require('mongoose')

const citySchema = mongoose.Schema({
  label: String
})

module.exports = mongoose.model('City', citySchema)