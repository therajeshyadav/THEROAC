const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../../uploads/images/jobs'),
    path.join(__dirname, '../../uploads/images/internships'),
    path.join(__dirname, '../../uploads/images/events'),
    path.join(__dirname, '../../uploads/images/organizations')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload directory based on field name or route
    let uploadDir = path.join(__dirname, '../../uploads/images');
    
    if (req.baseUrl.includes('/jobs')) {
      uploadDir = path.join(uploadDir, 'jobs');
    } else if (req.baseUrl.includes('/internships')) {
      uploadDir = path.join(uploadDir, 'internships');
    } else if (req.baseUrl.includes('/events')) {
      uploadDir = path.join(uploadDir, 'events');
    } else if (req.baseUrl.includes('/organizations')) {
      uploadDir = path.join(uploadDir, 'organizations');
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId-timestamp-fieldname-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fieldName = file.fieldname;
    cb(null, `${req.user?.id || 'user'}-${uniqueSuffix}-${fieldName}${ext}`);
  }
});

// File filter - only allow images
const imageFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Create multer upload instance for images
const imageUpload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per image
  }
});

module.exports = imageUpload;
