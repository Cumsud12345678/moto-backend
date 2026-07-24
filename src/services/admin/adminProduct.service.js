const Product = require('../../models/product.model')
const DeletedProduct = require('../../models/delete.product.model')
const path = require('path')
const fs = require('fs/promises')

const getProducts = async () => {
  return await Product.find()
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
  .limit(10)
}

const getProduct = async (query) => {
  const { id } = query
  const filter = {}

  if(id) filter._id = id

  console.log(id)

  return await Product.find(filter)
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
  .find({ user: id })
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

const deactiveProduct = async (id) => {
  return await Product.findByIdAndUpdate(id, 
    { 
      isActive: false,
      deactiveAt: new Date()
    },
    { returnDocument: 'after' }
  )
}

const activeProduct = async (id) => {
  return await Product.findByIdAndUpdate(id, 
    { 
      isActive: true,
      deactiveAt: null
    },
    { returnDocument: 'after' }
  )
}

// Delete Product
const deleteProduct = async (id, text) => {
  const product = await Product.findOne({_id: id}).populate('user')
  await DeletedProduct.create({
    user: product.user._id,
    product_id: id,
    description: text
  })

  for(const image of product.images) {
    const imagePath = path.join(__dirname, "../../uploads", image)

    try{
      await fs.unlink(imagePath)
    }catch(err){
      console.log(err)
    }
  }
  
  return await Product.findByIdAndDelete(id)
}

const updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, {
    returnDocument: 'after'
  })
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

const getDeletedProducts = async () => {
  return await DeletedProduct.find().populate('user').limit(10)
}

const deleteDeletedProducts = async (id) => {
  await DeletedProduct.findByIdAndDelete(id)
  return true
}

module.exports = {
  getProducts,
  getProduct,
  getUserProducts,
  deactiveProduct,
  activeProduct,
  deleteProduct,
  updateProduct,
  getProductStats,

  getDeletedProducts,
  deleteDeletedProducts
}