const cron = require('node-cron');
const path = require('path')
const fs = require('fs/promises')
const Product = require('../models/product.model')
const { UPLOAD_DIR } = require('../middlewares/upload.middleware');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

async function cleanExpiredDeactiveProducts(params) {
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS)

  const expirderProducts = await Product.find({
    is_active: false,
    updatedAt: { $lte: cutoff }
  }).select('_id images')

  if(expirderProducts.length == 0) return

  for (const product of expirderProducts) {
    for (const image of product.images || []) {
      const imagePath = path.join(UPLOAD_DIR, image)
      try {
        await fs.unlink(imagePath)
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.warn('Fayl onsuz da mövcud deyil:', image)
        } else {
          console.error('Fayl silinmədi:', image, err)
        }
      }
    }
  }

  const productIds = expirderProducts.map(p => p._id)
  const result = await Product.deleteMany({_id: { $in: productIds }})
}

cron.schedule('0 0 * * *', cleanExpiredDeactiveProducts);

module.exports = cleanExpiredDeactiveProducts;