const { User } = require('../models');
exports.getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found.' });
    }

    const user = req.user.toJSON();
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

    const allowedFields = [
      'fullName',
      'username',
      'bio',
      'city',
      'state',
      'country',
      'preferences',
      'profilePicture',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updates[field] = req.body[field];
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
    next(err);
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
