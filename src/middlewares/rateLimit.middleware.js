// rateLimit.middleware.js
const rateLimit = require('express-rate-limit')

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Çox sayda sorğu, sonra yenidən cəhd edin' }
})

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,   // verify daha çox cəhd tələb edə bilər (yanlış yazma və s.)
  message: { success: false, message: 'Çox sayda cəhd, sonra yenidən cəhd edin' }
})

module.exports = { otpLimiter, verifyLimiter }