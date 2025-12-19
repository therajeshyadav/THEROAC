const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/auth');
const { attachOrganizationContext } = require('../middlewares/organizationMiddleware');

// Get reviews for a specific item
router.get('/:itemType/:itemId', reviewController.getReviews);

// Create a new review (requires authentication)
router.post('/:itemType/:itemId', authenticate, attachOrganizationContext, reviewController.createReview);

// Update a review (requires authentication)
router.put('/:reviewId', authenticate, attachOrganizationContext, reviewController.updateReview);

// Delete a review (requires authentication)
router.delete('/:reviewId', authenticate, attachOrganizationContext, reviewController.deleteReview);

// Mark review as helpful (requires authentication)
router.post('/:reviewId/helpful', authenticate, attachOrganizationContext, reviewController.markHelpful);

module.exports = router;