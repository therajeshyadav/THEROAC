const multer = require('multer');
const { uploadToGCS, uploadMultipleToGCS } = require('../services/gcsService');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/quicktime'];
  const allowedDocumentTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', // PPT
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/vnd.ms-excel', // XLS
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'text/plain', // TXT
    'application/zip', // ZIP
    'application/x-zip-compressed' // ZIP alternative
  ];
  
  const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes];
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Supported: Images, Videos, PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, ZIP`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit (maximum practical size)
    files: 20 // Maximum 20 files at once
  }
});

// Middleware for single file upload
const uploadSingle = (fieldName = 'file') => {
  return upload.single(fieldName);
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for accepting files with any field names
const uploadAny = (maxCount = 10) => {
  return upload.any(maxCount);
};

// Middleware for mixed file upload (different field names)
const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Helper function to upload file to GCS after multer processing
const uploadToGCSMiddleware = (fileType = 'media') => {
  return async (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        return next();
      }

      const userId = req.user?.id || req.body.userId;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Handle single file
      if (req.file) {
        const fileUrl = await uploadToGCS(req.file, userId, fileType);
        req.fileUrl = fileUrl;
        req.uploadedFile = {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl
        };
      }

      // Handle multiple files
      if (req.files) {
        let fileUrls = [];
        let uploadedFiles = [];

        if (Array.isArray(req.files)) {
          // Files from upload.array()
          fileUrls = await uploadMultipleToGCS(req.files, userId, fileType);
          uploadedFiles = req.files.map((file, index) => ({
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: fileUrls[index]
          }));
        } else {
          // Files from upload.fields()
          for (const fieldName in req.files) {
            const files = req.files[fieldName];
            const urls = await uploadMultipleToGCS(files, userId, fileType);
            fileUrls.push(...urls);
            
            const fileData = files.map((file, index) => ({
              fieldName,
              originalName: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              url: urls[index]
            }));
            uploadedFiles.push(...fileData);
          }
        }

        req.fileUrls = fileUrls;
        req.uploadedFiles = uploadedFiles;
      }

      next();
    } catch (error) {
      console.error('Upload middleware error:', error);
      res.status(500).json({ error: 'File upload failed', details: error.message });
    }
  };
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 1GB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 20 files.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadAny,
  uploadToGCSMiddleware,
  handleUploadError,
  upload
};