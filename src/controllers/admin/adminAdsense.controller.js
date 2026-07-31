const adminAdsenseService = require('../../services/admin/adminAdsense.service')
const formatDate = require("../../utils/dateFormatter");

const getAdsense = async (req, res, next) => {
  try{
    const data = await adminAdsenseService.getAdsense()
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
    const success = await adminAdsenseService.deleteAdsense(req.params.id)
    res.status(200).json({success})
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