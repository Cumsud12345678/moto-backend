const mongoose = require('mongoose')

const speedSchema = mongoose.Schema({
  label: String
})

module.exports = mongoose.model('Speed', speedSchema)