// Express config
const express = require('express')
const app = express()

// CORS
const cors = require('cors')

// Database
const mongoDB = require('./config/db.config')

require('dotenv').config()

// User Routes
const authRouter = require('./routes/auth.routes')
const messageRouter = require('./routes/systemMessage.routes')
const favoriteRouter = require('./routes/favorite.routes')
const productRouter = require('./routes/product.routes')

// Admin Routes
const adminUserRouter = require('./routes/admin/adminUser.routes')
const adminProductRouter = require('./routes/admin/adminProduct.routes')
const adminMetadataRouter = require('./routes/admin/adminMetadata.routes')
const adminAdsenseRouter = require('./routes/admin/adminAdsense.routes')

// Middlewares
const errorModdleware = require('./middlewares/error.middleware')
const auth = require('./middlewares/auth.middleware')
const isAdmin = require('./middlewares/isAdmin.middleware')

// Elave
const path = require('path')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')

require('./jobs/cleanLockedUsersListings');
require('./jobs/cleanDeactiveProductListings');
require('./jobs/timeExpiredProductUpdate');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
})

const allowedOrigins = [
  'https://moto-frontend-liart.vercel.app', // production domeniniz
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman kimi alətlər üçün
    
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https:\/\/moto-frontend-.*\.vercel\.app$/.test(origin); // bütün preview-lar
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS icazəsi yoxdur: ' + origin));
    }
  },
  credentials: true
}));

const { UPLOAD_DIR } = require('./middlewares/upload.middleware');

app.use(express.json({ limit: '1mb' }))
app.use("/uploads", express.static(UPLOAD_DIR));

app.use(cookieParser())

mongoDB()

// app.use('/api', globalLimiter)

app.use('/api/auth', authRouter)
app.use('/api/messages', auth, messageRouter)
app.use('/api/favorites', favoriteRouter)
app.use('/api/products', productRouter)

app.use('/api/admin/users', auth, isAdmin, adminUserRouter)
app.use('/api/admin/products', auth, isAdmin, adminProductRouter)
app.use('/api/admin/metadata', auth, isAdmin, adminMetadataRouter)
app.use('/api/admin/adsense', adminAdsenseRouter)

app.use(errorModdleware)

module.exports = app