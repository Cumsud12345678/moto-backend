const adminProductService = require('../../services/admin/adminProduct.service')
const adminUserService = require('../../services/admin/adminUser.service')

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const getProducts = async (req, res, next) => {
  try{
    const page = Number(req.query.page) || 1
    const limit = 2
    const skip = (page - 1) * limit
    const products = await adminProductService.getProducts(skip, limit)
    res.status(200).json({success: true, data: products})
  }catch(err){
    next(err)
  }
}

const getProduct = async (req, res, next) => {
  try{
    const product = await adminProductService.getProduct(req.query)
    res.status(200).json({success: true, data: product})
  }catch(err){ 
    next(err)
  }
}

const getUserProducts = async (req, res, next) => {
  try {
    const products = await adminProductService.getUserProducts(req.params.id)
    res.status(200).json({ success: true, data: products })
  }catch(err) {
    next(err)
  }
}

const deactiveProduct = async (req, res, next) => {
  try{
    const updatedProduct = await adminProductService.deactiveProduct(req.params.id)
    if(updatedProduct.isActive) return res.status(500).json({ success: false, message: 'Bir xəta baş verdi' })
    res.status(200).json({ success: true })
  }catch(err){
    next(err)
  }
}

const activeProduct = async (req, res, next) => {
  try{
    const updatedProduct = await adminProductService.activeProduct(req.params.id)
    if(!updatedProduct.isActive) return res.status(500).json({ success: false, message: 'Bir xəta baş verdi' })
    res.status(200).json({ success: true })
  }catch(err){
    next(err)
  }
}

const deleteProduct = async (req, res, next) => {
  try{
    const deletedProduct = await adminProductService.deleteProduct(req.params.id, req.body.desc)
    res.status(200).json({ success: true })
  }catch(err){
    next(err)
  }
}

const updateProduct = async (req, res, next) => {
  try{
    const updatedProduct = await adminProductService.updateProduct(req.params.id, req.body)
    res.status(200).json({ success: true })
  }catch(err){
    next(err)
  }
}

const getProductStats = async (req, res, next) => {
  try{
    const now = dayjs().tz('Asia/Baku')

    const startOfDay = now.startOf('day').toDate()
    const onWeekAgo = now.subtract(7, 'day').startOf('day').toDate()
    const oneMonthAgo = now.startOf('month').toDate()

    const data = await adminProductService.getProductStats(startOfDay, onWeekAgo, oneMonthAgo)
    res.status(200).json({success: true, data: data})
  }catch(err){
    next(err)
  }
}

const getDeletedProducts = async (req, res, next) => {
  try{
    const page = Number(req.query.page) || 1
    const limit = 1
    const skip = (page - 1) * limit
    const data = await adminProductService.getDeletedProducts(skip, limit)
    res.status(200).json({success: true, data: data})
  }catch(err){
    next(err)
  }
}

const getDeletedProduct = async (req, res, next) => {
  try{
    const data = await adminProductService.getDeletedProduct(req.query)
    res.status(200).json({success: true, data: data})
  }catch(err){
    next(err)
  }
}

const deleteDeletedProducts = async (req, res, next) => {
  try{
    const success = await adminProductService.deleteDeletedProducts(req.params.id)
    res.status(200).json({success})
  }catch(err){
    next(err)
  }
}


module.exports = {
  getProducts,
  getProduct,
  getUserProducts,
  deactiveProduct,
  activeProduct,
  deleteProduct,
  updateProduct,
  getProductStats,

  getDeletedProducts,
  getDeletedProduct,
  deleteDeletedProducts
}