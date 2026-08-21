const cron = require('node-cron')
const Product = require('../models/product.model')

// const THIRTY_DAYS_MS = 3 * 24 * 60 * 60 * 1000
const TEST_DAYS_MS = 2 * 60 * 1000

async function timeExpiredProductUpdate() {
  const cutoff = new Date(Date.now() - TEST_DAYS_MS)

  const expiredProducts = await Product.find({
    is_active: true,
    createdAt: { $lte: cutoff }
  }).select('_id')

  if(expiredProducts.length === 0) return;

  const ids = expiredProducts.map(p => p._id)

  const updatedProducts = await Product.updateMany(
    { _id: {$in: ids} },
    { $set: { is_active: false } }
  )
}

cron.schedule('*/2 * * * *', timeExpiredProductUpdate);

module.exports = timeExpiredProductUpdate;