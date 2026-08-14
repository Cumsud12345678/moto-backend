const Adsense = require('../../models/adsense.model')

const getAllAdsense = async () => {
  return await Adsense.find().lean()
}

const getAdsenseById = async (id) => {
  return await Adsense.findById(id)
}

const createAdsense = async (data) => {
  return await Adsense.create(data)
}

const clickAdsense = async (id) => {
  await Adsense.findByIdAndUpdate(
    id,
    { $inc: { click: 1 } }
  )

  return true
}

const deleteAdsense = async (id) => {
  await Adsense.findByIdAndDelete(id)
  return true
}

module.exports = {
  getAllAdsense,
  getAdsenseById,
  createAdsense, 
  clickAdsense,
  deleteAdsense
}