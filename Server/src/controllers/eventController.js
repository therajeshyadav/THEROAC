const { Event, User, EventRegistration, QuizSubmission, EventTeam, EventTeamMember, EventStageSubmission } = require('../models');
const { Op } = require('sequelize');

exports.createEvent = async (req, res, next) => {
  try {
    console.log('📥 CREATE EVENT REQUEST RECEIVED');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('User:', req.user ? req.user.id : 'No user');
    
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
      stages, // New: submission stages
      speakers, 
      sponsors, 
      prizes, 
      faqs,
      eligibility, 
      featured, 
      status,
      minTeamSize, // Add team size fields
      maxTeamSize,
      problemStatements // Add problem statements field
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
      companyName: companyName || req.body.companyName || null,
      companyLogo: companyLogo || req.body.companyLogo || null,
      description: description || null,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      locationType: req.body.mode || locationType || 'online', // Use mode if available, fallback to locationType
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
      categories: typeof categories === 'string' ? JSON.parse(categories) : (categories || []),
      requirements: requirements || null,
      whatToBring: whatToBring || [],
      bannerImage: bannerImage || null,
      thumbnailImage: thumbnailImage || null,
      media: media || [],
      contactInfo: typeof contactInfo === 'string' ? JSON.parse(contactInfo) : (contactInfo || null),
      socials: typeof socials === 'string' ? JSON.parse(socials) : (socials || null),
      agenda: agenda || [],
      stages: stages || [],
      speakers: speakers || [],
      sponsors: sponsors || [],
      prizes: prizes || [],
      faqs: faqs || [],
      eligibility: typeof eligibility === 'string' ? JSON.parse(eligibility) : (eligibility || null),
      featured: featured || false,
      status: status || 'upcoming',
      minTeamSize: minTeamSize ? parseInt(minTeamSize) : null,  
      maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : null,
      problemStatements: problemStatements || null,
      
      // Opportunity specific fields
      opportunityType: req.body.opportunityType || null,
      opportunitySubType: req.body.opportunitySubType || null,
      participationType: req.body.participationType || 'individual',
      mode: req.body.mode || locationType || 'online', // Sync mode with locationType
      
      // New unified edit modal fields
      workingDays: req.body.workingDays || null,
      hideOpenings: req.body.hideOpenings || false,
      festivalCampaign: req.body.festivalCampaign || null,
      registrationSettings: typeof req.body.registrationSettings === 'string' ? JSON.parse(req.body.registrationSettings) : (req.body.registrationSettings || null),
      prizesList: req.body.prizesList || null,
      prizeDescription: req.body.prizeDescription || null,
      prizeDeliverDays: req.body.prizeDeliverDays || null,
      participationCertificate: req.body.participationCertificate === 'true' || req.body.participationCertificate === true,
      paymentSettings: typeof req.body.paymentSettings === 'string' ? JSON.parse(req.body.paymentSettings) : (req.body.paymentSettings || null),
      importantDates: typeof req.body.importantDates === 'string' ? JSON.parse(req.body.importantDates) : (req.body.importantDates || null),
      attachments: typeof req.body.attachments === 'string' ? JSON.parse(req.body.attachments) : (req.body.attachments || null),
      gallery: typeof req.body.gallery === 'string' ? JSON.parse(req.body.gallery) : (req.body.gallery || null),
      mobileBanner: req.body.mobileBanner || null,
      themeColor: req.body.themeColor || null,
      terms: req.body.terms || null,
      additionalNotes: req.body.additionalNotes || null,
      socialLinks: typeof req.body.socialLinks === 'string' ? JSON.parse(req.body.socialLinks) : (req.body.socialLinks || null),
      createdBy: req.user.id,
      organizationId,
      approvalStatus: 'pending'
    };

    const event = await Event.create(payload);
    
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
    
    console.log('📥 UPDATE EVENT REQUEST');
    console.log('Event ID:', eventId);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Stages/Rounds:', req.body.stages);
    
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
      stages, // New: submission stages
      speakers, 
      sponsors, 
      prizes, 
      faqs,
      eligibility, 
      featured, 
      status,
      minTeamSize, // Add team size fields
      maxTeamSize,
      problemStatements // Add problem statements field
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
    
    if (req.body.companyName !== undefined) updatePayload.companyName = req.body.companyName;
    if (req.body.companyLogo !== undefined) updatePayload.companyLogo = req.body.companyLogo;
    if (description !== undefined) updatePayload.description = description;
    if (startDate !== undefined) updatePayload.startDate = new Date(startDate);
    if (endDate !== undefined) updatePayload.endDate = new Date(endDate);
    
    // Sync locationType and mode fields
    if (req.body.mode !== undefined) {
      updatePayload.mode = req.body.mode;
      updatePayload.locationType = req.body.mode; // Keep them in sync
    } else if (locationType !== undefined) {
      updatePayload.locationType = locationType;
      updatePayload.mode = locationType; // Keep them in sync
    }
    
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
    if (tags !== undefined) updatePayload.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (categories !== undefined) updatePayload.categories = typeof categories === 'string' ? JSON.parse(categories) : categories;
    if (requirements !== undefined) updatePayload.requirements = requirements;
    if (whatToBring !== undefined) updatePayload.whatToBring = typeof whatToBring === 'string' ? JSON.parse(whatToBring) : whatToBring;
    if (bannerImage !== undefined) updatePayload.bannerImage = bannerImage;
    if (thumbnailImage !== undefined) updatePayload.thumbnailImage = thumbnailImage;
    if (media !== undefined) updatePayload.media = typeof media === 'string' ? JSON.parse(media) : media;
    if (contactInfo !== undefined) updatePayload.contactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;
    if (socials !== undefined) updatePayload.socials = typeof socials === 'string' ? JSON.parse(socials) : socials;
    if (agenda !== undefined) updatePayload.agenda = typeof agenda === 'string' ? JSON.parse(agenda) : agenda;
    if (stages !== undefined) updatePayload.stages = typeof stages === 'string' ? JSON.parse(stages) : stages; // New: submission stages
    if (speakers !== undefined) updatePayload.speakers = typeof speakers === 'string' ? JSON.parse(speakers) : speakers;
    if (sponsors !== undefined) updatePayload.sponsors = typeof sponsors === 'string' ? JSON.parse(sponsors) : sponsors;
    if (prizes !== undefined) updatePayload.prizes = typeof prizes === 'string' ? JSON.parse(prizes) : prizes;
    if (faqs !== undefined) updatePayload.faqs = typeof faqs === 'string' ? JSON.parse(faqs) : faqs;
    if (eligibility !== undefined) updatePayload.eligibility = typeof eligibility === 'string' ? JSON.parse(eligibility) : eligibility;
    if (featured !== undefined) updatePayload.featured = featured;
    if (status !== undefined) updatePayload.status = status;
    if (minTeamSize !== undefined) updatePayload.minTeamSize = minTeamSize ? parseInt(minTeamSize) : null; // Add team size fields
    if (maxTeamSize !== undefined) updatePayload.maxTeamSize = maxTeamSize ? parseInt(maxTeamSize) : null;
    if (problemStatements !== undefined) updatePayload.problemStatements = problemStatements; // Add problem statements field
    
    // Opportunity specific fields
    if (req.body.opportunityType !== undefined) updatePayload.opportunityType = req.body.opportunityType;
    if (req.body.opportunitySubType !== undefined) updatePayload.opportunitySubType = req.body.opportunitySubType;
    if (req.body.participationType !== undefined) updatePayload.participationType = req.body.participationType;
    if (req.body.mode !== undefined) updatePayload.mode = req.body.mode;
    
    // New unified edit modal fields
    if (req.body.workingDays !== undefined) updatePayload.workingDays = req.body.workingDays;
    if (req.body.hideOpenings !== undefined) updatePayload.hideOpenings = req.body.hideOpenings;
    if (req.body.festivalCampaign !== undefined) updatePayload.festivalCampaign = req.body.festivalCampaign;
    if (req.body.registrationSettings !== undefined) updatePayload.registrationSettings = typeof req.body.registrationSettings === 'string' ? JSON.parse(req.body.registrationSettings) : req.body.registrationSettings;
    if (req.body.prizesList !== undefined) updatePayload.prizesList = req.body.prizesList;
    if (req.body.prizeDescription !== undefined) updatePayload.prizeDescription = req.body.prizeDescription;
    if (req.body.prizeDeliverDays !== undefined) updatePayload.prizeDeliverDays = req.body.prizeDeliverDays;
    if (req.body.participationCertificate !== undefined) updatePayload.participationCertificate = req.body.participationCertificate === 'true' || req.body.participationCertificate === true;
    if (req.body.paymentSettings !== undefined) updatePayload.paymentSettings = typeof req.body.paymentSettings === 'string' ? JSON.parse(req.body.paymentSettings) : req.body.paymentSettings;
    if (req.body.importantDates !== undefined) updatePayload.importantDates = typeof req.body.importantDates === 'string' ? JSON.parse(req.body.importantDates) : req.body.importantDates;
    if (req.body.attachments !== undefined) updatePayload.attachments = typeof req.body.attachments === 'string' ? JSON.parse(req.body.attachments) : req.body.attachments;
    if (req.body.gallery !== undefined) updatePayload.gallery = typeof req.body.gallery === 'string' ? JSON.parse(req.body.gallery) : req.body.gallery;
    if (req.body.mobileBanner !== undefined) updatePayload.mobileBanner = req.body.mobileBanner;
    if (req.body.themeColor !== undefined) updatePayload.themeColor = req.body.themeColor;
    if (req.body.terms !== undefined) updatePayload.terms = req.body.terms;
    if (req.body.additionalNotes !== undefined) updatePayload.additionalNotes = req.body.additionalNotes;
    if (req.body.socialLinks !== undefined) updatePayload.socialLinks = typeof req.body.socialLinks === 'string' ? JSON.parse(req.body.socialLinks) : req.body.socialLinks;

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
    if (!req.fileUrl) {
      return res.status(400).json({ message: 'No image file provided or upload failed' });
    }

    res.status(200).json({
      message: 'Image uploaded successfully to Google Cloud Storage',
      imageUrl: req.fileUrl,
      uploadedFile: req.uploadedFile
    });
  } catch (error) {
    console.error('Error uploading event image:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};

// Upload banner image for event
exports.uploadEventBannerImage = async (req, res, next) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({ message: 'No banner image file provided or upload failed' });
    }

    res.status(200).json({
      message: 'Banner image uploaded successfully to Google Cloud Storage',
      bannerImage: req.fileUrl,
      imageUrl: req.fileUrl, // Keep for backward compatibility
      uploadedFile: req.uploadedFile
    });
  } catch (error) {
    console.error('Error uploading event banner image:', error);
    res.status(500).json({ message: 'Failed to upload banner image', error: error.message });
  }
};

// Upload thumbnail image for event
exports.uploadEventThumbnailImage = async (req, res, next) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({ message: 'No thumbnail image file provided or upload failed' });
    }

    res.status(200).json({
      message: 'Thumbnail image uploaded successfully to Google Cloud Storage',
      thumbnailImage: req.fileUrl,
      imageUrl: req.fileUrl, // Keep for backward compatibility
      uploadedFile: req.uploadedFile
    });
  } catch (error) {
    console.error('Error uploading event thumbnail image:', error);
    res.status(500).json({ message: 'Failed to upload thumbnail image', error: error.message });
  }
};

// Upload sponsor logo for event
exports.uploadSponsorLogo = async (req, res, next) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({ message: 'No sponsor logo file provided or upload failed' });
    }

    res.status(200).json({
      message: 'Sponsor logo uploaded successfully to Google Cloud Storage',
      logo: req.fileUrl,
      imageUrl: req.fileUrl, // Keep for backward compatibility
      uploadedFile: req.uploadedFile
    });
  } catch (error) {
    console.error('Error uploading sponsor logo:', error);
    res.status(500).json({ message: 'Failed to upload sponsor logo', error: error.message });
  }
};

// Upload media (images/videos) for event
exports.uploadEventMedia = async (req, res, next) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({ message: 'No media file provided or upload failed' });
    }

    const isVideo = req.uploadedFile.mimetype.startsWith('video/');
    const isImage = req.uploadedFile.mimetype.startsWith('image/');

    if (!isVideo && !isImage) {
      return res.status(400).json({ message: 'Only image and video files are allowed' });
    }

    // For videos, we might want to generate a thumbnail (simplified approach)
    let thumbnailUrl = req.fileUrl;
    if (isVideo) {
      // For now, use a default video thumbnail
      // In production, you might want to generate actual video thumbnails
      thumbnailUrl = `https://storage.googleapis.com/theroac/assets/default-video-thumbnail.jpg`;
    }

    res.status(200).json({
      message: 'Media uploaded successfully to Google Cloud Storage',
      url: req.fileUrl,
      thumbnail: thumbnailUrl,
      type: isVideo ? 'video' : 'image',
      uploadedFile: req.uploadedFile
    });
  } catch (error) {
    console.error('Error uploading event media:', error);
    res.status(500).json({ message: 'Failed to upload media', error: error.message });
  }
};

// Quiz submission for event stages
exports.submitStageQuiz = async (req, res, next) => {
  try {
    const { eventId, stageIndex } = req.params;
    const { answers, timeSpent, completedAt } = req.body;
    const userId = req.user.id;

    // Find the event
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is registered for the event
    const registration = await EventRegistration.findOne({
      where: { userId, eventId }
    });
    if (!registration) {
      return res.status(403).json({ error: 'You must be registered for this event to take the quiz' });
    }

    // Validate stage index
    if (!event.stages || !event.stages[stageIndex]) {
      return res.status(404).json({ error: 'Stage not found' });
    }

    const stage = event.stages[stageIndex];
    if (!stage.hasQuiz || !stage.quiz || !stage.quiz.questions) {
      return res.status(400).json({ error: 'This stage does not have a quiz' });
    }

    // Check if quiz is currently active (within stage dates)
    const now = new Date();
    const stageStart = new Date(stage.startDate);
    const stageEnd = new Date(stage.deadline);
    
    if (now < stageStart) {
      return res.status(400).json({ error: 'Quiz is not yet available' });
    }
    if (now > stageEnd) {
      return res.status(400).json({ error: 'Quiz deadline has passed' });
    }

    // Check if user has already submitted this quiz
    const existingSubmission = await QuizSubmission.findOne({
      where: { eventId, stageIndex: parseInt(stageIndex), userId }
    });
    if (existingSubmission) {
      return res.status(400).json({ error: 'You have already submitted this quiz' });
    }

    // Calculate score
    const questions = stage.quiz.questions;
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer;
      const points = question.points || 1;
      
      totalPoints += points;
      
      if (userAnswer === correctAnswer) {
        correctAnswers++;
        earnedPoints += points;
      }
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= 70;

    // Save quiz submission
    const submission = await QuizSubmission.create({
      eventId,
      stageIndex: parseInt(stageIndex),
      userId,
      answers,
      score,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent: parseInt(timeSpent),
      completedAt: new Date(completedAt),
      passed
    });

    // Return results
    res.status(201).json({
      message: 'Quiz submitted successfully',
      results: {
        score,
        correctAnswers,
        totalQuestions: questions.length,
        timeSpent: parseInt(timeSpent),
        passed,
        submissionId: submission.id
      }
    });

  } catch (err) {
    console.error('Error in submitStageQuiz:', err);
    return res.status(500).json({
      error: 'Failed to submit quiz. Please try again.'
    });
  }
};

// Get quiz status for a stage
exports.getStageQuizStatus = async (req, res, next) => {
  try {
    const { eventId, stageIndex } = req.params;
    const userId = req.user.id;

    // Find the event
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is registered for the event
    const registration = await EventRegistration.findOne({
      where: { userId, eventId }
    });
    if (!registration) {
      return res.status(403).json({ error: 'You must be registered for this event' });
    }

    // Validate stage index
    if (!event.stages || !event.stages[stageIndex]) {
      return res.status(404).json({ error: 'Stage not found' });
    }

    const stage = event.stages[stageIndex];
    if (!stage.hasQuiz) {
      return res.json({
        hasQuiz: false,
        available: false,
        completed: false
      });
    }

    // Check if user has submitted this quiz
    const submission = await QuizSubmission.findOne({
      where: { eventId, stageIndex: parseInt(stageIndex), userId }
    });

    // Check if quiz is currently available
    const now = new Date();
    const stageStart = new Date(stage.startDate);
    const stageEnd = new Date(stage.deadline);
    const available = now >= stageStart && now <= stageEnd;

    res.json({
      hasQuiz: true,
      available,
      completed: !!submission,
      stageStart: stage.startDate,
      stageEnd: stage.deadline,
      quiz: {
        title: stage.quiz.title,
        description: stage.quiz.description,
        timeLimit: stage.quiz.timeLimit,
        questionCount: stage.quiz.questions ? stage.quiz.questions.length : 0
      },
      submission: submission ? {
        score: submission.score,
        passed: submission.passed,
        completedAt: submission.completedAt
      } : null
    });

  } catch (err) {
    console.error('Error in getStageQuizStatus:', err);
    return res.status(500).json({
      error: 'Failed to get quiz status. Please try again.'
    });
  }
};

// Get quiz results for a stage
exports.getStageQuizResults = async (req, res, next) => {
  try {
    const { eventId, stageIndex } = req.params;
    const userId = req.user.id;

    // Find the quiz submission
    const submission = await QuizSubmission.findOne({
      where: { eventId, stageIndex: parseInt(stageIndex), userId },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['title']
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Quiz submission not found' });
    }

    res.json({
      submission: {
        id: submission.id,
        score: submission.score,
        correctAnswers: submission.correctAnswers,
        totalQuestions: submission.totalQuestions,
        timeSpent: submission.timeSpent,
        passed: submission.passed,
        completedAt: submission.completedAt,
        answers: submission.answers
      },
      event: {
        title: submission.event.title
      }
    });

  } catch (err) {
    console.error('Error in getStageQuizResults:', err);
    return res.status(500).json({
      error: 'Failed to get quiz results. Please try again.'
    });
  }
};
// Get event participants for recruiter evaluation
exports.getEventParticipants = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all events created by the user
    const userEvents = await Event.findAll({
      where: { createdBy: userId },
      attributes: ['id', 'title', 'categories', 'stages']
    });
    
    if (userEvents.length === 0) {
      return res.status(200).json({ participants: [] });
    }
    
    const eventIds = userEvents.map(event => event.id);
    
    // Get all teams for user's events
    const teams = await EventTeam.findAll({
      where: { eventId: { [Op.in]: eventIds } },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'categories', 'stages']
        },
        {
          model: User,
          as: 'leader',
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: EventTeamMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullName', 'email', 'phone', 'headline']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Get all submissions for these events
    const submissions = await EventStageSubmission.findAll({
      where: { eventId: { [Op.in]: eventIds } },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });
    
    // Group submissions by event and user
    const submissionsByEventAndUser = {};
    submissions.forEach(sub => {
      const key = `${sub.eventId}-${sub.userId}`;
      if (!submissionsByEventAndUser[key]) {
        submissionsByEventAndUser[key] = [];
      }
      submissionsByEventAndUser[key].push(sub);
    });
    
    // Transform data for frontend
    const participants = teams.map(team => {
      const event = team.event;
      const eventType = event.categories && event.categories.length > 0 ? event.categories[0] : 'event';
      
      // Get submissions for this team's leader (assuming team leader submits for the team)
      const teamSubmissions = submissionsByEventAndUser[`${event.id}-${team.leaderId}`] || [];
      
      // Create event stages with actual submission data
      const eventStages = (event.stages || []).map((stage, stageIndex) => {
        const stageSubmission = teamSubmissions.find(sub => sub.stageIndex === stageIndex);
        
        return {
          title: stage.title || `Stage ${stageIndex + 1}`,
          description: stage.description,
          startDate: stage.startDate,
          deadline: stage.deadline,
          submissionRequirements: stage.submissions || [],
          submissions: stageSubmission ? [{
            id: stageSubmission.id,
            type: 'mixed',
            label: 'Team Submission',
            description: `Submitted by ${stageSubmission.user?.fullName || 'Team'}`,
            submittedAt: stageSubmission.submittedAt,
            status: stageSubmission.status,
            data: stageSubmission.submissionData,
            // Extract files from submission data
            files: stageSubmission.submissionData?.files || [],
            // Also include links as additional files for display
            ...(stageSubmission.submissionData?.links && Object.keys(stageSubmission.submissionData.links).length > 0 && {
              additionalFiles: Object.entries(stageSubmission.submissionData.links).map(([key, value]) => ({
                type: key.includes('github') ? 'github-link' : key.includes('video') ? 'demo-video' : 'link',
                label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                url: value,
                value: value
              }))
            })
          }] : []
        };
      });
      
      return {
        id: team.id,
        teamName: team.name, // Fix: use team.name instead of team.teamName
        eventId: event.id,
        eventTitle: event.title,
        eventType: eventType,
        eventCategory: event.categories ? event.categories.join(', ') : '',
        eventStages: eventStages, // Include actual submission data
        registrationDate: team.createdAt,
        evaluations: team.submissionData?.evaluations || [], // Include evaluations
        leader: {
          id: team.leader?.id,
          name: team.leader?.fullName,
          email: team.leader?.email,
          phone: team.leader?.phone
        },
        members: team.members?.map(member => ({
          id: member.user?.id,
          name: member.user?.fullName,
          email: member.user?.email,
          phone: member.user?.phone,
          role: member.role || 'Member',
          headline: member.user?.headline
        })) || [],
        hasSubmissions: teamSubmissions.length > 0,
        submissionsCount: teamSubmissions.length
      };
    });
    
    res.status(200).json({ participants });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    res.status(500).json({ 
      message: 'Failed to fetch event participants', 
      error: error.message 
    });
  }
};
// Evaluate team for a specific stage
exports.evaluateTeam = async (req, res, next) => {
  try {
    const { eventId, teamId } = req.params;
    const { stageIndex, status, feedback, evaluatedAt } = req.body;
    const userId = req.user.id;
    
    // Verify the event belongs to the user
    const event = await Event.findOne({
      where: { 
        id: eventId, 
        createdBy: userId 
      }
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or access denied' });
    }
    
    // Verify the team belongs to the event
    const team = await EventTeam.findOne({
      where: { 
        id: teamId, 
        eventId: eventId 
      }
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Validate status
    if (!['shortlisted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid evaluation status' });
    }
    
    // Create or update evaluation record
    // For now, we'll store this in the team's submissionData as evaluations array
    let evaluations = team.submissionData?.evaluations || [];
    
    // Remove existing evaluation for this stage if it exists
    evaluations = evaluations.filter(evaluation => evaluation.stageIndex !== stageIndex);
    
    // Add new evaluation
    evaluations.push({
      stageIndex,
      status,
      feedback: feedback || '',
      evaluatedAt: evaluatedAt || new Date().toISOString(),
      evaluatedBy: userId
    });
    
    // Update team with new evaluations
    await team.update({
      submissionData: {
        ...team.submissionData,
        evaluations
      }
    });
    
    res.status(200).json({ 
      message: `Team ${status} successfully`,
      evaluation: {
        stageIndex,
        status,
        feedback,
        evaluatedAt: evaluatedAt || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error evaluating team:', error);
    res.status(500).json({ 
      message: 'Failed to evaluate team', 
      error: error.message 
    });
  }
};

// Get team submissions for a specific event and team
exports.getTeamSubmissions = async (req, res, next) => {
  try {
    const { eventId, teamId } = req.params;
    const userId = req.user.id;
    
    // Verify the event belongs to the user
    const event = await Event.findOne({
      where: { 
        id: eventId, 
        createdBy: userId 
      }
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or access denied' });
    }
    
    // Verify the team belongs to the event
    const team = await EventTeam.findOne({
      where: { 
        id: teamId, 
        eventId: eventId 
      }
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // For now, return mock data structure
    // TODO: Implement actual submission tracking system
    const mockSubmissions = [
      {
        stageTitle: "Stage 1: Idea Submission",
        stageDescription: "Submit your initial project idea and concept",
        submittedAt: new Date(),
        status: "Submitted",
        files: [
          {
            type: "document",
            label: "Project Proposal",
            description: "Initial project concept and plan",
            url: "#",
            fileName: "project_proposal.pdf",
            submittedBy: team.leader?.fullName || "Team Leader"
          },
          {
            type: "ppt",
            label: "Presentation Slides",
            description: "Project pitch presentation",
            url: "#",
            fileName: "pitch_slides.pptx",
            submittedBy: team.leader?.fullName || "Team Leader"
          }
        ]
      },
      {
        stageTitle: "Stage 2: Development Phase",
        stageDescription: "Submit your working prototype and code",
        submittedAt: new Date(),
        status: "Submitted",
        files: [
          {
            type: "github-link",
            label: "Source Code Repository",
            description: "Complete project source code",
            url: "https://github.com/example/project",
            submittedBy: "Developer"
          },
          {
            type: "demo-video",
            label: "Demo Video",
            description: "Working demonstration of the project",
            url: "https://youtube.com/watch?v=example",
            submittedBy: "Team Leader"
          },
          {
            type: "link",
            label: "Live Demo",
            description: "Deployed application link",
            url: "https://example-project.vercel.app",
            submittedBy: "Developer"
          }
        ]
      }
    ];
    
    res.status(200).json({ submissions: mockSubmissions });
  } catch (error) {
    console.error('Error fetching team submissions:', error);
    res.status(500).json({ 
      message: 'Failed to fetch team submissions', 
      error: error.message 
    });
  }
};

// Upload problem statement file for event
exports.uploadProblemStatement = async (req, res, next) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({ message: 'No problem statement file provided or upload failed' });
    }

    res.status(200).json({
      message: 'Problem statement uploaded successfully to Google Cloud Storage',
      url: req.fileUrl,
      uploadedFile: req.uploadedFile
    });
  } catch (error) {
    console.error('Error uploading problem statement:', error);
    res.status(500).json({ message: 'Failed to upload problem statement', error: error.message });
  }
};