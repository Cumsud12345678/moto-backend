const userService = require('../services/user.service')
const fs = require("fs");
const path = require("path");
const formatDate = require("../utils/dateFormatter");

// FAVORITES
const setFavori = async (req, res, next) => {
  try{

    let success = null
    
    if(Array.isArray(req.body.data)){
      success = await userService.setFavori({data: req.body.data, type: 'array', id: req.user.id})
    }else{
      const data = {
        user: req.user.id,
        product: req.body.data
      }
      success = await userService.setFavori({data: data, type: 'string'})
    }
    
    res.status(200).json({ success, message: 'Uğurla əlavə olundu' })

  }catch(err){
    next(err)
  }
}

const deleteFavori = async (req, res, next) => {
  try{
    const data = {
      user: req.user.id,
      product: req.params.id
    }

    const success = await userService.deleteFavori(data)
    res.status(200).json({ success, message: 'Uğurla silindi' })
  }catch(err){
    next(err)
  }
}

const getFavorites = async (req, res, next) => {
  try{
    const products = await userService.getFavorites(req.user.id)
    const formattedProducts = products.map(item => ({
      ...item,
      product: {
        ...item.product,
        createdAt: formatDate(item.product.createdAt)
      }
    }))
    res.status(200).json({ success: true, data: formattedProducts })
  }catch(err){
    next(err)
  }
}


module.exports = {
  setFavori,
  deleteFavori,
  getFavorites,
}