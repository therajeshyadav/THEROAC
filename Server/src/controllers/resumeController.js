const { Resume } = require('../models');
const path = require('path');
const fs = require('fs').promises;

// Upload new resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({ error: 'No file uploaded or upload failed' });
    }

    const { title = 'My Resume', isDefault = false } = req.body;
    const userId = req.user.id;

    // If setting as default, unset other defaults
    if (isDefault) {
      await Resume.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    const resume = await Resume.create({
      userId,
      title,
      filePath: req.fileUrl, // GCS URL
      fileName: req.uploadedFile.originalName,
      fileSize: req.uploadedFile.size,
      isDefault
    });

    res.json({ 
      message: 'Resume uploaded successfully to Google Cloud Storage', 
      resume,
      uploadedFile: req.uploadedFile
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    return res.status(500).json({ error: 'Failed to upload resume' });
  }
};

// Get all user resumes
exports.getResumes = async (req, res) => {
  try {
    const userId = req.user.id;

    const resumes = await Resume.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    return res.status(500).json({ error: 'Failed to fetch resumes' });
  }
};

// Set default resume
exports.setDefaultResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Unset all defaults
    await Resume.update(
      { isDefault: false },
      { where: { userId } }
    );

    // Set new default
    const resume = await Resume.findOne({
      where: { id, userId }
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    resume.isDefault = true;
    await resume.save();

    res.json({ message: 'Default resume updated', resume });
  } catch (error) {
    console.error('Set default resume error:', error);
    return res.status(500).json({ error: 'Failed to set default resume' });
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resume = await Resume.findOne({
      where: { id, userId }
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, '../../', resume.filePath);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue even if file deletion fails
    }

    await resume.destroy();

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    return res.status(500).json({ error: 'Failed to delete resume' });
  }
};

// Update resume title
exports.updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    const resume = await Resume.findOne({
      where: { id, userId }
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (title) resume.title = title;
    await resume.save();

    res.json({ message: 'Resume updated', resume });
  } catch (error) {
    console.error('Update resume error:', error);
    return res.status(500).json({ error: 'Failed to update resume' });
  }
};

module.exports = exports;
