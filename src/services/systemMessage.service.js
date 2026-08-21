const SystemMessage = require('../models/systemMessage.model')

const getMessages = async (userId) => {
  return await SystemMessage.find({user: userId})
}

module.exports = {
  getMessages
}