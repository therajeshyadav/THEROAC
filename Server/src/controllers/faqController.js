const { FAQ, User } = require('../models');
const { Op } = require('sequelize');

// Get FAQs for a specific item (job, event, internship, etc.)
exports.getFAQs = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    const { page = 1, limit = 20, sortBy = 'upvotes', order = 'DESC', answered } = req.query;

    const whereClause = {
      itemType,
      itemId,
      status: 'approved',
      isPublic: true
    };

    // Filter by answered status if specified
    if (answered !== undefined) {
      whereClause.isAnswered = answered === 'true';
    }

    const faqs = await FAQ.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'profilePicture', 'role'],
          required: true
        },
        {
          model: User,
          as: 'answerer',
          attributes: ['id', 'fullName', 'profilePicture', 'role'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, order.toUpperCase()]],
      distinct: true
    });

    res.json({
      faqs: faqs.rows,
      pagination: {
        total: faqs.count,
        totalPages: Math.ceil(faqs.count / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
};

// Create a new FAQ question
exports.createFAQ = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    const { question, isPublic = true } = req.body;

    // Validate required fields
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const faq = await FAQ.create({
      itemType,
      itemId,
      question: question.trim(),
      isPublic,
      createdBy: req.user.id,
      status: 'approved' // Auto-approve for now
    });

    // Fetch the created FAQ with author info
    const createdFAQ = await FAQ.findByPk(faq.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'profilePicture', 'role']
        }
      ]
    });

    res.status(201).json(createdFAQ);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
};

// Answer an FAQ
exports.answerFAQ = async (req, res) => {
  try {
    const { faqId } = req.params;
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    const faq = await FAQ.findByPk(faqId);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Only recruiters, admins, or the item creator can answer FAQs
    if (!['recruiter', 'admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to answer FAQs' });
    }

    await faq.update({
      answer: answer.trim(),
      isAnswered: true,
      answeredBy: req.user.id,
      answeredAt: new Date()
    });

    // Fetch updated FAQ with author and answerer info
    const updatedFAQ = await FAQ.findByPk(faqId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'profilePicture', 'role']
        },
        {
          model: User,
          as: 'answerer',
          attributes: ['id', 'fullName', 'profilePicture', 'role']
        }
      ]
    });

    res.json(updatedFAQ);
  } catch (error) {
    console.error('Error answering FAQ:', error);
    res.status(500).json({ error: 'Failed to answer FAQ' });
  }
};

// Update an FAQ question
exports.updateFAQ = async (req, res) => {
  try {
    const { faqId } = req.params;
    const { question, isPublic } = req.body;

    const faq = await FAQ.findByPk(faqId);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Check if user owns the FAQ
    if (faq.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own questions' });
    }

    await faq.update({
      question: question || faq.question,
      isPublic: isPublic !== undefined ? isPublic : faq.isPublic
    });

    // Fetch updated FAQ with author info
    const updatedFAQ = await FAQ.findByPk(faqId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'profilePicture', 'role']
        },
        {
          model: User,
          as: 'answerer',
          attributes: ['id', 'fullName', 'profilePicture', 'role']
        }
      ]
    });

    res.json(updatedFAQ);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
};

// Delete an FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const { faqId } = req.params;

    const faq = await FAQ.findByPk(faqId);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Check if user owns the FAQ or is admin
    if (faq.createdBy !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You can only delete your own questions' });
    }

    await faq.destroy();
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
};

// Vote on an FAQ (upvote/downvote)
exports.voteFAQ = async (req, res) => {
  try {
    const { faqId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type. Use "upvote" or "downvote"' });
    }

    const faq = await FAQ.findByPk(faqId);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    if (voteType === 'upvote') {
      await faq.increment('upvotes');
    } else {
      await faq.increment('downvotes');
    }

    res.json({ message: `FAQ ${voteType}d successfully` });
  } catch (error) {
    console.error('Error voting on FAQ:', error);
    res.status(500).json({ error: 'Failed to vote on FAQ' });
  }
};