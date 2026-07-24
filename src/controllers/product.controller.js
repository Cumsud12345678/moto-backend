const productService = require('../services/product.service');
const fs = require("fs");
const path = require("path");

// HOME
const getProducts = async (req, res, next) => {
  try{
    const userId = req.user?.id || null
    console.log(userId)
    
    const products = await productService.getAllProduct(userId);
    return res.status(200).json({ success: true, data: products });
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
    const data = await productService.getProductDetails(req.params.id)
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

    const similarProducts = await productService.getSimilarProducts(details)
    
    res.status(200).json({ success: true, data: similarProducts})
  }catch(err){
    next(err)
  }
}

// NEW PRODUCT
const createProduct = async (req, res, next) => {
  try{
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
      return res.status(403).json({ success: false, message: 'Icazeniz yoxdur' })
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
      return res.status(403).json({ success: false, message: 'Icazeniz yoxdur' })
    }
    const data = await productService.getUserProducts(req.params.id)
    res.status(200).json({ success: true, data: data })
  } catch (err) {
    next(err)
  }
}


const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id // ya da req.user.id — öz məntiqinə uyğun saxla
    const product = await productService.getProductDetails(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Elan tapilmadi' })
    }
    if (product.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Icazeniz yoxdur' })
    }

    // remainingOldImages tək string ola bilər (1 dənə qalıbsa), array-ə çevir
    let remainingOldImages = req.body.remainingOldImages || []
    if (!Array.isArray(remainingOldImages)) {
      remainingOldImages = [remainingOldImages]
    }

    // multer-dən gələn yeni faylların adları
    const newImageNames = req.files ? req.files.map(f => f.filename) : []

    const finalImages = [...remainingOldImages, ...newImageNames]

    const updateData = {
      ...req.body,
      images: finalImages,
    }

    // remainingOldImages artıq lazım deyil, images-ə birləşdi
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