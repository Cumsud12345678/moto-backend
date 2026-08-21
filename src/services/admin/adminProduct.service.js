const Product = require('../../models/product.model')
const User = require('../../models/user.model')
const DeletedProduct = require('../../models/delete.product.model')
const Favori = require('../../models/favori.model')
const SystemMessage = require('../../models/systemMessage.model')
const path = require('path')
const fs = require('fs/promises')
const { default: mongoose } = require('mongoose')
const { UPLOAD_DIR } = require('../../middlewares/upload.middleware');

const getProducts = async (skip, limit) => {
  const [products, total] = await Promise.all([
    Product.find().skip(skip).limit(limit).lean()
      .populate('make').populate('model')
      .populate('category').populate('fuel')
      .populate('speed').populate('city')
      .populate('color').populate('status')
      .populate('equipments').populate('user'),
    Product.countDocuments()
  ])
  return {
    products,
    total: Math.ceil(total / limit)
  }
}

const getProduct = async (query) => {
  const { id, phone } = query
  const filter = {}

  if(id) filter._id = id
  if(phone) filter.phone = phone

  return await Product.find(filter).lean()
  .populate('make')
  .populate('model')
  .populate('category')
  .populate('fuel')
  .populate('speed')
  .populate('city')
  .populate('color')
  .populate('status')
  .populate('equipments')
  .populate('user')
}

const getUserProducts = async (id) => {
  return await Product
  .find({ user: id }).lean()
  .populate('make')
  .populate('model')
  .populate('category')
  .populate('fuel')
  .populate('speed')
  .populate('city')
  .populate('color')
  .populate('status')
  .populate('equipments')
  .populate('user')
}

// Delete Product
const deleteProduct = async (id, text, adminId) => {
  const product = await Product.findOne({_id: id}).populate('user')

  await Promise.all([
    DeletedProduct.create({
      user: product.user._id,
      product: id,
      phone: product.phone,
      reason: text,
      deletedBy: adminId,
      type: 'admin'
    }),
      
    SystemMessage.create({
      type: 'punishment',
      user: product.user._id,
      message: text
    })
  ])

  for(const image of product.images) {
    const imagePath = path.join(UPLOAD_DIR, image)

    try{
      await fs.unlink(imagePath)
    }catch(err){
      if (err.code === 'ENOENT') {
        console.warn('Fayl onsuz da mövcud deyil (silinməyə ehtiyac yoxdur):', image)
      } else {
        console.error('Fayl silinmədi:', image, err)
      }
    }
  }

  await Favori.deleteMany({product: product._id})
  return await Product.findByIdAndDelete(id)
}

const getProductStats = async (startOfDay, onWeekAgo, oneMonthAgo) => {
  const [today, week, month, all] = await Promise.all([
    Product.countDocuments({createdAt: { $gte: startOfDay }}),
    Product.countDocuments({createdAt: { $gte: onWeekAgo }}),
    Product.countDocuments({createdAt: { $gte: oneMonthAgo }}),
    Product.countDocuments()
  ])

  return {
    today,
    week,
    month, 
    all
  }
}

const getDeletedProducts = async (skip, limit) => {
  const [products, total] = await Promise.all([
    DeletedProduct.find().skip(skip).limit(limit).lean().populate('user'),
    DeletedProduct.countDocuments()
  ])
  return {
    products,
    total: Math.ceil(total / limit)
  }
}

const getDeletedProduct = async (query) => {
  const filter = {}
  if(query.productID) filter.product = query.productID;
  if(query.phone) {
    filter.phone = query.phone;
  }
  if (query.userEmail) {
    const user = await User.findOne({ email: query.userEmail });
    if (!user) return [];
    return await DeletedProduct.find({ user: user._id }).populate('user');
  }

  return await DeletedProduct.find(filter).populate('user').lean()
}

const deleteDeletedProducts = async (id) => {
  await DeletedProduct.findByIdAndDelete(id)
  return true
}

module.exports = {
  getProducts,
  getProduct,
  getUserProducts,
  deleteProduct,
  getProductStats,

  getDeletedProducts,
  getDeletedProduct,
  deleteDeletedProducts
}