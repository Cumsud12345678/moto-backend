// Express config
const express = require('express')
const app = express()

// CORS
const cors = require('cors')

// Database
const mongoDB = require('./config/db.config')

// User Routes
const userRouter = require('./routes/user.routes')
const productRouter = require('./routes/product.routes')
// Admin Routes
const adminUserRouter = require('./routes/admin/adminUser.routes')
const adminProductRouter = require('./routes/admin/adminProduct.routes')
const adminMetadataRouter = require('./routes/admin/adminMetadata.routes')

// Middlewares
const errorModdleware = require('./middlewares/error.middleware')
const auth = require('./middlewares/auth.middleware')
const isAdmin = require('./middlewares/isAdmin.middleware')

// Elave
const path = require('path')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
require('dotenv').config()
require('./jobs/cleanLockedUsersListings');
require('./jobs/cleanDeactiveProductListings');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
})

app.use(cors({
  origin: [
    "https://moto-frontend-lo4js5qqg-cumsud12345678s-projects.vercel.app/"
  ],
  credentials: true
}))

app.use(express.json({ limit: '1mb' }))
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cookieParser())

mongoDB()

app.use('/api', globalLimiter)

app.use('/api/users', userRouter)
app.use('/api/products', productRouter)

app.use('/api/admin/users', auth, isAdmin, adminUserRouter)
app.use('/api/admin/products', auth, isAdmin, adminProductRouter)
app.use('/api/admin/metadata', auth, isAdmin, adminMetadataRouter)

app.use(errorModdleware)

module.exports = app