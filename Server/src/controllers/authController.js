const { User } = require('../models');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { name, fullName, email, password, phone, role = 'candidate', provider = 'email' } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      fullName: fullName || name,
      email,
      phone,
      passwordHash: password,
      role,
      provider
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Remove sensitive data
    const userResponse = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role
    };

    res.status(201).json({ user: userResponse, token });
  } catch (err) {
    next(err);
  }
};



exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await user.checkPassword(password);
    if (!valid) {
      if (user.failedLoginAttempts !== undefined) {
        user.failedLoginAttempts += 1;
        await user.save();
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update login info
    if (user.failedLoginAttempts !== undefined) {
      user.failedLoginAttempts = 0;
    }
    if (user.lastLogin !== undefined) {
      user.lastLogin = new Date();
    }
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Remove sensitive data
    const userResponse = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role
    };

    res.json({ user: userResponse, token });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userResponse = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role
    };

    res.json(userResponse);
  } catch (err) {
    next(err);
  }
};