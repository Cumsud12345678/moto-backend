const User = require('../models/user.model')

async function isAdmin(req, res, next) {
  const user = await User.findById(req.user.id)
  if(user.role !== 'admin') {
    return res.status(403).json({ message: 'İcazəniz yoxdur' });
  }
  next();
}

module.exports = isAdmin 