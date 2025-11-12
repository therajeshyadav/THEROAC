const { HubContent, User } = require('../models');
const { Op } = require('sequelize');

exports.createHubContent = async (req, res, next) => {
  try {
    const { title, description, content, category, tags } = req.body;

    // Validate required fields
    if (!title || !description || !content) {
      return res.status(400).json({
        error: 'Missing required fields: title, description, and content are required'
      });
    }

    // Generate slug from title
    let baseSlug = title.toLowerCase()
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

    const hubContent = await HubContent.create({
      title,
      slug,
      description,
      content,
      category: category || 'career-tips',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      status: 'published',
      createdBy: req.user.id
    });

    res.status(201).json(hubContent);
  } catch (err) {
    console.error('Hub content creation error:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: err.errors[0]?.message || 'Validation error'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to create hub content. Please try again.'
    });
  }
};

exports.listHubContent = async (req, res, next) => {
  try {
    const { q, category, status, page = 1, perPage = 20 } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (q) where.title = { [Op.iLike]: `%${q}%` };
    if (category) where.category = category;

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

    // Increment view counter
    await hubContent.increment('views');
    
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

    const { title, description, content, category, tags, status } = req.body;
    
    await hubContent.update({
      title: title || hubContent.title,
      description: description || hubContent.description,
      content: content || hubContent.content,
      category: category || hubContent.category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : hubContent.tags),
      status: status || hubContent.status
    });

    res.json(hubContent);
  } catch (err) {
    console.error('Error in updateHubContent:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: err.errors[0]?.message || 'Validation error'
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

    // Increment view counter
    await hubContent.increment('views');
    
    res.json(hubContent);
  } catch (err) {
    console.error('Error fetching hub content by slug:', err);
    return res.status(500).json({
      error: 'Failed to fetch hub content. Please try again.'
    });
  }
};
