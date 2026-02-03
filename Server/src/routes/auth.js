const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { User } = require('../models');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

// Email verification routes
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
    session: false
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth2callback?token=${token}`
    );
  }
);


// LinkedIn Auth
router.get('/linkedin', (req, res) => {
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/linkedin/callback`,
    scope: 'openid profile email',
    state,
  });

  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
});

router.get('/linkedin/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokenRes = await fetch(
      'https://www.linkedin.com/oauth/v2/accessToken',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${process.env.BACKEND_URL}/api/auth/linkedin/callback`,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        }),
      }
    );

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=linkedin_token`);
    }

    const profileRes = await fetch(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const profile = await profileRes.json();

    if (!profile.email) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=linkedin_no_email`);
    }

    let user = await User.findOne({ where: { email: profile.email } });
    const fullName = `${profile.given_name} ${profile.family_name}`.trim() || profile.displayName;
    if (user) {
      if (!user.linkedinId) {
        user.linkedinId = profile.sub;
        await user.save();
      }
    } else {
      user = await User.create({
        firstName: profile.given_name,
        lastName: profile.family_name,
        fullName,
        email: profile.email,
        linkedinId: profile.sub,
        emailVerifiedAt: new Date(),
        role: 'candidate',
        isVerified: true,
        profilePicture: profile.picture || null,
        lastLoginAt: new Date(),
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth2callback?token=${token}`
    );
  } catch (err) {
    console.error('LinkedIn OAuth error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=linkedin_failed`);
  }
});

module.exports = router;
