const productService = require('../services/product.service');
const Product = require('../models/product.model');
const fs = require("fs");
const path = require("path");
const formatDate = require("../utils/dateFormatter");
const { uploadToR2, deleteFromR2 } = require('../uploadToR2') // öz yolunuza uyğun dəyişin

// HOME
const getProducts = async (req, res, next) => {
  try{
    const userId = req.user?.id || null
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 12
    
    const { products, hasMore } = await productService.getAllProduct(userId, page, limit)
    const formattedProducts = products.map(product => ({
      ...product,
      createdAt: formatDate(product.createdAt)
    }))
    return res.status(200).json({ success: true, data: formattedProducts, hasMore })
  }catch(err){
    next(err);
  }
}

// AUTOS
const getFilteredProducts = async (req, res, next) => {
  try{
    const userId = req.user?.id || null
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 12

    const {products, total} = await productService.getFilteredProducts(req.query, userId, page, limit)
    const formattedProducts = products.map(product => ({
      ...product,
      createdAt: formatDate(product.createdAt)
    }))
    res.status(200).json({success: true, data: formattedProducts, total})
  }catch(err){
    next(err)
  }
}

// METADATA
const getMetadata = async (req, res, next) => {
  try{
    const data = await productService.getMetadata()
    res.status(200).json({ success: true, data: data })
  }catch(err){
    next(err)
  }
}

// DETAILS
const getProductDetails = async (req, res, next) => {
  try{
    const userId = req.user?.id || null
    let ids = null
    if(userId) {
      ids = await productService.getFavoritesIDS(userId)
    }
    const data = await productService.getDetailsById(req.params.id)
    res.status(200).json({ success: true, data: data, ids: ids })
  }catch(err){
    next(err)
  }
}

// SIMILARS
const getSimilarProducts = async (req, res, next) => {
  try{
    const userId = req.user?.id || null
    const limit = 12

    const details = await productService.getDetailsById(req.params.id)
    if (!details) return res.status(404).json({ success: false, message: "Elan tapılmadı" });

    const similarProducts = await productService.getSimilarProducts(details, limit, userId)

    const formattedProducts = similarProducts.map(product => ({
      ...product,
      createdAt: formatDate(product.createdAt)
    }))
    
    res.status(200).json({ success: true, data: formattedProducts})
  }catch(err){
    next(err)
  }
}

// NEW PRODUCT
const createProduct = async (req, res, next) => {
  try{
    const {
      price, phone, year, mileage, description, volume, power,
      make, model, category, fuel, speed, city, color, status
    } = req.body

    if(!make || !model || !year || !volume || !phone){
      return res.status(400).json({ success: false, message: 'Marka, model, il, həcm və nömrə məlumatlarıı tam deyil' })
    }
    if(!category || !status || !color || !fuel || !speed){
      return res.status(400).json({ success: false, message: 'Bütün kateqoriya/rəng/yanacaq/sürətlər qutusu sahələri doldurulmalıdır' })
    }
    if(!city){
      return res.status(400).json({ success: false, message: 'Şəhər seçilməlidir' })
    }
    if(!price || Number(price) <= 0){
      return res.status(400).json({ success: false, message: 'Qiymət düzgün deyil' })
    }
    if(!power || Number(power) <= 0){
      return res.status(400).json({ success: false, message: 'Mühərrikin gücü düzgün deyil' })
    }
    if(mileage === undefined || mileage === null || Number(mileage) < 0){
      return res.status(400).json({ success: false, message: 'Yürüş düzgün deyil' })
    }
    if(!description || description.trim().length === 0){
      return res.status(400).json({ success: false, message: 'Açıqlama yazılmalıdır' })
    }
    if(!req.files || req.files.length === 0){
      return res.status(400).json({ success: false, message: 'Ən azı 1 şəkil əlavə edin' })
    }

    // ✅ Bütün validasiyalardan keçdi — indi şəkilləri R2-yə yükləyirik
    const imageUrls = []
    for (const file of req.files) {
      const uniqueName = Date.now() + '-' + file.originalname
      const url = await uploadToR2(file.buffer, uniqueName, file.mimetype)
      imageUrls.push(url)
    }

    const product = await productService.createProduct({
      ...req.body,
      images: imageUrls,
      user: req.user.id
    });
    res.status(200).json({ success: true, data: product });
  }catch(error){
    next(error);
  }
}

// PROFILE
const deleteProduct = async (req, res, next) => {
  try{
    const product = await productService.getDetailsById(req.params.id)
    if (product.user._id.toString() !== req.user.id || !product.is_active) {
      return res.status(403).json({ success: false, message: 'İcazəniz yoxdur' })
    }

    const message = await productService.deleteProduct(req.params.id, req.user.id)
    res.status(200).json({ success: true, message: message })
  }catch(err){
    next(err)
  }
}

const getUserProduct = async (req, res, next) => {
  try{
    const product = await productService.getUserProduct(req.params.id, req.user.id)
    if(!product) {
      return res.status(404).json({success: false, message: 'Elan tapilmadi'})
    }

    res.status(200).json({success: true, data: product})
  }catch(err){
    next(err)
  }
}

const getUserProducts = async (req, res, next) => {
  try{
    if(req.user.id !== req.params.id){
      return res.status(403).json({ success: false, message: 'İcazəniz yoxdur' })
    }
    const data = await productService.getUserProducts(req.params.id)
    const formattedProducts = data.map(product => ({
      ...product,
      createdAt: formatDate(product.createdAt)
    }))
    res.status(200).json({ success: true, data: formattedProducts })
  } catch (err) {
    next(err)
  }
}

const getUserActiveProducts = async (req, res, next) => {
  try{
    if(req.user.id !== req.params.id){
      return res.status(403).json({ success: false, message: 'İcazəniz yoxdur' })
    }
    const data = await productService.getUserActiveProducts(req.params.id)
    const formattedProducts = data.map(product => ({
      ...product,
      createdAt: formatDate(product.createdAt)
    }))
    res.status(200).json({ success: true, data: formattedProducts })
  } catch (err) {
    next(err)
  }
}

const getUserDeactiveProducts = async (req, res, next) => {
  try{
    if(req.user.id !== req.params.id){
      return res.status(403).json({ success: false, message: 'İcazəniz yoxdur' })
    }
    const data = await productService.getUserDeactiveProducts(req.params.id)
    const formattedProducts = data.map(product => ({
      ...product,
      createdAt: formatDate(product.createdAt)
    }))
    res.status(200).json({ success: true, data: formattedProducts })
  } catch (err) {
    next(err)
  }
}




const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id

    const product = await productService.getDetailsOne({_id: productId})
    if (!product) {
      return res.status(404).json({ success: false, message: 'Elan tapılmadı' })
    }
    if(!product.is_active) {
      return res.status(403).json({ success: false, message: 'Yetkiniz yoxdur' })
    }

    // 🔴 IDOR düzəlişi — sahiblik yoxlanılmalıdır
    if (product.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'İcazəniz yoxdur' })
    }

    // remainingOldImages tək string ola bilər (1 dənə qalıbsa), array-ə çevir
    let remainingOldImages = req.body.remainingOldImages || []
    if (!Array.isArray(remainingOldImages)) {
      remainingOldImages = [remainingOldImages]
    }

    const newFilesCount = req.files ? req.files.length : 0
    const totalImagesCount = remainingOldImages.length + newFilesCount

    // ✅ Validasiya bloku (fayllar hələ R2-yə göndərilmir, sadəcə sayı yoxlanılır)
    const { price, mileage, description, fuel, speed, city, color } = req.body

    if (!price || Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Qiymət düzgün deyil' })
    }
    if (mileage === undefined || mileage === null || mileage === '' || Number(mileage) < 0) {
      return res.status(400).json({ success: false, message: 'Yürüş düzgün deyil' })
    }
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Açıqlama yazılmalıdır' })
    }
    if (totalImagesCount === 0) {
      return res.status(400).json({ success: false, message: 'En azi 1 sekil olmalidir' })
    }
    if (!fuel) {
      return res.status(400).json({ success: false, message: 'Yanacaq növü seçilməlidir' })
    }
    if (!speed) {
      return res.status(400).json({ success: false, message: 'Sürətlər qutusu seçilməlidir' })
    }
    if (!color) {
      return res.status(400).json({ success: false, message: 'Rəng seçilməlidir' })
    }
    if (!city) {
      return res.status(400).json({ success: false, message: 'Şəhər seçilməlidir' })
    }

    // ✅ Bütün validasiyalardan keçdi — indi yeni faylları R2-yə yükləyirik
    const newImageUrls = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uniqueName = Date.now() + '-' + file.originalname
        const url = await uploadToR2(file.buffer, uniqueName, file.mimetype)
        newImageUrls.push(url)
      }
    }

    const finalImages = [...remainingOldImages, ...newImageUrls]

    const updateData = {
      ...req.body,
      images: finalImages,
    }

    delete updateData.remainingOldImages

    const updatedProduct = await productService.updateProduct(productId, updateData)

    // silinən (art\u0131q istifad\u0259 olunmayan) \u015f\u0259killeri R2-d\u0259n sil
    const removedImages = product.images.filter(img => !remainingOldImages.includes(img))

    for (const imgUrl of removedImages) {
      try {
        await deleteFromR2(imgUrl)
        console.log('Şəkil uğurla silindi:', imgUrl)
      } catch (err) {
        console.error('Şəkil silinmədi:', imgUrl, err.message)
      }
    }

    res.status(200).json({ success: true, data: updatedProduct })
  } catch (err) {
    next(err)
  }
}

const clickProduct = async (req, res, next) => {
  try{
    const updatedProduct = await productService.clickProduct(req.params.id)
    res.status(200).json({success: true})
  }catch(err){
    next(err)
  }
}

const setActiveProduct = async (req, res, next) => {
  try{
    const activedProduct = await productService.setActiveProduct(req.params.id)
    res.status(200).json({ success: true, data: activedProduct })
  }catch(err) {
    next(err)
  }
}

// SITEMAP
// Domeni .env-dən oxuyur — hardcode yoxdur, dev/prod arasında rahat keçid olur
const SITE_URL = process.env.SITE_URL || 'https://sənin-domenin.com'

const sitemap = async (req, res, next) => {
  try {
    const products = await Product.find({ is_active: true }).select('_id updatedAt').lean()

    const urls = products.map(p => `
    <url>
      <loc>${SITE_URL}/elanlar/${p._id}</loc>
      <lastmod>${p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString()}</lastmod>
    </url>`).join('')

    res.header('Content-Type', 'application/xml')
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc></url>
  <url><loc>${SITE_URL}/autos</loc></url>${urls}
</urlset>`)
  } catch (err) {
    next(err)
  }
}


module.exports = {
  getProducts,

  getFilteredProducts,

  getSimilarProducts,
  
  getMetadata,

  createProduct,

  deleteProduct,

  getUserProduct,
  getUserProducts,
  getUserActiveProducts,
  getUserDeactiveProducts,

  updateProduct,

  getProductDetails,

  clickProduct,

  setActiveProduct,

  sitemap
}