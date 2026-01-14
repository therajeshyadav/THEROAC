const { deleteFromGCS } = require('../services/gcsService');

/**
 * Extract filename from GCS URL
 * @param {String} url - GCS public URL
 * @returns {String} - Filename
 */
const extractFilenameFromGCSUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Extract filename from URL like: https://storage.googleapis.com/theroac/users/roac/123/images/events/1234567890_filename.jpg
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return null;
  }
};

/**
 * Delete old file when updating with new file
 * @param {String} oldFileUrl - Old file URL to delete
 * @param {String} newFileUrl - New file URL (optional, for logging)
 * @returns {Promise<Boolean>} - Success status
 */
const replaceFile = async (oldFileUrl, newFileUrl = null) => {
  if (!oldFileUrl) return true;
  
  try {
    await deleteFromGCS(oldFileUrl);
    console.log(`Successfully deleted old file: ${oldFileUrl}`);
    if (newFileUrl) {
      console.log(`Replaced with new file: ${newFileUrl}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting old file:', error);
    return false;
  }
};

/**
 * Validate file type for events
 * @param {String} mimetype - File mimetype
 * @param {String} fileType - Expected file type ('image', 'video', 'media')
 * @returns {Boolean} - Is valid
 */
const validateEventFileType = (mimetype, fileType = 'media') => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const videoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv'];
  
  switch (fileType) {
    case 'image':
      return imageTypes.includes(mimetype);
    case 'video':
      return videoTypes.includes(mimetype);
    case 'media':
      return [...imageTypes, ...videoTypes].includes(mimetype);
    default:
      return false;
  }
};

/**
 * Generate file metadata for database storage
 * @param {Object} uploadedFile - Uploaded file info from middleware
 * @param {String} category - File category (banner, thumbnail, media, etc.)
 * @returns {Object} - File metadata
 */
const generateFileMetadata = (uploadedFile, category = 'media') => {
  return {
    url: uploadedFile.url,
    originalName: uploadedFile.originalName,
    mimetype: uploadedFile.mimetype,
    size: uploadedFile.size,
    category: category,
    uploadedAt: new Date().toISOString()
  };
};

/**
 * Clean up multiple files
 * @param {Array} fileUrls - Array of file URLs to delete
 * @returns {Promise<Object>} - Results summary
 */
const cleanupFiles = async (fileUrls) => {
  if (!fileUrls || !Array.isArray(fileUrls)) {
    return { success: 0, failed: 0, errors: [] };
  }
  
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (const url of fileUrls) {
    try {
      await deleteFromGCS(url);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({ url, error: error.message });
    }
  }
  
  return results;
};

module.exports = {
  extractFilenameFromGCSUrl,
  replaceFile,
  validateEventFileType,
  generateFileMetadata,
  cleanupFiles
};