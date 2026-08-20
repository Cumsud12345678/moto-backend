const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Render-də disk mount path: /app/uploads
// Local development-də .env-də UPLOAD_DIR olmasa, layihə içindəki ../uploads-a yazır
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads')

// Qovluq mövcud deyilsə yarat (ilk deploy zamanı vacibdir)
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName)
  }
})

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

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // maksimum 2MB
});

module.exports = upload;
module.exports.UPLOAD_DIR = UPLOAD_DIR;