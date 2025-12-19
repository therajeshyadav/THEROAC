const { Event, User, EventRegistration } = require('../models');
const { Op } = require('sequelize');

exports.createEvent = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      locationType, 
      location, 
      venue, 
      city, 
      state, 
      country, 
      venueAddress, 
      mapLink, 
      registrationDeadline, 
      maxParticipants, 
      registrationFee, 
      registrationLink, 
      tags, 
      categories, 
      requirements, 
      whatToBring, 
      bannerImage, 
      thumbnailImage, 
      media, 
      contactInfo, 
      socials, 
      agenda, 
      speakers, 
      sponsors, 
      prizes, 
      faqs,
      eligibility, 
      featured, 
      status 
    } = req.body;

    // Validate required fields
    if (!title || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: title and startDate are required'
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

    // Parse dates
    const parsedStartDate = new Date(startDate);
    let parsedEndDate;
    
    if (endDate) {
      parsedEndDate = new Date(endDate);
    } else {
      // Set endDate to 2 hours after startDate by default
      parsedEndDate = new Date(parsedStartDate.getTime() + (2 * 60 * 60 * 1000));
    }

    // Validate dates
    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid startDate format'
      });
    }

    if (isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid endDate format'
      });
    }

    const payload = {
      title,
      slug,
      description: description || null,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      locationType: locationType || 'online',
      location: location || null,
      venue: venue || null,
      city: city || null,
      state: state || null,
      country: country || null,
      venueAddress: venueAddress || null,
      mapLink: mapLink || null,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      registrationFee: registrationFee || null,
      registrationLink: registrationLink || null,
      tags: tags || [],
      categories: categories || [],
      requirements: requirements || null,
      whatToBring: whatToBring || [],
      bannerImage: bannerImage || null,
      thumbnailImage: thumbnailImage || null,
      media: media || [],
      contactInfo: contactInfo || null,
      socials: socials || null,
      agenda: agenda || [],
      speakers: speakers || [],
      sponsors: sponsors || [],
      prizes: prizes || [],
      faqs: faqs || [],
      eligibility: eligibility || null,
      featured: featured || false,
      status: status || 'upcoming',
      createdBy: req.user.id,
      organizationId,
      approvalStatus: 'pending' // Set to pending for admin approval
    };

    const event = await Event.create(payload);
    
    // Create notification for admin about new event pending approval
    try {
      const { getNotificationService } = require('../socket');
      const notificationService = getNotificationService();
      const { User } = require('../models');
      
      // Get all admin users
      const adminUsers = await User.findAll({
        where: { role: ['admin', 'superadmin'] }
      });
      
      // Create notification for each admin
      for (const admin of adminUsers) {
        await notificationService.createNotification(
          admin.id,
          'event_pending_approval',
          'New Event Pending Approval',
          `${req.user.fullName || req.user.email} created a new event "${event.title}" that requires approval.`,
          { 
            eventId: event.id, 
            eventTitle: event.title, 
            organizerName: req.user.fullName || req.user.email,
            organizerId: req.user.id
          },
          `/admin-dashboard?tab=approvals`
        );
      }
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
      // Don't fail event creation if notification fails
    }
    
    // Send success response with approval info
    res.status(201).json({
      ...event.toJSON(),
      message: 'Event created successfully! It will be visible after admin approval.',
      requiresApproval: true
    });
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

exports.updateEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      locationType, 
      location, 
      venue, 
      city, 
      state, 
      country, 
      venueAddress, 
      mapLink, 
      registrationDeadline, 
      maxParticipants, 
      registrationFee, 
      registrationLink, 
      tags, 
      categories, 
      requirements, 
      whatToBring, 
      bannerImage, 
      thumbnailImage, 
      media, 
      contactInfo, 
      socials, 
      agenda, 
      speakers, 
      sponsors, 
      prizes, 
      faqs,
      eligibility, 
      featured, 
      status 
    } = req.body;

    // Find the event
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or admin
    if (event.createdBy !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to update this event' });
    }

    // Prepare update payload
    const updatePayload = {};
    
    if (title !== undefined) {
      updatePayload.title = title;
      
      // Regenerate slug if title changed
      if (title !== event.title) {
        let baseSlug = title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        if (!baseSlug) baseSlug = 'event';
        
        let slug = baseSlug;
        let counter = 1;
        while (await Event.findOne({ where: { slug, id: { [Op.ne]: eventId } } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        updatePayload.slug = slug;
      }
    }
    
    if (description !== undefined) updatePayload.description = description;
    if (startDate !== undefined) updatePayload.startDate = new Date(startDate);
    if (endDate !== undefined) updatePayload.endDate = new Date(endDate);
    if (locationType !== undefined) updatePayload.locationType = locationType;
    if (location !== undefined) updatePayload.location = location;
    if (venue !== undefined) updatePayload.venue = venue;
    if (city !== undefined) updatePayload.city = city;
    if (state !== undefined) updatePayload.state = state;
    if (country !== undefined) updatePayload.country = country;
    if (venueAddress !== undefined) updatePayload.venueAddress = venueAddress;
    if (mapLink !== undefined) updatePayload.mapLink = mapLink;
    if (registrationDeadline !== undefined) updatePayload.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
    if (maxParticipants !== undefined) updatePayload.maxParticipants = maxParticipants ? parseInt(maxParticipants) : null;
    if (registrationFee !== undefined) updatePayload.registrationFee = registrationFee;
    if (registrationLink !== undefined) updatePayload.registrationLink = registrationLink;
    if (tags !== undefined) updatePayload.tags = tags;
    if (categories !== undefined) updatePayload.categories = categories;
    if (requirements !== undefined) updatePayload.requirements = requirements;
    if (whatToBring !== undefined) updatePayload.whatToBring = whatToBring;
    if (bannerImage !== undefined) updatePayload.bannerImage = bannerImage;
    if (thumbnailImage !== undefined) updatePayload.thumbnailImage = thumbnailImage;
    if (media !== undefined) updatePayload.media = media;
    if (contactInfo !== undefined) updatePayload.contactInfo = contactInfo;
    if (socials !== undefined) updatePayload.socials = socials;
    if (agenda !== undefined) updatePayload.agenda = agenda;
    if (speakers !== undefined) updatePayload.speakers = speakers;
    if (sponsors !== undefined) updatePayload.sponsors = sponsors;
    if (prizes !== undefined) updatePayload.prizes = prizes;
    if (faqs !== undefined) updatePayload.faqs = faqs;
    if (eligibility !== undefined) updatePayload.eligibility = eligibility;
    if (featured !== undefined) updatePayload.featured = featured;
    if (status !== undefined) updatePayload.status = status;

    // Update the event
    await event.update(updatePayload);

    res.json({
      ...event.toJSON(),
      message: 'Event updated successfully'
    });
  } catch (err) {
    console.error('Event update error:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: err.errors[0]?.message || 'Validation error'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to update event. Please try again.'
    });
  }
};

exports.listEvents = async (req, res, next) => {
  try {
    const { q, tag, status, page = 1, perPage = 20 } = req.query;
    const where = { approvalStatus: 'approved' }; // Only show approved events
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

// Get organizer's own events
exports.getMyEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, approvalStatus, showAll = false } = req.query;
    const where = { createdBy: req.user.id };

    if (status) where.status = status;
    
    // By default, only show approved events unless explicitly requested otherwise
    if (approvalStatus) {
      where.approvalStatus = approvalStatus;
    } else if (showAll !== 'true') {
      where.approvalStatus = 'approved';
    }

    const events = await Event.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      events: events.rows,
      total: events.count,
      totalPages: Math.ceil(events.count / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('Error in getMyEvents:', err);
    return res.status(500).json({
      error: 'Failed to fetch your events. Please try again.'
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

// Upload media (images/videos) for event
exports.uploadEventMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No media file provided' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const isImage = req.file.mimetype.startsWith('image/');

    if (!isVideo && !isImage) {
      return res.status(400).json({ message: 'Only image and video files are allowed' });
    }

    // Generate media URL
    const mediaType = isVideo ? 'videos' : 'images';
    const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${mediaType}/events/${req.file.filename}`;

    // For videos, we might want to generate a thumbnail (simplified approach)
    let thumbnailUrl = mediaUrl;
    if (isVideo) {
      // For now, use a default video thumbnail or the same URL
      // In production, you might want to generate actual video thumbnails
      thumbnailUrl = `${req.protocol}://${req.get('host')}/assets/default-video-thumbnail.jpg`;
    }

    res.status(200).json({
      message: 'Media uploaded successfully',
      url: mediaUrl,
      thumbnail: thumbnailUrl,
      type: isVideo ? 'video' : 'image',
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading event media:', error);
    res.status(500).json({ message: 'Failed to upload media', error: error.message });
  }
};
