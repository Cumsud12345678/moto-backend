const Adsense = require('../../models/adsense.model')

const getAdsense = async () => {
  return await Adsense.find().lean()
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
  return await Adsense.findByIdAndDelete(id)
}

module.exports = {
  getAdsense,
  createAdsense, 
  clickAdsense,
  deleteAdsense
}