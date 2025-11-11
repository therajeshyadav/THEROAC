// src/routes/gmailRoutes.js
const express = require('express');
const router = express.Router();
const gmailAuth = require('../utils/gmailAuth');

router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Missing authorization code',
      });
    }

    // Exchange code for tokens and save to file
    const tokenData = await gmailAuth.saveNewToken(code);

    res.status(200).json({
      success: true,
      message: '✅ Gmail authorization successful — token saved',
      token: tokenData,
    });
  } catch (error) {
    console.error('❌ Gmail callback error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error authorizing Gmail API',
      error: error.message,
    });
  }
});

module.exports = router;
