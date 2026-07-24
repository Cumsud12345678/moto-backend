const adminProductService = require('../../services/admin/adminProduct.service')
const adminUserService = require('../../services/admin/adminUser.service')
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const getUsers = async (req, res, next) => {
  try{
    const users = await adminUserService.getUsers()
    res.status(200).json({ success: true, data: users })
  }catch(err){
    next(err)
  }
}

const getUser = async (req, res, next) => {
  try{
    const data = await adminUserService.getUser(req.query)
    res.status(200).json({ success: true, data: data })
  }catch(err){
    next(err)
  }
}

const warningUser = async (req, res, next) => {
  try{
    const warningedUser = await adminUserService.warningUser(req.params.id)
    if(warningedUser.warning >= 3) {
      await adminUserService.lockUser(req.params.id)
    }
    res.status(200).json({success: true, data: warningedUser.warning})
  }catch(err){
    next(err)
  }
}

const lockUser = async (req, res, next) => {
  try{
    const success = await adminUserService.lockUser(req.params.id)
    if(success) res.status(200).json({ success: true })
  }catch(err) {
    next(err)
  }
}

const unlockUser = async (req, res, next) => {
  try{
    const unlockedUser = await adminUserService.unlockUser(req.params.id)
    if(unlockedUser.isLock) return res.status(500).json({success: false, message: 'Bir xeta olustu'})
    res.status(200).json({ success: true })
  }catch(err) {
    next(err)
  }
}

const resetWarningUser = async (req, res, next) => {
  try{
    await adminUserService.resetWarningUser(req.params.id)
    res.status(200).json({ success: true })
  }catch(err){
    next(err)
  }
}

const deleteUser = async (req, res, next) => {
  try{
    console.log(req.body)
    const deletedUser = await adminUserService.deleteUser(req.params.id, req.body.desc)
    res.status(200).json({ success: true })
  }catch(err){
    next(err)
  }
}

const updateUser = async (req, res, next) => {
  try{
    const updatedUser = await adminUserService.updateUser(req.params.id, req.body)
    res.status(200).json({ success: true })
  }catch(err){
    next(err)
  }
}

const getUserStats = async (req, res, next) => {
  try{
    const now = dayjs().tz('Asia/Baku')
    
    const startOfDay = now.startOf('day').toDate()
    const onWeekAgo = now.subtract(7, 'day').startOf('day').toDate()
    const oneMonthAgo = now.startOf('month').toDate()

    const data = await adminUserService.getUserStats(startOfDay, onWeekAgo, oneMonthAgo)
    res.status(200).json({success: true, data: data})
  }catch(err) {
    next(err)
  }
}

const getDeletedUsers = async (req, res, next) => {
  try{
    const data = await adminUserService.getDeletedUsers()
    res.status(200).json({success: true, data: data})
  }catch(err){
    next(err)
  }
}

const deleteDeletedUser = async (req, res, next) => {
  try{
    const success = await adminUserService.deleteDeletedUser(req.params.id)
    res.status(200).json({success})
  }catch(err){
    next(err)
  }
}

module.exports = {
  getUsers,
  getUser,
  warningUser,
  lockUser,
  unlockUser,
  resetWarningUser,
  deleteUser,
  updateUser,
  getUserStats,

  getDeletedUsers,
  deleteDeletedUser
}