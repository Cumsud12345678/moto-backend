const systemMessageService = require('../services/systemMessage.service')
const formatDate = require("../utils/dateFormatter");

const getMessages = async (req, res, next) => {
  try{
    if(req.params.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Yetkiniz yoxdur!' })
    }
    const data = await systemMessageService.getMessages(req.user.id)
    res.status(200).json({ success: true, data: data })
  }catch(err) {
    next(err)
  }
}

module.exports = {
  getMessages
}