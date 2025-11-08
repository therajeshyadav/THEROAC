const { User } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

exports.register = async (req, res, next) => {
  try {
    const { name, fullName, email, password, phone, role = 'candidate', provider = 'email' } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      fullName: fullName || name,
      email,
      phone,
      passwordHash: password,
      role,
      provider,
      emailVerificationToken,
      isVerified: false
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, emailVerificationToken, user.fullName);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Don't provide JWT token until email is verified
    // Remove sensitive data
    const userResponse = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    res.status(201).json({ 
      user: userResponse,
      needsVerification: true,
      message: 'Registration successful! Please check your email to verify your account before logging in.'
    });
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

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email address before logging in.',
        needsVerification: true
      });
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
      role: user.role,
      isVerified: user.isVerified
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
      role: user.role,
      isVerified: user.isVerified
    };

    res.json(userResponse);
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({ 
      where: { emailVerificationToken: token } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Update user verification status
    user.isVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = null;
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.json({ message: 'Email verified successfully!' });
  } catch (err) {
    next(err);
  }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(email, emailVerificationToken, user.fullName);

    res.json({ message: 'Verification email sent successfully!' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(email, resetToken, user.fullName);

    res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const user = await User.findOne({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordExpires: { [require('sequelize').Op.gt]: new Date() }
      } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.passwordHash = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.failedLoginAttempts = 0;
    await user.save();

    res.json({ message: 'Password reset successfully!' });
  } catch (err) {
    next(err);
  }
};