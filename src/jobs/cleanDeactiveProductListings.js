const cron = require('node-cron');
const Product = require('../models/product.model')

const THREE_DAYS_MS = 5 * 24 * 60 * 60 * 1000

async function cleanExpiredDeactiveProducts(params) {
  const cutoff = new Date(Date.now() - THREE_DAYS_MS)

  const expirderProducts = await Product.find({
    isActive: false,
    deactiveAt: { $lte: cutoff }
  }).select('_id')

  if(expirderProducts.length == 0) return

  const productIds = expirderProducts.map(p => p._id)
  const result = await Product.deleteMany({_id: { $in: productIds }})
}

cron.schedule('0 * * * *', cleanExpiredDeactiveProducts);

module.exports = cleanExpiredDeactiveProducts;