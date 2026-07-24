const mongoose = require('mongoose')

const equipmentSchema = mongoose.Schema({
  label: String
})

module.exports = mongoose.model('Equipment', equipmentSchema)