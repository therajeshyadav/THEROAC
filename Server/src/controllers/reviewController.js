const { Review, User } = require('../models');
const { Op } = require('sequelize');

// Get reviews for a specific item (job, event, internship, etc.)
exports.getReviews = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = req.query;

    const reviews = await Review.findAndCountAll({
      where: {
        itemType,
        itemId,
        status: 'approved'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'profilePicture', 'role'],
          required: true
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, order.toUpperCase()]],
      distinct: true
    });

    // Calculate average rating
    const avgRating = await Review.findOne({
      where: {
        itemType,
        itemId,
        status: 'approved'
      },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalReviews']
      ],
      raw: true
    });

    res.json({
      reviews: reviews.rows,
      pagination: {
        total: reviews.count,
        totalPages: Math.ceil(reviews.count / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      },
      stats: {
        averageRating: parseFloat(avgRating.averageRating) || 0,
        totalReviews: parseInt(avgRating.totalReviews) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    const { rating, title, comment, content, pros, cons, isAnonymous = false } = req.body;

    // Use content as comment if comment is not provided
    const reviewComment = comment || content;
    const reviewTitle = title || 'Review'; // Default title if not provided
    const reviewRating = rating || 5; // Default rating if not provided

    // Validate required fields
    if (!reviewComment) {
      return res.status(400).json({ error: 'Review content is required' });
    }

    // Check if user already reviewed this item
    const existingReview = await Review.findOne({
      where: {
        itemType,
        itemId,
        createdBy: req.user.id
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this item' });
    }

    const review = await Review.create({
      itemType,
      itemId,
      rating: parseInt(reviewRating),
      title: reviewTitle,
      comment: reviewComment,
      pros,
      cons,
      isAnonymous,
      createdBy: req.user.id,
      status: 'approved' // Auto-approve for now, can add moderation later
    });

    // Fetch the created review with author info
    const createdReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'profilePicture', 'role']
        }
      ]
    });

    res.status(201).json(createdReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, pros, cons, isAnonymous } = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }

    await review.update({
      rating: rating !== undefined ? parseInt(rating) : review.rating,
      title: title || review.title,
      comment: comment !== undefined ? comment : review.comment,
      pros: pros !== undefined ? pros : review.pros,
      cons: cons !== undefined ? cons : review.cons,
      isAnonymous: isAnonymous !== undefined ? isAnonymous : review.isAnonymous
    });

    // Fetch updated review with author info
    const updatedReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'profilePicture', 'role']
        }
      ]
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.createdBy !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    await review.destroy();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.increment('helpfulCount');
    res.json({ message: 'Review marked as helpful' });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
};