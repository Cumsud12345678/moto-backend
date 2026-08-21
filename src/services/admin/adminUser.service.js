const Product = require('../../models/product.model')
const User = require('../../models/user.model')
const Favorite = require('../../models/favori.model')
const DeletedUser = require('../../models/delete.user.model')
const SystemMessage = require('../../models/systemMessage.model')
const path = require('path')
const fs = require('fs')
const { UPLOAD_DIR } = require('../../middlewares/upload.middleware');

const getUsers = async (skip, limit) => {
  const [users, total] = await Promise.all([
    User.find().limit(limit).skip(skip).populate('productCount').lean(),
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
    email,
  } = query

  const filter = {}

  if(userId) filter._id = userId;
  if(email) filter.email = email;

  return await User.find(filter).populate('productCount').lean()
}

const warningUser = async (id) => {
  const [systemMessage, warningedUser] = await Promise.all([
    SystemMessage.create({ 
      type: 'punishment', 
      user: id, 
      message: 'Müxtəlif səbəblərdən hesabınız Xəbərdarlıq edildi. Bu hal 3 dəfə təkrar olsa hesabınız bloklanacaq.' 
    }),
    User.findByIdAndUpdate( id, { $inc: { warning: 1 } }, { returnDocument: 'after' })
  ])

  return warningedUser
}

const lockUser = async (id) => {
  await Promise.all([
    SystemMessage.create({
      type: 'punishment', 
      user: id,
     message: 'Müxtəlif səbəblərdən hesabınız bloklandı. Ətraflı məlumat üçün dəsdəklə əlaqəyə keçin.'
    }),
    User.findByIdAndUpdate(id, 
      { isLock: true, lockedAt: new Date() }
    ),
    Product.updateMany({user: id}, 
      { 
        $set: {
          is_active: false
        }
      }
    )
  ])

  return true
}

const unlockUser = async (id) => {
  const [systemMessage, unlockedUser] = await Promise.all([
    SystemMessage.create({
      type: 'punishment', 
      user: id,
      message: 'Hesabınızın kilidi açıldı və xəbərdarlıqlar silindi.'
    }),
    User.findByIdAndUpdate(id, 
    { 
      isLock: false,
      warning: 0,
      lockedAt: null
    },
    {
      returnDocument: 'after'
    })
  ])

  return unlockedUser
}

const resetWarningUser = async (id) => {
  await Promise.all([
    SystemMessage.create({
      type: 'punishment', 
      user: id,
      message: 'Xəbərdarlıqlar sıfırlandı'
    }),
    User.findByIdAndUpdate(id, 
      { warning: 0 },
      { returnDocument: 'after' }
    )
  ])

  return true
}

const deleteUser = async (id, desc) => {
  const user = await User.findById(id)
  await DeletedUser.create({
    user_id: id,
    email: user.email,
    description: desc
  })
  if(user.profile){
    const profilePath = path.join(UPLOAD_DIR, user.profile)
    fs.unlink(profilePath, (err) => {
      if (err) console.error('Köhnə şəkil silinmədi:', err.message)
    })
  }
  await Promise.all([
    User.findByIdAndDelete(id),
    Product.deleteMany({ user: id }),
    Favorite.deleteMany({ user: id })
  ])

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

const getDeletedUsers = async (skip, limit) => {
  const [users, total] = await Promise.all([
    DeletedUser.find().skip(skip).limit(limit).lean(),
    DeletedUser.countDocuments()
  ])
  
  return {
    users, 
    total: Math.ceil(total / limit)
  }
}

const deleteDeletedUser = async (id) => {
  await DeletedUser.findByIdAndDelete(id)
  return true
}

const getDeletedUser = async (query) => {
  const filter = {}
  if(query.id) filter._id = query.id
  if(query.userId) filter.user_id = query.userId;
  if(query.email) filter.email = query.email

  return await DeletedUser.find(filter).lean()
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
  deleteDeletedUser,

  getDeletedUser
}