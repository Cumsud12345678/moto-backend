const adminAdsenseService = require('../../services/admin/adminAdsense.service')
const formatDate = require("../../utils/dateFormatter");
const path = require('path')
const fs = require('fs/promises')
const { UPLOAD_DIR } = require('../../middlewares/upload.middleware');

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
    const newAdsense = await adminAdsenseService.createAdsense({
      ...req.body,
      image: req.file.filename
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
      res.status(404).json({message: 'Reklam tapilmadi'})
    }

    const success = await adminAdsenseService.deleteAdsense(req.params.id)

    if(success) {
      const imagePath = path.join(UPLOAD_DIR, adsense.image)
      try {
        await fs.unlink(imagePath)
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