const Product = require('../models/product.model')
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

const fs = require('fs/promises');
const path = require('path')
const mongoose = require('mongoose')

// HOME PAGE
const getAllProduct = async (userId) => {
  const pipeline = [
    { $match: { isActive: true } },
    { $sample: { size: 10 } }, // random istəsən $sample: { size: 10 } yaz
    {
      $project: {
        price: 1, year: 1, mileage: 1, volume: 1,
        make: 1, model: 1, city: 1, images: 1
      }
    },
    {
      $lookup: {
        from: 'makes', localField: 'make', foreignField: '_id', as: 'make'
      }
    },
    { $unwind: { path: '$make', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'models', localField: 'model', foreignField: '_id', as: 'model'
      }
    },
    { $unwind: { path: '$model', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'cities', localField: 'city', foreignField: '_id', as: 'city'
      }
    },
    { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
  ]

  if (userId) {
    pipeline.push(
      {
        $lookup: {
          from: 'favoris',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$product', '$$productId'] },
                    { $eq: ['$user', new mongoose.Types.ObjectId(userId)] }
                  ]
                }
              }
            }
          ],
          as: 'likeInfo'
        }
      },
      {
        $addFields: {
          is_liked: { $gt: [{ $size: '$likeInfo' }, 0] }
        }
      },
      { $project: { likeInfo: 0 } }
    )
  } else {
    pipeline.push({ $addFields: { is_liked: false } })
  }

  return await Product.aggregate(pipeline)
}


// AUTOS PAGE
const getFilteredProducts = async (query) => {
  
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

  if(make) filter.make = make;
  if(model) filter.model = model;
  if(category) filter.category = category;
  if(status) filter.status = status;
  if(fuel) filter.fuel = fuel
  if(city) filter.city = city
  if(color) filter.color = color
  if(speed) filter.speed = speed
  if (equipments) {
    const equipmentIds = Array.isArray(equipments)
      ? equipments
      : equipments.split(',').filter(Boolean)

    if (equipmentIds.length > 0) {
      // Məhsul SEÇİLMİŞ AVADANLIQLARIN HAMISINI daşımalıdırsa:
      // filter.equipments = { $all: equipmentIds }

      // Yoxsa, ən azı BİRİNİ daşıması kifayətdirsə:
      filter.equipments = { $in: equipmentIds }
    }
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

  const result = await Product.find(filter)
    .populate('make')
    .populate({ path: 'model', select: 'label' })
    .populate('city')
  
  console.log('result:', result)
  return result
}

// DETAILS PAGE
const getProductDetails = async (id) => {
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

const getSimilarProducts = async (currentProduct, limit = 8) => {
  const { _id, make, model, category, price } = currentProduct;

  // Make && Model e gore
  let similar = await Product.find({
    _id: { $ne: _id },
    make,
    model,
    isActive: true
  })
  .populate('make')
  .populate({ path: 'model', select: 'label' })
  .populate('city')
  .limit(limit)

  console.log(similar.length)

  // Make ye gore
  if(similar.length < limit) {
    console.log('make')
    const more = await Product.find({
      _id: { $ne: _id, $nin: similar.map(p => p._id) },
      make,
      isActive: true
    })
    .populate('make')
    .populate({ path: 'model', select: 'label' })
    .populate('city')
    .limit(limit - similar.length)
    similar = [...similar,...more]
  }

  // Price && Category
  if(similar.length < limit){
    console.log('category price')
    const priceRange = { $gte: price * 0.7, $lte: price * 1.7 }
    const more = await Product.find({
      _id: { $ne: _id, $nin: similar.map(p => p._id) },
      isActive: true,
      $or: [
        {category},
        {
          price: priceRange
        }
      ]
    })
    .populate('make')
    .populate({ path: 'model', select: 'label' })
    .populate('city')
    .limit(limit - similar.length)
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
  const product = await Product.findById(id)

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

// BOOKMARKS PAGE
const getFavoritesNotLogin = async(favorites) => {
  return await Product.find({
    _id: { $in: favorites },
    isActive: true,
  }).populate('make').populate('model')
}


const getUserProducts = async (id) => {
  return await Product.find({user: id}).populate('make').populate('model').populate('city')
}

const updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true })
}

module.exports = {
  
  getAllProduct,

  getFilteredProducts,

  getProductDetails,
  getSimilarProducts,

  getMetadata,

  getFavoritesNotLogin,

  createProduct,

  deleteProduct,
  getUserProducts,

  updateProduct
}