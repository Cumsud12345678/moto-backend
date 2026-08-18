const Product = require('../models/product.model')
const Favori = require('../models/favori.model')

const getProducts = async (filter) => {
  return products = await Product.find(filter)
  .populate('make')
  .populate('model')
  .populate('city')
  .lean()
}

const setFavori = async ({data, type, id=null}) => {
  
  if(type == 'array'){
    await Promise.all(
      data.map( async (prId) => {
        await Favori.create({
          user: id,
          product: prId
        })

        await Product.findByIdAndUpdate(prId,
          {
            $inc: { favoriteCount: 1 }
          }
        )
      })
    )
    
    return true
  }else {
    const favori = await Favori.create(data)
    if(favori) {
      await Product.findByIdAndUpdate(data.product, {
        $inc: { favoriteCount: 1 }
      })
      return true
    }
  }
}

const deleteFavori = async (data) => {
  await Favori.findOneAndDelete(data)
  await Product.findByIdAndUpdate(data.product,
    {
      $inc: { favoriteCount: -1 }
    }
  )

  return true
}

const getFavorites = async (id) => {
  const favorites = await Favori.find({user: id}).populate({
    path: 'product',
    match: { isActive: true },
    populate: [
      { path: 'make' },
      { path: 'model' },
      { path: 'city' }
    ]
  }).lean()

  return favorites.filter(f => f.product !== null)
}


const getFavoritesNotLogin = async(favorites) => {
  return getProducts({ _id: { $in: favorites }, isActive: true })
}


module.exports = {
  setFavori,
  deleteFavori,
  getFavorites,

  getFavoritesNotLogin
}