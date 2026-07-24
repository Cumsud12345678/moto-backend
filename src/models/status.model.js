const mongoose = require('mongoose')

const statusSchema = mongoose.Schema({
  label: String
})

module.exports = mongoose.model('Status', statusSchema)