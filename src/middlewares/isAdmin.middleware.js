function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'İcazən yoxdur' });
  }
  next();
}

module.exports = isAdmin 