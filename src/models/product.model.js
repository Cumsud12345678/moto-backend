const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
  price: Number,
  year: Number,
  mileage: Number,
  description: String,
  volume: Number,
  power: Number,
  phone: Number,
  message: String,
  images: [String],
  make: { type: mongoose.Schema.Types.ObjectId, ref: 'Make' },
  model: { type: mongoose.Schema.Types.ObjectId, ref: 'Model' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  fuel: { type: mongoose.Schema.Types.ObjectId, ref: 'Fuel' },
  speed: { type: mongoose.Schema.Types.ObjectId, ref: 'Speed' },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color' },
  status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status' },
  equipments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: {
    type: Boolean,
    default: true
  },
  views: { 
    type: Number,
    default: 0
  },
  favoriteCount: { 
    type: Number,
    default: 0
  },
  phoneClicks: { 
    type: Number,
    default: 0
  },
  deactiveAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

module.exports = mongoose.model('Product', productSchema)