const mongoose = require('mongoose')

const fuelSchema = mongoose.Schema({
  label: String
})

module.exports = mongoose.model('Fuel', fuelSchema)