const { User } = require('../models');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, provider = 'email' } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash: password,
      provider
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await user.checkPassword(password);
    if (!valid) {
      user.failedLoginAttempts += 1;
      await user.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
};
