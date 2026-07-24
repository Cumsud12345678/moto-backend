const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
  label: String
})

module.exports = mongoose.model('Category', categorySchema)