const express = require('express');
const router = express.Router();
const { Like, Job, Event, HubContent, User, Organization } = require('../models');
const { authenticate } = require('../middleware/auth');

// Toggle like
router.post('/toggle', authenticate, async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const userId = req.user.id;

    if (!itemId || !itemType) {
      return res.status(400).json({ error: 'itemId and itemType are required' });
    }

    // Check if like exists
    const existing = await Like.findOne({
      where: { userId, itemId, itemType }
    });

    if (existing) {
      // Remove like
      await existing.destroy();
      return res.json({ liked: false, message: 'Like removed' });
    } else {
      // Add like
      await Like.create({ userId, itemId, itemType });
      return res.json({ liked: true, message: 'Like added' });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Check like status
router.get('/status/:itemType/:itemId', authenticate, async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    const userId = req.user.id;

    const like = await Like.findOne({
      where: { userId, itemId, itemType }
    });

    return res.json({ liked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    return res.status(500).json({ error: 'Failed to check like status' });
  }
});

// Get user's likes
router.get('/my-likes', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const likes = await Like.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        { model: Job, required: false },
        { 
          model: Event, 
          required: false,
          include: [
            { model: User, as: 'organizer', required: false },
            { model: Organization, as: 'organization', required: false }
          ]
        },
        { model: HubContent, required: false }
      ]
    });

    return res.json(likes);
  } catch (error) {
    console.error('Error fetching likes:', error);
    return res.status(500).json({ error: 'Failed to fetch likes' });
  }
});

module.exports = router;
