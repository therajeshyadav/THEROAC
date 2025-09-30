const { Event, User, EventRegistration } = require('../models');
const { Op } = require('sequelize');

exports.createEvent = async (req, res, next) => {
  try {
    const payload = req.body;
    payload.createdBy = req.user.id;
    const event = await Event.create(payload);
    res.status(201).json(event);
  } catch (err) { next(err); }
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
      order: [['startDate','ASC']]
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
    const existing = await EventRegistration.findOne({ where: { userId, eventId }});
    if (existing) return res.status(400).json({ error: 'Already registered' });

    const registration = await EventRegistration.create({ userId, eventId });
    // increment registration count
    await Event.increment('registrations', { where: { id: eventId }});
    res.status(201).json(registration);
  } catch (err) { next(err); }
};
