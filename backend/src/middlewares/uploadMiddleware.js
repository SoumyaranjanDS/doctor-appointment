const multer = require('multer');

// Use memory storage since we will upload buffers directly to Cloudinary via their SDK
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images and pdfs for document verification
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only images and PDFs are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
