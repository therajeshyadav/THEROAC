const { User } = require('../models');
exports.getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, username, bio, city, state, country, preferences } = req.body;

    Object.assign(req.user, {
      fullName: fullName || req.user.fullName,
      username: username || req.user.username,
      bio: bio || req.user.bio,
      city: city || req.user.city,
      state: state || req.user.state,
      country: country || req.user.country,
      preferences: preferences || req.user.preferences
    });

    await req.user.save();
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash', 'resetPasswordToken'] }
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};
