const cron = require('node-cron')
const path = require('path')
const fs = require('fs/promises')
const User = require('../models/user.model')
const Product = require('../models/product.model')

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

const { deleteFromR2 } = require('../uploadToR2') // öz yolunuza uyğun dəyişin

async function cleanExpiredLockedUsers() {
  const cutoff = new Date(Date.now() - THREE_DAYS_MS)

  const expiredUsers = await User.find({
    isLock: true,
    lockedAt: { $lte: cutoff }
  }).select('_id')

  if(expiredUsers.length === 0) return;

  const userIds = expiredUsers.map(u => u._id);

  const productsToDelete = await Product.find({ user: { $in: userIds } }).select('_id images')

  for (const product of productsToDelete) {
    for (const image of product.images || []) {
      try {
        await deleteFromR2(image)
      } catch (err) {
        console.error('Fayl silinmədi:', image, err.message)
      }
    }
  }

  const result = await Product.deleteMany({user: { $in: userIds }})
}

cron.schedule('0 0 * * *', cleanExpiredLockedUsers);

module.exports = cleanExpiredLockedUsers;