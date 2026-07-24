const mongoose = require('mongoose')

const makeSchema = mongoose.Schema({
  label: String,
  logo: String
})

module.exports = mongoose.model('Make', makeSchema)