const { User } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const emailService = require('../utils/emailService');
const bcrypt = require('bcryptjs');

exports.register = async (req, res, next) => {
  try {
    const { name, fullName, email, password, phone, role = 'candidate', provider = 'email' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check only email uniqueness, phone can be shared by multiple users
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      fullName: fullName || name,
      email,
      phone,
      passwordHash: password, // Model hook will hash it automatically
      role,
      provider,
      emailVerificationToken,
      isVerified: false,
      failedLoginAttempts: 0,
      preferences: { emailNotifications: true, pushNotifications: true, darkMode: false },
      signupSource: 'website',
    });

    try {
      await emailService.sendVerificationEmail(email, emailVerificationToken, user.fullName);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    const userResponse = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    return res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: userResponse,
      needsVerification: true,
    });
  } catch (err) {
    console.error('Error in register:', err);
    
    // Handle Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0]?.path || 'field';
      return res.status(400).json({
        message: `This ${field} is already registered`
      });
    }

    // Handle validation errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: err.errors[0]?.message || 'Validation error'
      });
    }

    return res.status(500).json({
      message: 'Registration failed. Please try again.'
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({
        message: 'Your account has been banned. Please contact admin for further assistance.',
        isBanned: true,
        supportEmail: 'support@theroac.com',
        supportPhone: '+91-0000000000'
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if(!valid){
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
      });
    }

    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      state: user.state,
      country: user.country,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
    };

    return res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({
      message: 'Login failed. Please try again.'
    });
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userResponse = {
      id: user.id,
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      state: user.state,
      country: user.country,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      // Profile fields
      headline: user.headline,
      location: user.location,
      about: user.about,
      resumePath: user.resumePath,
      skills: user.skills || [],
      experiences: user.experiences || [],
      education: user.education || [],
      // Company information (for recruiters)
      company: user.company || null,
      // Preferences (hiring, communication, metrics)
      preferences: user.preferences || null,
    };

    res.json(userResponse);
  } catch (err) {
    console.error('Error in me:', err);
    return res.status(500).json({
      message: 'Failed to fetch user data. Please try again.'
    });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token)
      return res.status(400).json({ message: 'Verification token is required' });

    const user = await User.findOne({ where: { emailVerificationToken: token } });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired verification token' });

    if (user.isVerified)
      return res.status(400).json({ message: 'Email already verified' });

    user.isVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = null;
    await user.save();

    try {
      await emailService.sendWelcomeEmail(user.email, user.fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    return res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    console.error('Error in verifyEmail:', err);
    return res.status(500).json({
      message: 'Email verification failed. Please try again.'
    });
  }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified)
      return res.status(400).json({ message: 'Email already verified' });

    const token = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = token;
    await user.save();

    try {
      await emailService.sendVerificationEmail(email, token, user.fullName);
      return res.status(200).json({ message: 'Verification email sent successfully!' });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      // Still return success since token is saved, but inform about email issue
      return res.status(200).json({ 
        message: 'Verification token generated. Email service temporarily unavailable.',
        warning: 'Please try again in a few moments or contact support.'
      });
    }
  } catch (err) {
    console.error('Error in resendVerification:', err);
    return res.status(500).json({
      message: 'Failed to resend verification email. Please try again.'
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.json({
        message: 'If that email exists, a password reset link has been sent.',
      });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    await emailService.sendPasswordResetEmail(email, resetToken, user.fullName);

    return res.json({
      message: 'If that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    console.error('Error in forgotPassword:', err);
    return res.status(500).json({
      message: 'Failed to process password reset request. Please try again.'
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password)
      return res.status(400).json({ message: 'Token and new password are required' });

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.passwordHash = password; // Model hook will hash it automatically
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.failedLoginAttempts = 0;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully!' });
  } catch (err) {
    console.error('Error in resetPassword:', err);
    return res.status(500).json({
      message: 'Password reset failed. Please try again.'
    });
  }
};