const mongoose = require('mongoose')

const deletedUserSchema = mongoose.Schema({
  user_id: String,
  email: String,
  description: String
}, {
  timestamps: true
})

module.exports = mongoose.model('DeletedUser', deletedUserSchema)