const { Storage } = require("@google-cloud/storage");
const path = require("path");

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/gbc.json'),
  projectId: '718890376941'
});

const bucketName = process.env.GCS_BUCKET_NAME || 'heartfelt-6a946.firebasestorage.app';
const bucket = storage.bucket(bucketName);

/**
 * Upload file to Google Cloud Storage
 * @param {Object} file - Multer file object
 * @param {String} userId - User ID for folder structure
 * @param {String} fileType - Type of file (image, video, document, etc.)
 * @returns {Promise<String>} - Public URL of uploaded file
 */
const uploadToGCS = (file, userId, fileType = 'media') => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file provided"));
    
    // Ensure that userId is valid
    if (!userId) return reject(new Error("User ID is required"));

    // Extract file extension
    const ext = path.extname(file.originalname);
    
    // Create timestamp for unique filename
    const timestamp = Date.now();
    const baseName = path.basename(file.originalname, ext);
    
    // Set folder structure: theROAC/{userId}/{fileType}/filename
    const fileName = `theROAC/${userId}/${fileType}/${timestamp}_${baseName}${ext}`;
    
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      public: true,
      metadata: {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          originalName: file.originalname,
          fileType: fileType
        }
      }
    });

    blobStream.on("error", (err) => {
      console.error('GCS Upload Error:', err);
      
      // Provide more specific error messages
      if (err.code === 404) {
        reject(new Error(`Bucket '${bucketName}' does not exist. Please create it first by running: node create-bucket.js`));
      } else if (err.code === 403) {
        reject(new Error(`Access denied to bucket '${bucketName}'. Please check your credentials and permissions.`));
      } else {
        reject(new Error(`Upload failed: ${err.message}`));
      }
    });

    blobStream.on("finish", async () => {
      try {
        // Make the file public
        await blob.makePublic();
        
        // Return the public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        resolve(publicUrl);
      } catch (error) {
        console.error('Error making file public:', error);
        
        if (error.code === 404) {
          reject(new Error(`Bucket '${bucketName}' does not exist. Please create it first by running: node create-bucket.js`));
        } else {
          reject(new Error(`Failed to make file public: ${error.message}`));
        }
      }
    });

    // Write the file buffer to the GCS stream
    blobStream.end(file.buffer);
  });
};

/**
 * Upload multiple files to GCS
 * @param {Array} files - Array of multer file objects
 * @param {String} userId - User ID
 * @param {String} fileType - Type of files
 * @returns {Promise<Array>} - Array of public URLs
 */
const uploadMultipleToGCS = async (files, userId, fileType = 'media') => {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  const uploadPromises = files.map(file => 
    uploadToGCS(file, userId, fileType)
  );

  try {
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

/**
 * Delete file from GCS
 * @param {String} fileUrl - Public URL of the file to delete
 * @returns {Promise<Boolean>} - Success status
 */
const deleteFromGCS = async (fileUrl) => {
  try {
    // Extract filename from URL
    const fileName = fileUrl.replace(`https://storage.googleapis.com/${bucketName}/`, '');
    const file = bucket.file(fileName);
    
    await file.delete();
    return true;
  } catch (error) {
    console.error('Error deleting file from GCS:', error);
    throw error;
  }
};

/**
 * Get signed URL for private file access
 * @param {String} fileName - File name in GCS
 * @param {Number} expiresIn - Expiration time in minutes (default: 60)
 * @returns {Promise<String>} - Signed URL
 */
const getSignedUrl = async (fileName, expiresIn = 60) => {
  try {
    const file = bucket.file(fileName);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 60 * 1000, // Convert minutes to milliseconds
    });
    
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

/**
 * List files for a user
 * @param {String} userId - User ID
 * @param {String} fileType - Type of files to list (optional)
 * @returns {Promise<Array>} - Array of file metadata
 */
const listUserFiles = async (userId, fileType = null) => {
  try {
    let prefix = `theROAC/${userId}/`;
    
    if (fileType) {
      prefix += `${fileType}/`;
    }

    const [files] = await bucket.getFiles({ prefix });
    
    const fileList = files.map(file => ({
      name: file.name,
      publicUrl: `https://storage.googleapis.com/${bucketName}/${file.name}`,
      metadata: file.metadata,
      created: file.metadata.timeCreated,
      size: file.metadata.size,
      contentType: file.metadata.contentType
    }));

    return fileList;
  } catch (error) {
    console.error('Error listing user files:', error);
    throw error;
  }
};

module.exports = {
  uploadToGCS,
  uploadMultipleToGCS,
  deleteFromGCS,
  getSignedUrl,
  listUserFiles,
  bucket,
  bucketName
};