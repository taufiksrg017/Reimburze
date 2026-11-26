const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Konfigurasi Cloudinary (nanti masukin ke Environment Variables Vercel)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reimburze_nota', // Nama folder di Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
    resource_type: 'auto',
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Hanya JPG/PNG/WEBP/PDF yang diizinkan'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_MB || 5) * 1024 * 1024 },
});

module.exports = { upload };