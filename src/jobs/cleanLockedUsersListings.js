const cron = require('node-cron')
const User = require('../models/user.model')
const Product = require('../models/product.model')

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

async function cleanExpiredLockedUsers() {
  const cutoff = new Date(Date.now() - THREE_DAYS_MS)

  const expiredUsers = await User.find({
    isLock: true,
    lockedAt: { $lte: cutoff }
  }).select('_id')

  if(expiredUsers.length === 0) return;
  
  const userIds = expiredUsers.map(u => u._id);

  const result = await Product.deleteMany({user: { $in: userIds }})
}

cron.schedule('0 * * * *', cleanExpiredLockedUsers);

module.exports = cleanExpiredLockedUsers;