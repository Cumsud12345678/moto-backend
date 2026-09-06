// src/migrate-images.js
// İşlətmək üçün: node src/migrate-images.js
// (Render Shell-də layihənin kök qovluğunda işlədin)

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const connectDB = require('./config/db.config')
const { uploadToR2 } = require('./uploadToR2')

const Product = require('./models/product.model')
const User = require('./models/user.model')
const Adsense = require('./models/adsense.model')
const Make = require('./models/make.model')

// Render-də disk mount path — sizin UPLOAD_DIR ilə eyni olmalıdır
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads')

// yaddaşda tutulan keş: eyni fayl adını iki dəfə yükləməmək üçün
// key: köhnə fayl adı (məs. "12345-foto.jpg"), value: yeni R2 URL
const migratedCache = new Map()

async function migrateOneFile(oldFileName) {
  // əgər artıq tam URL-dirsə (məs. onsuz da R2-yə köçürülübsə), toxunma
  if (!oldFileName || oldFileName.startsWith('http')) {
    return oldFileName
  }

  if (migratedCache.has(oldFileName)) {
    return migratedCache.get(oldFileName)
  }

  const filePath = path.join(UPLOAD_DIR, oldFileName)

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Fayl diskdə tapılmadı, keçilir: ${oldFileName}`)
    return oldFileName // dəyişməz saxla ki, data itməsin
  }

  const buffer = fs.readFileSync(filePath)
  const ext = path.extname(oldFileName).toLowerCase()
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
  }
  const mimeType = mimeMap[ext] || 'application/octet-stream'

  const newUrl = await uploadToR2(buffer, oldFileName, mimeType)
  migratedCache.set(oldFileName, newUrl)
  console.log(`✅ Köçürüldü: ${oldFileName} → ${newUrl}`)
  return newUrl
}

async function migrateProducts() {
  console.log('\n--- Elanlar (Product) köçürülür ---')
  const products = await Product.find({}).select('_id images')
  let updatedCount = 0

  for (const product of products) {
    if (!product.images || product.images.length === 0) continue

    const newImages = []
    let changed = false

    for (const img of product.images) {
      const newUrl = await migrateOneFile(img)
      if (newUrl !== img) changed = true
      newImages.push(newUrl)
    }

    if (changed) {
      await Product.updateOne({ _id: product._id }, { images: newImages })
      updatedCount++
    }
  }
  console.log(`Elanlar bitdi. Yenilənən sənəd sayı: ${updatedCount}`)
}

async function migrateUsers() {
  console.log('\n--- İstifadəçilər (User profil şəkli) köçürülür ---')
  const users = await User.find({ profile: { $exists: true, $ne: null } }).select('_id profile')
  let updatedCount = 0

  for (const user of users) {
    if (!user.profile) continue
    const newUrl = await migrateOneFile(user.profile)
    if (newUrl !== user.profile) {
      await User.updateOne({ _id: user._id }, { profile: newUrl })
      updatedCount++
    }
  }
  console.log(`İstifadəçilər bitdi. Yenilənən sənəd sayı: ${updatedCount}`)
}

async function migrateAdsense() {
  console.log('\n--- Reklamlar (Adsense) köçürülür ---')
  const ads = await Adsense.find({ image: { $exists: true, $ne: null } }).select('_id image')
  let updatedCount = 0

  for (const ad of ads) {
    if (!ad.image) continue
    const newUrl = await migrateOneFile(ad.image)
    if (newUrl !== ad.image) {
      await Adsense.updateOne({ _id: ad._id }, { image: newUrl })
      updatedCount++
    }
  }
  console.log(`Reklamlar bitdi. Yenilənən sənəd sayı: ${updatedCount}`)
}

async function migrateMakes() {
  console.log('\n--- Markalar (Make logo) köçürülür ---')
  const makes = await Make.find({ logo: { $exists: true, $ne: null } }).select('_id logo')
  let updatedCount = 0

  for (const make of makes) {
    if (!make.logo) continue
    const newUrl = await migrateOneFile(make.logo)
    if (newUrl !== make.logo) {
      await Make.updateOne({ _id: make._id }, { logo: newUrl })
      updatedCount++
    }
  }
  console.log(`Markalar bitdi. Yenilənən sənəd sayı: ${updatedCount}`)
}

async function run() {
  console.log('Mongo-ya qoşulur...')
  await connectDB()

  await migrateProducts()
  await migrateUsers()
  await migrateAdsense()
  await migrateMakes()

  console.log('\n🎉 Bütün köçürmə bitdi!')
  await mongoose.connection.close()
  process.exit(0)
}

run().catch((err) => {
  console.error('Migrasiya zamanı xəta:', err)
  process.exit(1)
})