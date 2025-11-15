const express = require('express');
const router = express.Router();
const { ProfileView } = require('../models');
const { authenticate } = require('../middlewares/auth');

// Track profile view
router.post('/track', authenticate, async (req, res) => {
    try {
        const { profileUserId } = req.body;
        const viewerUserId = req.user?.id || null;

        if (!profileUserId) {
            return res.status(400).json({ error: 'Profile user ID is required' });
        }

        // Don't track if user is viewing their own profile
        if (viewerUserId && viewerUserId === profileUserId) {
            return res.json({ message: 'Own profile view not tracked' });
        }

        // Get IP and user agent
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Create profile view record
        await ProfileView.create({
            profileUserId: profileUserId,
            viewerUserId,
            viewedAt: new Date(),
            ipAddress,
            userAgent
        });

        res.json({ message: 'Profile view tracked successfully' });
    } catch (error) {
        console.error('Error tracking profile view:', error);
        res.status(500).json({ error: 'Failed to track profile view' });
    }
});

// Get profile views for a user (optional - for analytics)
router.get('/stats/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        // Only allow users to see their own profile view stats
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const totalViews = await ProfileView.count({
            where: { profileUserId: userId }
        });

        // Views in last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const viewsThisWeek = await ProfileView.count({
            where: {
                profileUserId: userId,
                viewedAt: { [require('sequelize').Op.gte]: oneWeekAgo }
            }
        });

        res.json({
            totalViews,
            viewsThisWeek
        });
    } catch (error) {
        console.error('Error fetching profile view stats:', error);
        res.status(500).json({ error: 'Failed to fetch profile view stats' });
    }
});

module.exports = router;
