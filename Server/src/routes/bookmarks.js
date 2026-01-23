const express = require('express');
const router = express.Router();
const { Bookmark, Job, Event, HubContent } = require('../models');
const { authenticate } = require('../middlewares/auth');

// Toggle bookmark
router.post('/toggle', authenticate, async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const userId = req.user.id;

    if (!itemId || !itemType) {
      return res.status(400).json({ error: 'itemId and itemType are required' });
    }

    // Check if bookmark exists
    const existing = await Bookmark.findOne({
      where: { userId, itemId, itemType }
    });

    if (existing) {
      // Remove bookmark
      await existing.destroy();
      return res.json({ bookmarked: false, message: 'Bookmark removed' });
    } else {
      // Add bookmark
      await Bookmark.create({ userId, itemId, itemType });
      return res.json({ bookmarked: true, message: 'Bookmark added' });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// Check bookmark status
router.get('/status/:itemType/:itemId', authenticate, async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    const userId = req.user.id;

    const bookmark = await Bookmark.findOne({
      where: { userId, itemId, itemType }
    });

    return res.json({ bookmarked: !!bookmark });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return res.status(500).json({ error: 'Failed to check bookmark status' });
  }
});

// Get user's bookmarks
router.get('/my-bookmarks', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookmarks = await Bookmark.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        { model: Job, required: false },
        { model: Event, required: false },
        { model: HubContent, required: false }
      ]
    });

    return res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});


module.exports = router;
