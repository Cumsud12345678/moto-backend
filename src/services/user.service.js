const Product = require('../models/product.model')
const Favori = require('../models/favori.model')

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
  return await Favori.find({user: id, isActive: true}).populate({
    path: 'product',
    populate: [
      { path: 'make' },
      { path: 'model' },
      { path: 'city' }
    ]
  }).lean()
}


module.exports = {
  setFavori,
  deleteFavori,
  getFavorites,
}