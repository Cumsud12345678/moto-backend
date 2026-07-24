const { models } = require('mongoose')
const adminMetadataService = require('../../services/admin/adminMetadata.service')
const path = require('path')
const fs = require('fs/promises')

const getMetadata = async (req, res, next) => {
  try{
    const data = await adminMetadataService.getMetadata()
    res.status(200).json({ success: true, data: data })
  }catch(err){
    next(err)
  }
}

const createMetadata = async (req, res, next) => {
  try{
    let imageUrl = null
    let models = null
    if(req.file) {
      imageUrl = req.file.filename
    }
    if(req.body.models){
      models = JSON.parse(req.body.models)
    }
    const success = await adminMetadataService.createMetadata(req.body, imageUrl, models)
    res.status(200).json({success})
  }catch(err){
    next(err)
  }
}

const deleteMetadata = async (req, res, next) => {
  try{
    if(req.body.data.type == 'makes'){
      const make = await adminMetadataService.getMake(req.body.data.id)
      const deletedPath = path.join(__dirname, '../../uploads', make.logo)
      try {
        await fs.unlink(deletedPath);
      } catch (err) {
        console.error("Köhnə şəkil silinmədi:", err.message);
      }
    }

    const success = await adminMetadataService.deleteMetadata(req.body.data)
    res.status(200).json({success})
  }catch(err){
    next(err)
  }
}

module.exports = {
  getMetadata,
  createMetadata,
  deleteMetadata
}