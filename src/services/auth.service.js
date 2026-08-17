const User = require('../models/user.model')

const getUser = async (email) => {
  return await User.findOne({email: email})
}

const getUserById = async (id) => {
  return await User.findById(id)
}

const createUser = async (userData) => {
  return await User.create(userData)
}

const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, {returnDocument: 'after', runValidators: true})
}


module.exports = {
  getUser,
  getUserById,
  createUser,
  updateUser
}