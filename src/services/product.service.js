const Product = require('../models/product.model')
const Favori = require('../models/favori.model')
const Make = require('../models/make.model')
const Model = require('../models/model.model')
const Category = require('../models/category.model')
const Fuel = require('../models/fuel.model')
const Speed = require('../models/speed.model')
const City = require('../models/city.model')
const Color = require('../models/color.model')
const Status = require('../models/status.model')
const User = require('../models/user.model')
const Equipment = require('../models/equipment.model')
const DeletedProduct = require('../models/delete.product.model')

const fs = require('fs/promises');
const path = require('path')
const mongoose = require('mongoose')


// HOME PAGE
const getAllProduct = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit
  
  const pipeline = buildPipeline({isActive: true}, {createdAt: -1}, skip, limit, userId)
  
  const [products, total] = await Promise.all([
    Product.aggregate(pipeline),
    Product.countDocuments({ isActive: true })
  ])
  
  const hasMore = skip + products.length < total

  return { products, hasMore }
}


// AUTOS PAGE
const getFilteredProducts = async (query, userId, page, limit) => {
  const skip = (page - 1) * limit

  const filter = buildFilter(query)
  const pipeline = buildPipeline(filter, {createdAt: -1}, skip, limit, userId)
  
  const [products, total] = await Promise.all([
    Product.aggregate(pipeline),
    Product.countDocuments(filter)
  ])

  return {
    products,
    total: Math.ceil(total / limit)
  }

}

const getDetailsById = async (id) => {
  return await Product.findById(id)
  .populate('make')
  .populate('model')
  .populate('fuel')
  .populate('speed')
  .populate('city')
  .populate('color')
  .populate('status')
  .populate('equipments')
  .populate('user')
  .populate('category')
}

const getDetailsOne = async (filter) => {
  return product = await Product.findOne(filter)
  .populate('make')
  .populate('model')
  .populate('fuel')
  .populate('speed')
  .populate('city')
  .populate('color')
  .populate('status')
  .populate('equipments')
  .populate('user')
  .populate('category')
}

const getProducts = async (filter) => {
  return products = await Product.find(filter)
  .populate('make')
  .populate('model')
  .populate('city')
  .lean()
}

const getFavoritesIDS = async (userId) => {
  return ids = await Favori.find({ user: userId }).distinct("product");
}

// const getSimilarProducts = async (details, limit = 8) => {
//   const { _id, make, model, category, price } = details;

//   // Make && Model e gore
//   let similar = await Product.find({
//     _id: { $ne: _id },
//     make,
//     model,
//     isActive: true
//   })
//   .populate('make')
//   .populate({ path: 'model', select: 'label' })
//   .populate('city')
//   .limit(limit)
//   .lean()

//   // Make ye gore
//   if(similar.length < limit) {
//     const more = await Product.find({
//       _id: { $ne: _id, $nin: similar.map(p => p._id) },
//       make,
//       isActive: true
//     })
//     .populate('make')
//     .populate({ path: 'model', select: 'label' })
//     .populate('city')
//     .limit(limit - similar.length)
//     .lean()

//     similar = [...similar,...more]
//   }

//   // Price && Category
//   if(similar.length < limit){
//     const priceRange = { $gte: price * 0.7, $lte: price * 1.7 }
//     const more = await Product.find({
//       _id: { $ne: _id, $nin: similar.map(p => p._id) },
//       isActive: true,
//       $or: [
//         {category},
//         {
//           price: priceRange
//         }
//       ]
//     })
//     .populate('make')
//     .populate({ path: 'model', select: 'label' })
//     .populate('city')
//     .limit(limit - similar.length)
//     .lean()

//     similar = [...similar, ...more]
//   }

//   return similar;
// }

const getSimilarProducts = async (details, limit = 8, userId) => {
  const { _id, make, model, category, price } = details;

  const makeId = make?._id;
  const modelId = model?._id;
  const categoryId = category?._id;
  
  // Make && Model e gore
  const pipelineMM = buildPipeline(
    {
      _id: { $ne: _id },
      makeId,
      modelId,
      isActive: true
    },
    {createdAt: -1}, 0, limit, userId
  )

  let similar = await Product.aggregate(pipelineMM)
  
  // Make ye gore
  if(similar.length < limit) {
    const pipelineM = buildPipeline(
      {
        _id: { $ne: _id, $nin: similar.map(p => p._id) },
        makeId,
        isActive: true
      },
      {createdAt: -1}, 0, limit, userId
    )

    const more = await Product.aggregate(pipelineM)
    
    similar = [...similar,...more]
  }

  // Price && Category
  if(similar.length < limit){
    const priceRange = { $gte: price * 0.7, $lte: price * 1.7 }
    const pipelinePC = buildPipeline(
      {
        _id: { $ne: _id, $nin: similar.map(p => p._id) },
        isActive: true,
        $or: [
          {categoryId},
          {
            price: priceRange
          }
        ]
      },
      {createdAt: -1}, 0, limit, userId
    )
    const more = await Product.aggregate(pipelinePC)

    similar = [...similar, ...more]
  }

  return similar;
}

// METADATA
const getMetadata = async () => {
  const [ 
    makes, models, fuels, speeds, cities, colors, categories, statuses, equipments 
  ] = 
    await Promise.all([
      Make.find(),
      Model.find(),
      Fuel.find(),
      Speed.find(),
      City.find(),
      Color.find(),
      Category.find(),
      Status.find(),
      Equipment.find()
  ])

  return {
    makes,
    models,
    fuels,
    speeds,
    cities,
    colors,
    categories,
    statuses,
    equipments
  }
}

// PROFILE PAGE
const createProduct = async (productData) => {
  return await Product.create(productData)
}

const deleteProduct = async (id) => {
  const product = await Product.findById(id).populate('user')

  await DeletedProduct.create({
    user: product.user._id,
    phone: product.phone,
    product_id: id,
    description: ''
  })

  for(const image of product.images){
    
    const imagePath = path.join(__dirname, '../uploads', image)

    try{
      await fs.unlink(imagePath)
    }catch(err){
      console.log(err)
    }
  }

  await Product.findByIdAndDelete(id);
  return 'Silindi'

}

const updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true })
}

// BOOKMARKS PAGE
const getFavoritesNotLogin = async(favorites) => {
  return getProducts({ _id: { $in: favorites }, isActive: true })
}

const getUserProduct = async (id, userId) => {
  return await getDetailsOne({ _id: id, user: userId })
}

const getUserProducts = async (id) => {
  return await getProducts({user: id})
}

// Builds
const buildPipeline = (filter, sort, skip, limit, userId) => {

  const pipeline = [
    { $match: filter },
    { $sort: sort },   // ✅ təsadüfi yerinə sıralı
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        price: 1, year: 1, mileage: 1, volume: 1,
        make: 1, model: 1, city: 1, images: 1,
        createdAt: 1
      }
    },
    { $lookup: { from: 'makes', localField: 'make', foreignField: '_id', as: 'make' } },
    { $unwind: { path: '$make', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'models', localField: 'model', foreignField: '_id', as: 'model' } },
    { $unwind: { path: '$model', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'cities', localField: 'city', foreignField: '_id', as: 'city' } },
    { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
  ]

  if (userId) {
    pipeline.push(
      {
        $lookup: {
          from: 'favoris',
          let: { productId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ['$product', '$$productId'] },
              { $eq: ['$user', new mongoose.Types.ObjectId(userId)] }
            ]}}}
          ],
          as: 'likeInfo'
        }
      },
      { $addFields: { is_liked: { $gt: [{ $size: '$likeInfo' }, 0] } } },
      { $project: { likeInfo: 0 } }
    )
  } else {
    pipeline.push({ $addFields: { is_liked: false } })
  }

  return pipeline
}

const buildFilter = (query) => {
  const { 
    make, model, category, status, fuel, city, color, speed, 
    equipments,
    minPrice, maxPrice,
    minYear, maxYear,
    minEngine, maxEngine,
    minVolume, maxVolume,
    minDistance, maxDistance
  } = query

  const filter = {}

  filter.isActive = true;

  if (make) filter.make = toObjectId(make)
  if (model) filter.model = toObjectId(model)
  if (category) filter.category = toObjectId(category)
  if (status) filter.status = toObjectId(status)
  if (fuel) filter.fuel = toObjectId(fuel)
  if (city) filter.city = toObjectId(city)
  if (color) filter.color = toObjectId(color)
  if (speed) filter.speed = toObjectId(speed)

  if (equipments) {
    const equipmentIds = (Array.isArray(equipments) ? equipments : equipments.split(','))
      .filter(Boolean)
      .map(toObjectId)
    if (equipmentIds.length > 0) filter.equipments = { $in: equipmentIds }
  }
  
  const addRange = (field, min, max) => {
    if ((min !== undefined && min !== '') || (max !== undefined && max !== '')) {
      filter[field] = {}
      if (min !== undefined && min !== '') filter[field].$gte = Number(min)
      if (max !== undefined && max !== '') filter[field].$lte = Number(max)
    }
  }

  addRange('price', minPrice, maxPrice)
  addRange('year', minYear, maxYear)
  addRange('engine', minEngine, maxEngine)
  addRange('volume', minVolume, maxVolume)
  addRange('mileage', minDistance, maxDistance) // "distance" = mileage sahəsi

  return filter
}

const toObjectId = (id) => 
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id


module.exports = {
  
  getAllProduct,

  getFilteredProducts,

  getFavoritesIDS,

  getDetailsOne,

  getDetailsById,
  getSimilarProducts,

  getMetadata,

  getFavoritesNotLogin,

  createProduct,

  deleteProduct,

  getUserProducts,
  getUserProduct,

  updateProduct
}