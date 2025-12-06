const { HubContent, User, HubContentApplication } = require('../models');
const { Op } = require('sequelize');

exports.createHubContent = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Validate required fields
    if (!payload.title || !payload.description || !payload.content) {
      return res.status(400).json({
        error: 'Missing required fields: title, description, and content are required'
      });
    }

    // Add organization context if available
    if (req.currentOrganization) {
      payload.organizationId = req.currentOrganization.id;
      if (!payload.companyName) payload.companyName = req.currentOrganization.name;
      if (!payload.companyLogo) payload.companyLogo = req.currentOrganization.logo;
    }

    // Validate and sanitize stipend field for internships
    if (payload.stipend) {
      if (typeof payload.stipend === 'string') {
        try {
          payload.stipend = JSON.parse(payload.stipend);
        } catch (e) {
          payload.stipend = null;
        }
      }
      // Ensure stipend has proper structure
      if (payload.stipend && typeof payload.stipend === 'object') {
        payload.stipend = {
          amount: payload.stipend.amount || '',
          currency: payload.stipend.currency || 'USD',
          period: payload.stipend.period || 'monthly'
        };
      }
    }

    // Validate and sanitize JSON fields
    ['tags', 'skills', 'media'].forEach(field => {
      if (payload[field] && typeof payload[field] === 'string') {
        try {
          payload[field] = JSON.parse(payload[field]);
        } catch (e) {
          payload[field] = [];
        }
      }
    });

    // Handle tags - convert to array if string
    if (payload.tags && !Array.isArray(payload.tags)) {
      payload.tags = payload.tags.split(',').map(tag => tag.trim());
    }

    // Generate slug from title
    let baseSlug = payload.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) {
      baseSlug = 'hub-content';
    }

    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (await HubContent.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    payload.slug = slug;
    payload.createdBy = req.user.id;
    payload.status = payload.status || 'published';
    payload.category = payload.category || 'career-tips';

    const hubContent = await HubContent.create(payload);

    res.status(201).json(hubContent);
  } catch (err) {
    console.error('Hub content creation error:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: err.errors[0]?.message || 'Validation error'
      });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Content with this slug already exists'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to create hub content. Please try again.'
    });
  }
};

exports.listHubContent = async (req, res, next) => {
  try {
    const { q, category, status, contentType, page = 1, perPage = 20 } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (q) where.title = { [Op.iLike]: `%${q}%` };
    if (category) where.category = category;
    if (contentType) where.contentType = contentType;

    const hubContent = await HubContent.findAll({
      where,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'fullName', 'email']
      }],
      offset: (page - 1) * perPage,
      limit: perPage,
      order: [['createdAt', 'DESC']]
    });

    res.json(hubContent);
  } catch (err) {
    console.error('Error in listHubContent:', err);
    return res.status(500).json({
      error: 'Failed to fetch hub content. Please try again.'
    });
  }
};

exports.getHubContent = async (req, res, next) => {
  try {
    const hubContent = await HubContent.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'fullName', 'email']
      }]
    });
    
    if (!hubContent) {
      return res.status(404).json({ error: 'Hub content not found' });
    }

    // Increment view counter only for candidates
    if (req.user && req.user.role === 'candidate') {
      await hubContent.increment('views');
    }
    
    res.json(hubContent);
  } catch (err) {
    console.error('Error in getHubContent:', err);
    return res.status(500).json({
      error: 'Failed to fetch hub content details. Please try again.'
    });
  }
};

exports.updateHubContent = async (req, res, next) => {
  try {
    const hubContent = await HubContent.findByPk(req.params.id);
    if (!hubContent) {
      return res.status(404).json({ error: 'Hub content not found' });
    }

    // Check if user is authorized to update
    if (hubContent.createdBy !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to update this content' });
    }

    const payload = { ...req.body };

    // Validate and sanitize stipend field for internships
    if (payload.stipend) {
      if (typeof payload.stipend === 'string') {
        try {
          payload.stipend = JSON.parse(payload.stipend);
        } catch (e) {
          payload.stipend = null;
        }
      }
      // Ensure stipend has proper structure
      if (payload.stipend && typeof payload.stipend === 'object') {
        payload.stipend = {
          amount: payload.stipend.amount || '',
          currency: payload.stipend.currency || 'USD',
          period: payload.stipend.period || 'monthly'
        };
      }
    }

    // Validate and sanitize JSON fields
    ['tags', 'skills', 'media'].forEach(field => {
      if (payload[field] && typeof payload[field] === 'string') {
        try {
          payload[field] = JSON.parse(payload[field]);
        } catch (e) {
          payload[field] = [];
        }
      }
    });

    // Handle tags - convert to array if string
    if (payload.tags && !Array.isArray(payload.tags)) {
      payload.tags = payload.tags.split(',').map(tag => tag.trim());
    }
    
    await hubContent.update(payload);

    res.json(hubContent);
  } catch (err) {
    console.error('Error in updateHubContent:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: err.errors[0]?.message || 'Validation error'
      });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Content with this slug already exists'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to update hub content. Please try again.'
    });
  }
};

exports.deleteHubContent = async (req, res, next) => {
  try {
    const hubContent = await HubContent.findByPk(req.params.id);
    if (!hubContent) {
      return res.status(404).json({ error: 'Hub content not found' });
    }

    await hubContent.destroy();
    res.json({ message: 'Hub content deleted successfully' });
  } catch (err) {
    console.error('Error in deleteHubContent:', err);
    return res.status(500).json({
      error: 'Failed to delete hub content. Please try again.'
    });
  }
};


// Get hub content by slug
exports.getHubContentBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const hubContent = await HubContent.findOne({
      where: { slug },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'fullName', 'email']
      }]
    });
    
    if (!hubContent) {
      return res.status(404).json({ error: 'Hub content not found' });
    }

    // Increment view counter only for candidates
    if (req.user && req.user.role === 'candidate') {
      await hubContent.increment('views');
    }
    
    res.json(hubContent);
  } catch (err) {
    console.error('Error fetching hub content by slug:', err);
    return res.status(500).json({
      error: 'Failed to fetch hub content. Please try again.'
    });
  }
};

// Apply to hub content
exports.applyToHubContent = async (req, res, next) => {
  try {
    const hubContentId = req.params.id;
    const userId = req.user.id;

    // Check if hub content exists
    const hubContent = await HubContent.findByPk(hubContentId);
    if (!hubContent) {
      return res.status(404).json({ error: 'Hub content not found' });
    }

    // Check if already applied
    const existingApplication = await HubContentApplication.findOne({
      where: { userId, hubContentId }
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied to this content' });
    }

    // Create application
    const application = await HubContentApplication.create({
      userId,
      hubContentId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Successfully applied to hub content',
      application
    });
  } catch (err) {
    console.error('Error applying to hub content:', err);
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'You have already applied to this content'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to apply. Please try again.'
    });
  }
};

// Check if user has applied to hub content
exports.checkHubContentApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await HubContentApplication.findOne({
      where: { userId, hubContentId: id }
    });

    res.json({ 
      hasApplied: !!application
    });
  } catch (err) {
    console.error('Error checking hub content application status:', err);
    return res.status(500).json({
      error: 'Failed to check application status. Please try again.'
    });
  }
};
