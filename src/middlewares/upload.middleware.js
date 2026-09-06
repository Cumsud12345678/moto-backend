const multer = require('multer')
const path = require('path')

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Yalnız jpeg, png, webp, avif faylları qəbul olunur'), false);
  }
};

// Diskə yazmaq əvəzinə, faylı yaddaşda (buffer kimi) saxlayırıq
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // maksimum 2MB
});

module.exports = upload;