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
require('dotenv').config()
require('./jobs/cleanLockedUsersListings');
require('./jobs/cleanDeactiveProductListings');

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://192.168.100.29:5173",
    "https://concentrations-supposed-fantasy-sunny.trycloudflare.com",
    process.env.FRONTEND_URL
  ],
  credentials: true
}))

app.use(express.json({ limit: '1mb' }))
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cookieParser())

mongoDB()

app.use('/api/users', userRouter)
app.use('/api/products', productRouter)

app.use('/api/admin/users', auth, isAdmin, adminUserRouter)
app.use('/api/admin/products', auth, isAdmin, adminProductRouter)
app.use('/api/admin/metadata', auth, isAdmin, adminMetadataRouter)

app.use(errorModdleware)

module.exports = app