const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { authenticate } = require('../middleware/auth');
const { attachOrganizationContext } = require('../middleware/organizationMiddleware');

// Get FAQs for a specific item
router.get('/:itemType/:itemId', faqController.getFAQs);

// Create a new FAQ question (requires authentication)
router.post('/:itemType/:itemId', authenticate, attachOrganizationContext, faqController.createFAQ);

// Answer an FAQ (requires authentication and appropriate role)
router.put('/:faqId/answer', authenticate, attachOrganizationContext, faqController.answerFAQ);

// Update an FAQ question (requires authentication)
router.put('/:faqId', authenticate, attachOrganizationContext, faqController.updateFAQ);

// Delete an FAQ (requires authentication)
router.delete('/:faqId', authenticate, attachOrganizationContext, faqController.deleteFAQ);

// Vote on an FAQ (requires authentication)
router.post('/:faqId/vote', authenticate, attachOrganizationContext, faqController.voteFAQ);

module.exports = router;