const cron = require('node-cron');
const path = require('path')
const fs = require('fs/promises')
const Product = require('../models/product.model')

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const { deleteFromR2 } = require('../uploadToR2') // öz yolunuza uyğun dəyişin

async function cleanExpiredDeactiveProducts(params) {
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS)

  const expirderProducts = await Product.find({
    is_active: false,
    updatedAt: { $lte: cutoff }
  }).select('_id images')

  if(expirderProducts.length == 0) return

  for (const product of expirderProducts) {
    for (const image of product.images || []) {
      try {
        await deleteFromR2(image)
      } catch (err) {
        console.error('Fayl silinmədi:', image, err.message)
      }
    }
  }

  const productIds = expirderProducts.map(p => p._id)
  const result = await Product.deleteMany({_id: { $in: productIds }})
}

cron.schedule('0 0 * * *', cleanExpiredDeactiveProducts);

module.exports = cleanExpiredDeactiveProducts;