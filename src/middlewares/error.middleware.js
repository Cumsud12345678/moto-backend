const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server xətası';

  // Multer-in fayl ölçüsü xətasını tut
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400
    message = 'Şəkil ölçüsü çox böyükdür (maksimum 2MB)'
  }
 
  console.error(`[XƏTA] ${statusCode}: ${message}`);
 
  res.status(statusCode).json({
    success: false,
    message,
  });
};
 
module.exports = errorMiddleware;