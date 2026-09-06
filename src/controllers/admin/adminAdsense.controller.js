const adminAdsenseService = require('../../services/admin/adminAdsense.service')
const formatDate = require("../../utils/dateFormatter");
const path = require('path')
const fs = require('fs/promises')
const { deleteFromR2, uploadToR2 } = require('../../uploadToR2') // öz yolunuza uyğun dəyişin

const getAdsense = async (req, res, next) => {
  try{
    const data = await adminAdsenseService.getAllAdsense()
    const formattedData = data.map(ads => ({
      ...ads,
      createdAt: formatDate(ads.createdAt)
    }))
    res.status(200).json({success: true, data: formattedData})
  }catch(err){
    next(err)
  }
}



const createAdsense = async (req, res, next) => {
  try{
    const uniqueName = Date.now() + '-' + req.file.originalname
    const imageUrl = await uploadToR2(req.file.buffer, uniqueName, req.file.mimetype)

    const newAdsense = await adminAdsenseService.createAdsense({
      ...req.body,
      image: imageUrl
    })
    res.status(200).json({success: true, data: newAdsense})
  }catch(err){
    next(err)
  }
}

const clickAdsense = async (req, res, next) => {
  try{
    const success = await adminAdsenseService.clickAdsense(req.params.id)
    res.status(200).json({success})
  }catch(err){
    next(err)
  }
}



const deleteAdsense = async (req, res, next) => {
  try{
    const adsense = await adminAdsenseService.getAdsenseById(req.params.id)
    if(!adsense) {
      return res.status(404).json({message: 'Reklam tapilmadi'})
    }

    const success = await adminAdsenseService.deleteAdsense(req.params.id)

    if(success) {
      try {
        await deleteFromR2(adsense.image)
      } catch (err) {
        console.log(err)
      }

      res.status(200).json({success})
    }
  }catch(err) {
    next(err)
  }
}

module.exports = {
  getAdsense,
  createAdsense,
  clickAdsense,
  deleteAdsense
}