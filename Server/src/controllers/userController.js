const { User } = require('../models');
exports.getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found.' });
    }

    // Reload user from database to get all fields including phone
    const freshUser = await User.findByPk(req.user.id);
    if (!freshUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = freshUser.toJSON();
    delete user.passwordHash;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      user,
    });
  } catch (err) {
    console.error('Error in getProfile:', err);
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found.' });
    }

    console.log('Update profile request body:', req.body);

    const allowedFields = [
      'fullName',
      'username',
      'phone',
      'bio',
      'city',
      'state',
      'country',
      'preferences',
      'profilePicture',
      'headline',
      'location',
      'about',
      'resumePath',
      'skills',
      'experiences',
      'education',
      'company', // Company information for recruiters
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        // Parse JSON strings for array/object fields
        if (['skills', 'experiences', 'education', 'company', 'preferences'].includes(field)) {
          if (typeof req.body[field] === 'string') {
            try {
              updates[field] = JSON.parse(req.body[field]);
            } catch (e) {
              updates[field] = req.body[field];
            }
          } else {
            // Already an array/object
            updates[field] = req.body[field];
          }
        } else {
          // For text fields, only update if not empty string
          // Empty strings will be stored as-is (not converted to null)
          updates[field] = req.body[field];
        }
      }
    }

    console.log('Updates to be applied:', updates);

    // Check if phone number is being updated and if it already exists for another user
    if (updates.phone) {
      const existingUser = await User.findOne({
        where: {
          phone: updates.phone,
        }
      });

      // If phone exists and belongs to a different user, return error
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already registered with another account'
        });
      }
    }

    // Check if username is being updated and if it already exists for another user
    if (updates.username) {
      const existingUser = await User.findOne({
        where: {
          username: updates.username,
        }
      });

      // If username exists and belongs to a different user, return error
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
      }
    }

    await req.user.update(updates);

    const updatedUser = req.user.toJSON();
    delete updatedUser.passwordHash;
    delete updatedUser.resetPasswordToken;
    delete updatedUser.resetPasswordExpires;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Error in updateProfile:', err);
    
    // Handle Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0]?.path || 'field';
      return res.status(400).json({
        success: false,
        error: `This ${field} is already registered with another account`
      });
    }

    // Handle validation errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: err.errors[0]?.message || 'Validation error'
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile. Please try again.'
    });
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied: Admins only.' });
    }

    const users = await User.findAll({
      attributes: {
        exclude: [
          'passwordHash',
          'resetPasswordToken',
          'resetPasswordExpires',
        ],
      },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error('Error in listUsers:', err);
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied: Admins only.' });
    }

    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    next(err);
  }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found.' });
    }

    if (!req.fileUrl) {
      return res.status(400).json({ success: false, error: 'No file uploaded or upload failed.' });
    }

    // Update user's resumePath in database with GCS URL
    await req.user.update({ resumePath: req.fileUrl });

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully to Google Cloud Storage',
      resumePath: req.fileUrl,
      url: req.fileUrl,
      uploadedFile: req.uploadedFile,
    });
  } catch (err) {
    console.error('Error in uploadResume:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload resume. Please try again.'
    });
  }
};
