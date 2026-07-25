const Product = require('../../models/product.model')
const User = require('../../models/user.model')
const Favorite = require('../../models/favori.model')
const DeletedUser = require('../../models/delete.user.model')
const path = require('path')
const fs = require('fs')

const getUsers = async (skip, limit) => {
  const [users, total] = await Promise.all([
    User.find().limit(limit).skip(skip).populate('productCount'),
    User.countDocuments()
  ])

  return {
    users,
    total: Math.ceil(total / limit)
  }
}

const getUser = async (query) => {
  const {
    userId,
    phone,
  } = query

  const filter = {}

  if(userId) filter._id = userId;
  if(phone) filter.phone = phone;

  return await User.find(filter).populate('productCount')
}

const warningUser = async (id) => {
  return await User.findByIdAndUpdate(
    id, 
    { $inc: { warning: 1 } },
    { returnDocument: 'after' }
  )
}

const lockUser = async (id) => {
  await User.findByIdAndUpdate(
    id, 
    { 
      isLock: true,
      lockedAt: new Date()
    }
  )

  await Product.updateMany({user: id}, {
    isActive: false
  })

  return true
}

const unlockUser = async (id) => {
  return await User.findByIdAndUpdate(
    id, 
    { 
      isLock: false,
      warning: 0,
      lockedAt: null
    },
    {
      returnDocument: 'after'
    }
  )
}

const resetWarningUser = async (id) => {
  return await User.findByIdAndUpdate(
    id, 
    { warning: 0 },
    { returnDocument: 'after' }
  )
}

const deleteUser = async (id, desc) => {
  const user = await User.findById(id)
  await DeletedUser.create({
    user_id: id,
    phone: user.phone,
    description: desc
  })
  if(user.profile){
    const profilePath = path.join(__dirname, '../../uploads', user.profile)
    fs.unlink(profilePath, (err) => {
      if (err) console.error('Köhnə şəkil silinmədi:', err.message)
    })
  }
  await User.findByIdAndDelete(id)
  await Product.deleteMany({ user: id })
  await Favorite.deleteMany({ user: id })
  return true
}

const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, {
    new: true
  })
}

const getUserStats = async (startOfDay, onWeekAgo, oneMonthAgo) => {
  const [today, week, month, all] = await Promise.all([
    User.countDocuments({createdAt: { $gte: startOfDay }}),
    User.countDocuments({createdAt: { $gte: onWeekAgo }}),
    User.countDocuments({createdAt: { $gte: oneMonthAgo }}),
    User.countDocuments()
  ])

  return {
    today,
    week,
    month,
    all
  }
}

const getDeletedUsers = async () => {
  return await DeletedUser.find()
}

const deleteDeletedUser = async (id) => {
  await DeletedUser.findByIdAndDelete(id)
  return true
}

module.exports = {
  getUsers,
  getUser,
  warningUser,
  lockUser,
  unlockUser,
  resetWarningUser,
  deleteUser,
  updateUser,
  getUserStats,
  
  getDeletedUsers,
  deleteDeletedUser
}