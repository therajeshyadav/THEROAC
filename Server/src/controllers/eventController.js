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
      createdBy: req.user.id
    };

    const event = await Event.create(payload);
    res.status(201).json(event);
  } catch (err) {
    console.error('Event creation error:', err);
    next(err);
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
  } catch (err) { next(err); }
};

exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    // increment view counter (atomic increment)
    await event.increment('views');
    res.json(event);
  } catch (err) { next(err); }
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
  } catch (err) { next(err); }
};
