const mongoose = require('mongoose')

const adsenseSchema = mongoose.Schema({
  image: String,
  link: String,
  position: {
    type: String,
    enum: ['mobile', 'deskop_left', 'deskop_right'],
    default: 'mobile'
  },
  is_home: Boolean,
  is_details: Boolean,
  click: {
    type: Number,
    default: 0
  },
  owner: String
},{
  timestamps: true
})

module.exports = mongoose.model('Adsense', adsenseSchema)