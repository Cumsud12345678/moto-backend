const mongoose = require('mongoose')

const adsenseSchema = mongoose.Schema({
  position: {
    type: String,
    enum: ['mobile', 'deskop'],
    default: 'mobile'
  },
  image: String,
  link: String,
  click: {
    type: Number,
    default: 0
  },
  owner: String
},{
  timestamps: true
})

module.exports = mongoose.model('Adsense', adsenseSchema)