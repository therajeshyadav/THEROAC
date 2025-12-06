const { Event, User, EventRegistration } = require('../models');
const { Op } = require('sequelize');

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, time, venue, capacity, registrationDeadline } = req.body;

    // Validate required fields
    if (!title || !date || !time) {
      return res.status(400).json({
        error: 'Missing required fields: title, date, and time are required'
      });
    }

    // Add organization context if available
    let organizationId = null;
    if (req.currentOrganization) {
      organizationId = req.currentOrganization.id;
    }

    // Generate base slug from title
    let baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // Fallback if slug is empty
    if (!baseSlug) {
      baseSlug = 'event';
    }

    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (await Event.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create startDate from date and time
    const startDate = new Date(`${date}T${time}`);

    // Validate date
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date or time format'
      });
    }

    // Set endDate to 2 hours after startDate by default (can be customized)
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000));

    const payload = {
      title,
      slug,
      description,
      startDate,
      endDate,
      location: venue || null,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      locationType: venue ? 'offline' : 'online',
      tags: [],
      createdBy: req.user.id,
      organizationId
    };

    // Auto-populate company social links from recruiter profile
    if (req.user.role === 'recruiter' && req.user.companySocialLinks) {
      payload.sociallinks = req.user.companySocialLinks;
    }

    const event = await Event.create(payload);
    res.status(201).json(event);
  } catch (err) {
    console.error('Event creation error:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: err.errors[0]?.message || 'Validation error'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to create event. Please try again.'
    });
  }
};

exports.listEvents = async (req, res, next) => {
  try {
    const { q, tag, status, page = 1, perPage = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (q) where.title = { [Op.iLike]: `%${q}%` };
    if (tag) where.tags = { [Op.contains]: [tag] };

    const events = await Event.findAll({
      where,
      offset: (page - 1) * perPage,
      limit: perPage,
      order: [['startDate', 'ASC']]
    });
    res.json(events);
  } catch (err) {
    console.error('Error in listEvents:', err);
    return res.status(500).json({
      error: 'Failed to fetch events. Please try again.'
    });
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    // increment view counter (atomic increment)
    await event.increment('views');
    res.json(event);
  } catch (err) {
    console.error('Error in getEvent:', err);
    return res.status(500).json({
      error: 'Failed to fetch event details. Please try again.'
    });
  }
};

exports.registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    // Check if already registered
    const existing = await EventRegistration.findOne({ where: { userId, eventId } });
    if (existing) return res.status(400).json({ error: 'Already registered' });

    const registration = await EventRegistration.create({ userId, eventId });
    // increment registration count
    await Event.increment('registrations', { where: { id: eventId } });
    res.status(201).json(registration);
  } catch (err) {
    console.error('Error in registerForEvent:', err);
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'You have already registered for this event'
      });
    }
    
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to register for event. Please try again.'
    });
  }
};

// Check if user has registered for event
exports.checkEventRegistrationStatus = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const registration = await EventRegistration.findOne({
      where: { userId, eventId }
    });

    res.json({
      hasRegistered: !!registration,
      hasApplied: !!registration
    });
  } catch (err) {
    console.error('Error checking event registration status:', err);
    return res.status(500).json({
      error: 'Failed to check registration status. Please try again.'
    });
  }
};


// Get event by slug
exports.getEventBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const event = await Event.findOne({
      where: { slug }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Increment view counter
    await event.increment('views');
    
    res.json(event);
  } catch (err) {
    console.error('Error fetching event by slug:', err);
    return res.status(500).json({
      error: 'Failed to fetch event. Please try again.'
    });
  }
};

// Upload image for event
exports.uploadEventImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Generate image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/events/${req.file.filename}`;

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading event image:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};
