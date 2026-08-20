const authService = require('../services/auth.service')
const jwt = require('jsonwebtoken')
const redis = require('../config/redis.config')
const fs = require("fs");
const path = require("path");
const formatDate = require("../utils/dateFormatter");
const { sendOtpEmail } = require('../services/sendOtpMail.service')
const { UPLOAD_DIR } = require('../middlewares/upload.middleware');

const generateAndSendOtp = async (email, type) => {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  try {
    await sendOtpEmail(email, otp, type)
  } catch (mailErr) {
    console.error('OTP email xətası:', mailErr.message)
    return { status: 502, success: false, message: 'Kod göndərilmədi, bir az sonra yenidən cəhd edin' }
  }

  if (otp) {
    await redis.set(
      `${type}:${email}`,
      JSON.stringify({
        otp,
        email: email
      }),
      {
        EX: 120
      }
    )
    return { status: 200, success: true, message: 'Kod göndərildi' }
  } else {
    return { status: 500, success: false, message: 'Kod göndərilmədi' }
  }
}

const checkAttempts = async (type, email) => {
  const attemptsKey = `${type}-attempts:${email}`
  const attempts = await redis.incr(attemptsKey)
  if(attempts == 1){
    await redis.expire(attemptsKey, 3600)
  }
  if(attempts > 5){
    return { status: 429, success: false, message: 'Çox sayıda cəhd 1 saat sonra yenidən cəhd edin' }
  }else {
    return null
  }
}

const OtpVerify = async (clientOtp, serverOtp, failKey, type, email, name, res, defaultUser) => {
  if(clientOtp == serverOtp){
    let user = defaultUser 

    await redis.del(failKey)
    await redis.del(`${type}:${email}`)

    if(type === 'register') {
      const form = {
        name: name,
        email: email
      }
      user = await authService.createUser(form)

      if(!user) return { status: 500, success: false, message: 'Bir xəta baş verdi' };
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    )

    const isProd = process.env.NODE_ENV === 'production'
    const isTunnel = process.env.USE_TUNNEL === 'true'

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd || isTunnel, // localda HTTP ilə test edərkən true olmasın
      sameSite: (isProd || isTunnel) ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return { status: 200, success: true, id: user._id }

  } else {
    const fails = await redis.incr(failKey)

    if (fails == 1) {
      await redis.expire(failKey, 120)
    }

    if (fails > 5) {
      await redis.del(`${type}:${email}`)
      await redis.del(failKey)
      return { status: 429, success: false, message: 'Çox sayda uğursuz cəhd biraz sonra yenidən cəhd edin' }
    }
    return { status: 401, success: false, message: 'Kod səfdir' }
  }
}

// REGISTER
const register = async (req, res, next) => {
  try{
    
    if(!req.body.email || !req.body.name){
      return res.status(400).json({success: false, message: 'Məlumat tam deyil'})
    }

    const user = await authService.getUser(req.body.email)
    if(user){
      return res.status(409).json({success: false, message: 'Email isdifadə olunur'})
    }

    const existing = await redis.get(`register:${req.body.email}`)
    if(existing){
      const ttl = await redis.ttl(`register:${req.body.email}`)
      return res.status(429).json({success: false, message: `${ttl} saniyə sonra tekrar dənəyin`})
    }

    const attemptsErr = await checkAttempts('register', req.body.email)
    if (attemptsErr) {
      return res.status(attemptsErr.status).json({ success: attemptsErr.success, message: attemptsErr.message })
    }

    const OtpResult = await generateAndSendOtp(req.body.email, 'register')
    res.status(OtpResult.status).json({success: OtpResult.success, message: OtpResult.message})
    
  }catch(err){
    next(err)
  }
}

const registerValidate = async (req, res, next) => {
  try{
    const data = await redis.get(`register:${req.body.email}`)
    if(!data) return res.status(400).json({ success: false, message: "Kodun vaxtı bitib" });

    const registerData = JSON.parse(data)

    const failKey = `register-fail:${req.body.email}`

    const {status, success, message, id} = await OtpVerify(req.body.otp, registerData.otp, failKey, 'register', registerData.email, registerData.name, res, null)
    res.status(status).json({success, message, id})

  }catch(err){
    next(err)
  }
}


// login
const login = async (req, res, next) => {
  try{

    if(!req.body.email){
      return res.status(401).json({success: false, message: 'Məlumat əksikdir'})
    }
    const user = await authService.getUser(req.body.email)

    if(!user){
      return res.status(404).json({success: false, message: 'İsdifadəçi tapilmadı'})
    }

    if(user.isLock){
      return res.status(409).json({success: false, message: 'Siz qaydaları çox pozduqunuza görə uzaqlaşdırılmısız!!!'})
    }

    const existing = await redis.get(`login:${req.body.email}`)
    if(existing){
      const ttl = await redis.ttl(`login:${req.body.email}`)
      return res.status(429).json({success: false, message: `${ttl} saniyə sonra tekrar dənəyin`})
    }

    const attemptsErr = await checkAttempts('login', req.body.email)
    if (attemptsErr) {
      return res.status(attemptsErr.status).json({ success: attemptsErr.success, message: attemptsErr.message })
    }

    const OtpResult = await generateAndSendOtp(req.body.email, 'login')
    res.status(OtpResult.status).json({success: OtpResult.success, message: OtpResult.message})

  }catch(err){
    next(err)
  }
}

const loginValidate = async (req, res, next) => {
  try{
    const data = await redis.get(`login:${req.body.email}`)
    if(!data) return res.status(400).json({ success: false, message: "Kodun vaxtı bitib" });

    const loginData = JSON.parse(data)

    const user = await authService.getUser(loginData.email);
    if (!user) return res.status(404).json({ success: false, message: "İstifadəçi tapılmadı" });

    const failKey = `login-fail:${req.body.email}`

    const {status, success, message, id} = await OtpVerify(req.body.otp, loginData.otp, failKey, 'login', loginData.email, null, res, user)
    res.status(status).json({success, message, id})

  }catch(err){
    next(err)
  }
}


// LOGOUT
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (token) {
      let decoded = null;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (e) {
        // etibarsız, saxta və ya vaxtı keçmiş token — sadəcə cookie-ni təmizləyib davam edirik
        decoded = null;
      }
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000)
        if (ttl > 0) {
          await redis.set(`blacklist:${token}`, '1', { EX: ttl })
        }
      }
    }

    const isProd = process.env.NODE_ENV === 'production'
    const isTunnel = process.env.USE_TUNNEL === 'true'

    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd || isTunnel,
      sameSite: (isProd || isTunnel) ? 'none' : 'lax'
    })

    return res.status(200).json({ success: true, message: 'Çıxış edildi' })
  } catch (err) {
    next(err)
  }
}


// USER
const getMe = async (req, res, next) => {
  try{
    const user = await authService.getUserById(req.user.id)
    if(!user){
      return res.status(404).json({success: false, message: 'İstifadəçi tapılmadı'})
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        role: user.role
      }
    })
  }catch(err){
    next(err)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' })
    }

    if (req.params.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Yetkiniz yoxdur!' })
    }

    const updateData = {}

    if (req.body.name !== req.user.name) {
      updateData.name = req.body.name
    }

    if (req.file) {
      updateData.profile = req.file.filename
    }

    const updatedUser = await authService.updateUser(req.params.id, updateData)

    // köhnə şəkli sil — yalnız yeni fayl yükləndikdə VƏ köhnə şəkil default olmadıqda
    if (req.file && user.profile) {
      const oldPath = path.join(UPLOAD_DIR, user.profile)
      fs.unlink(oldPath, (err) => {
        if (err) console.error('Köhnə şəkil silinmədi:', err.message)
      })
    }

    return res.status(200).json({ success: true, data: updatedUser })

  } catch (err) {
    next(err)
  }
}

module.exports = {
  register,
  registerValidate,
  login,
  loginValidate,
  logout,
  getMe,
  updateUser
}