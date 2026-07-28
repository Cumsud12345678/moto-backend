const jwt = require('jsonwebtoken')
const redis = require('../config/redis.config')
const User = require('../models/user.model')

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ success: false, message: 'Giriş tələb olunur' })
    }

    const isBlacklisted = await redis.get(`blacklist:${token}`)
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: 'Sessiya bitib' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findById(decoded.id)
    if(user && user.isLock){
      return res.status(403).json({ success: false, message: 'Hesabınız kilidlənib' })
    }

    req.user = decoded

    next()

  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token yararsızdır və ya vaxtı bitib' })
  }
}

module.exports = auth