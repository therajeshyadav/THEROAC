const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../../uploads/images/jobs'),
    path.join(__dirname, '../../uploads/images/internships'),
    path.join(__dirname, '../../uploads/images/events'),
    path.join(__dirname, '../../uploads/images/organizations'),
    path.join(__dirname, '../../uploads/videos/jobs'),
    path.join(__dirname, '../../uploads/videos/internships'),
    path.join(__dirname, '../../uploads/videos/events'),
    path.join(__dirname, '../../uploads/videos/organizations')
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
    // Determine upload directory based on file type and route
    const isVideo = file.mimetype.startsWith('video/');
    const mediaType = isVideo ? 'videos' : 'images';
    let uploadDir = path.join(__dirname, `../../uploads/${mediaType}`);
    
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

// File filter - allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|avi|mov|wmv|flv|webm|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /^(image|video)\//.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'));
  }
};

// Configure multer
const mediaUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: fileFilter
});

module.exports = mediaUpload;