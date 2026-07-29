const productService = require('../services/product.service');
const fs = require("fs");
const path = require("path");
const formatProductDate = require("../utils/dateFormatter");

// HOME
const getProducts = async (req, res, next) => {
  try{
    const userId = req.user?.id || null
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    
    const { products, hasMore } = await productService.getAllProduct(userId, page, limit)
    const formattedProducts = products.map(product => ({
      ...product,
      createdAt: formatProductDate(product.createdAt)
    }))
    return res.status(200).json({ success: true, data: formattedProducts, hasMore })
  }catch(err){
    next(err);
  }
}

// AUTOS
const getFilteredProducts = async (req, res, next) => {
  try{
    const data = await productService.getFilteredProducts(req.query)
    res.status(200).json({success: true, data: data})
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
    console.log('a')
    const userId = req.user?.id || null
    console.log(req.user)
    const data = await productService.getProductDetails(req.params.id, userId)
    res.status(200).json({ success: true, data: data })
  }catch(err){
    next(err)
  }
}

// SIMILARS
const getSimilarProducts = async (req, res, next) => {
  try{
    const details = await productService.getProductDetails(req.params.id)
    if (!details) return res.status(404).json({ success: false, message: "Elan tapılmadı" });

    const similarProducts = await productService.getSimilarProducts(details.product)
    
    res.status(200).json({ success: true, data: similarProducts})
  }catch(err){
    next(err)
  }
}

// NEW PRODUCT
const createProduct = async (req, res, next) => {
  try{
    const {
      price, year, mileage, description, volume, power,
      make, model, category, fuel, speed, city, color, status
    } = req.body

    if(!make || !model || !year || !volume){
      return res.status(400).json({ success: false, message: 'Marka, model, il və həcm məlumatlarıı tam deyil' })
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

    const imageUrls = req.files.map(file => file.filename);
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

// BOOKMARKAS PAGE
const getFavoritesNotLogin = async (req, res, next) => {
  try{
    const { favorites } = req.body
    const data = await productService.getFavoritesNotLogin(favorites)
    res.status(200).json({ success: true, data: data })
  }catch(err){
    next(err)
  }
}

// PROFILE
const deleteProduct = async (req, res, next) => {
  try{
    const product = await productService.getProductDetails(req.params.id)
    if (product.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'İcazəniz yoxdur' })
    }
    const message = await productService.deleteProduct(req.params.id)
    res.status(200).json({ success: true, message: message })
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
    res.status(200).json({ success: true, data: data })
  } catch (err) {
    next(err)
  }
}


const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id

    const product = await productService.getProductDetails(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Elan tapılmadı' })
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

    // multer-dən gələn yeni faylların adları
    const newImageNames = req.files ? req.files.map(f => f.filename) : []
    const finalImages = [...remainingOldImages, ...newImageNames]

    // ✅ Validasiya bloku
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
    if (finalImages.length === 0) {
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

    const updateData = {
      ...req.body,
      images: finalImages,
    }

    delete updateData.remainingOldImages

    const updatedProduct = await productService.updateProduct(productId, updateData)

    const removedImages = product.images.filter(img => !remainingOldImages.includes(img))

    removedImages.forEach(img => {
      const fileName = path.basename(img)
      const filePath = path.join(__dirname, '../uploads', fileName)

      fs.unlink(filePath, (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            console.warn('Fayl onsuz da mövcud deyil:', fileName)
          } else {
            console.error('Fayl silinmədi:', fileName, err)
          }
        } else {
          console.log('Fayl uğurla silindi:', fileName)
        }
      })
    })

    res.status(200).json({ success: true, data: updatedProduct })
  } catch (err) {
    next(err)
  }
}

const sitemap = async (req, res) => {
  const products = await Product.find({ isActive: true }).select('_id updatedAt')
  const urls = products.map(p => `
    <url>
      <loc>https://sənin-domenin.com/elanlar/${p._id}</loc>
      <lastmod>${p.updatedAt.toISOString()}</lastmod>
    </url>
  `).join('')

  res.header('Content-Type', 'application/xml')
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>https://sənin-domenin.com/</loc></url>
      <url><loc>https://sənin-domenin.com/autos</loc></url>
      ${urls}
    </urlset>`)
}


module.exports = {
  getProducts,

  getFilteredProducts,

  getSimilarProducts,
  
  getMetadata,

  getFavoritesNotLogin,
  createProduct,

  deleteProduct,
  getUserProducts,

  updateProduct,

  getProductDetails
}