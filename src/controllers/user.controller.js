const userService = require('../services/user.service')
const jwt = require('jsonwebtoken')
const redis = require('../config/redis.config')
const fs = require("fs");
const path = require("path");


// REHISTER
const register = async (req, res, next) => {
  try{
    
    if(!req.body.phone || !req.body.name){
      return res.status(400).json({success: false, message: 'Məlumat tam deyil'})
    }

    const user = await userService.getUser(req.body.phone)
    if(user){
      return res.status(409).json({success: false, message: 'Nömrə isdifadə olunur'})
    }

    const existing = await redis.get(`register:${req.body.phone}`)

    if(existing){
      const ttl = await redis.ttl(`register:${req.body.phone}`)
      return res.status(429).json({success: false, message: `${ttl} saniyə sonra tekrar dənəyin`})
    }

    const attemptsKey = `register-attempts:${req.body.phone}`
    const attempts = await redis.incr(attemptsKey)
    if(attempts == 1){
      await redis.expire(attemptsKey, 3600)
    }
    if(attempts > 5){
      return res.status(429).json({success: false, message: 'Çox sayıda cəhd 1 saat sonra yenidən cəhd edin'})
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    if (otp) {
      console.log(otp)
      await redis.set(
        `register:${req.body.phone}`,
        JSON.stringify({
          otp,
          phone: req.body.phone,
          name: req.body.name
        }),
        {
          EX: 120
        }
      )
      res.status(200).json({ success: true, message: 'Kod göndərildi' })
    } else {
      res.status(500).json({ success: false, message: 'Kod göndərilmədi' })
    }
    
  }catch(err){
    next(err)
  }
}

const registerValidate = async (req, res, next) => {
  try{
    const data = await redis.get(`register:${req.body.phone}`)
    if(!data){
      return res.status(400).json({
        success: false,
        message: "Kodun vaxtı bitib"
      });
    }

    const registerData = JSON.parse(data)

    console.log(registerData.otp)

    const failKey = `register-fail:${req.body.phone}`

    if(req.body.otp == registerData.otp){
      await redis.del(failKey)

      const form = {
        name: registerData.name,
        phone: registerData.phone
      }
      const newUser = await userService.createUser(form)

      if (newUser) {
        await redis.del(`register:${registerData.phone}`);
        const token = jwt.sign(
          { id: newUser._id, role: newUser.role },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        )

        const isProd = process.env.NODE_ENV === 'production'
        const isTunnel = process.env.USE_TUNNEL === 'true'
        res.cookie('token', token, {
          httpOnly: true,
          secure: isProd || isTunnel, // localda HTTP ilə test edərkən true olmasın
          sameSite: (isProd || isTunnel) ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({ success: true, id: newUser._id })
      } else {
        
        res.status(500).json({ success: false, message: 'Bir xəta baş verdi' })
      }

    } else {
      const fails = await redis.incr(failKey)

      if (fails == 1) {
        await redis.expire(failKey, 120)
      }

      if (fails > 5) {
        await redis.del(`register:${req.body.phone}`)
        await redis.del(failKey)
        return res.status(429).json({ success: false, message: 'Çox sayda səhf cəhd, yenidən qeydiyyatdan keçin' })
      }
      res.status(401).json({ success: false, message: 'Kod səfdir' })
    }

  }catch(err){
    next(err)
  }
}


// login
const login = async (req, res, next) => {
  try{

    if(!req.body.phone || req.body.phone.length !== 9){
      return res.status(401).json({success: false, message: 'Məlumat əksikdir'})
    }
    const user = await userService.getUser(req.body.phone)

    if(!user){
      return res.status(404).json({success: false, message: 'İsdifadəçi tapilmadı'})
    }

    if(user.isLock){
      return res.status(409).json({success: false, message: 'Siz qaydaları çox pozduqunuza görə uzaqlaşdırılmısız!!!'})
    }

    const existing = await redis.get(`login:${req.body.phone}`)
    if(existing){
      const ttl = await redis.ttl(`login:${req.body.phone}`)
      return res.status(429).json({success: false, message: `${ttl} saniyə sonra tekrar dənəyin`})
    }

    const attemptsKey = `login-attempts:${req.body.phone}`
    const attempts = await redis.incr(attemptsKey)
    if(attempts == 1){
      await redis.expire(attemptsKey, 3600)
    }
    
    if(attempts > 5){
      return res.status(429).json({success: false, message: 'Çox yoxladınız 1 saat sonra yenidən cəhd edin'})
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    if(otp){
      console.log(otp)
      await redis.set(
        `login:${req.body.phone}`,
        JSON.stringify({
          otp,
          phone: req.body.phone
        }),
        {
          EX: 120
        }
      )
      res.status(200).json({ success: true, message: 'Kod göndərildi' })
    }else {
      res.status(500).json({ success: false, message: 'Kod göndərilmədi birdaha cəhd edin' })
    }

  }catch(err){
    next(err)
  }
}

const loginValidate = async (req, res, next) => {
  try{
    const data = await redis.get(`login:${req.body.phone}`)
    
    if(!data){
      return res.status(400).json({
        success: false,
        message: "Kodun vaxtı bitib"
      });
    }

    const loginData = JSON.parse(data)

    const user = await userService.getUser(loginData.phone);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "İstifadəçi tapılmadı"
      });
    }

    const failKey = `login-fail:${req.body.phone}`

    if(req.body.otp == loginData.otp){
      await redis.del(failKey)
      await redis.del(`login:${loginData.phone}`)

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // localda HTTP ilə test edərkən true olmasın
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })

      return res.status(200).json({ success: true, id: user._id })

    }else {
      const fails = await redis.incr(failKey)
      if(fails == 1){
        await redis.expire(failKey, 120)
      }

      if(fails > 5){
        return res.status(429).json({success: false, message: 'Çox sayda uğursuz cəhd biraz sonra yenidən cəhd edin'})
      }
      res.status(401).json({ success: false, message: 'Kod səfdir' })
    }
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

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return res.status(200).json({ success: true, message: 'Çıxış edildi' })
  } catch (err) {
    next(err)
  }
}


// USER
const getMe = async (req, res, next) => {
  try{
    const user = await userService.getUserById(req.user.id)
    if(!user){
      return res.status(404).json({success: false, message: 'İstifadəçi tapılmadı'})
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
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
    const user = await userService.getUserById(req.user.id)

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

    const updatedUser = await userService.updateUser(req.params.id, updateData)

    // köhnə şəkli sil — yalnız yeni fayl yükləndikdə VƏ köhnə şəkil default olmadıqda
    if (req.file && user.profile) {
      const oldPath = path.join(__dirname, '../uploads', user.profile)
      fs.unlink(oldPath, (err) => {
        if (err) console.error('Köhnə şəkil silinmədi:', err.message)
      })
    }

    return res.status(200).json({ success: true, data: updatedUser })

  } catch (err) {
    next(err)
  }
}

// FAVORITES
const setFavori = async (req, res, next) => {
  try{

    let success = null
    
    if(Array.isArray(req.body.data)){
      success = await userService.setFavori({data: req.body.data, type: 'array', id: req.user.id})
    }else{
      const data = {
        user: req.user.id,
        product: req.body.data
      }
      success = await userService.setFavori({data: data, type: 'string'})
    }
    
    res.status(200).json({ success, message: 'Uğurla əlavə olundu' })

  }catch(err){
    next(err)
  }
}

const deleteFavori = async (req, res, next) => {
  try{
    const data = {
      user: req.user.id,
      product: req.params.id
    }

    const success = await userService.deleteFavori(data)
    res.status(200).json({ success, message: 'Uğurla silindi' })
  }catch(err){
    next(err)
  }
}

const getFavorites = async (req, res, next) => {
  try{
    const products = await userService.getFavorites(req.user.id)
    res.status(200).json({ success: true, data: products })
  }catch(err){
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

  setFavori,
  deleteFavori,
  getFavorites,

  updateUser
}