const User = require('../models/user.model')
const Product = require('../models/product.model')
const City = require('../models/city.model')
const Favori = require('../models/favori.model')

const getUser = async (phone) => {
  return await User.findOne({phone: phone})
}

const getUserById = async (id) => {
  return await User.findById(id)
}

const createUser = async (userData) => {
  return await User.create(userData)
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
  return await Favori.find({user: id}).populate({
    path: 'product',
    populate: [
      { path: 'make' },
      { path: 'model' },
      { path: 'city' }
    ]
  })
}


const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, {returnDocument: 'after', runValidators: true})
}


module.exports = {
  getUser,
  getUserById,
  createUser,

  setFavori,
  deleteFavori,
  getFavorites,

  updateUser
}