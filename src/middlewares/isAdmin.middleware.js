function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'İcazəniz yoxdur' });
  }
  next();
}

module.exports = isAdmin 