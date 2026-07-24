const rateLimit = require('express-rate-limit')

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Çox sayda sorğu, sonra yenidən cəhd edin' }
})

module.exports = otpLimiter