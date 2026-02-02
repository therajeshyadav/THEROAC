const express = require('express');
const router = express.Router();
const profileQuizController = require('../controllers/profileQuizController');
const { authenticate } = require('../middleware/auth');

// Generate profile quiz based on user skills
router.post('/generate', authenticate, profileQuizController.generateProfileQuiz);

// Submit profile quiz
router.post('/submit', authenticate, profileQuizController.submitProfileQuiz);

// Get profile quiz status
router.get('/status', authenticate, profileQuizController.getProfileQuizStatus);

// Get user badges
router.get('/badges/:userId?', authenticate, profileQuizController.getUserBadges);

module.exports = router;