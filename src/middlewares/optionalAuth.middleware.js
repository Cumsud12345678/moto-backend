const jwt = require('jsonwebtoken')
const redis = require('../config/redis.config')

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      req.user = null
      return next()
    }

    const isBlacklisted = await redis.get(`blacklist:${token}`)
    if (isBlacklisted) {
      req.user = null
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()

  } catch (err) {
    req.user = null
    next()
  }
}

module.exports = optionalAuth