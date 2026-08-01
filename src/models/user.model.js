const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  profile: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  warning: {
    type: Number,
    default: 0
  },
  isLock: {
    type: Boolean,
    default: false
  },
  lockedAt: {
    type: Date,
    default: null
  }
},{
  timestamps: true, // createdAt və updatedAt avtomatik əlavə olunur
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

userSchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'user',
  count: true
})

module.exports = mongoose.model('User', userSchema)