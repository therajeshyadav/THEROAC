const { Event, User, EventStageSubmission } = require('../models');
const { Op } = require('sequelize');

// Get event stages
exports.getEventStages = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    
    const event = await Event.findByPk(eventId, {
      attributes: ['id', 'title', 'stages']
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      eventId: event.id,
      eventTitle: event.title,
      stages: event.stages || []
    });
  } catch (err) {
    console.error('Error fetching event stages:', err);
    return res.status(500).json({
      error: 'Failed to fetch event stages. Please try again.'
    });
  }
};

// Submit stage submission
exports.submitStageSubmission = async (req, res, next) => {
  try {
    console.log('📝 Stage submission request received');
    console.log('📋 Request body:', req.body);
    console.log('📁 Uploaded files:', req.files);
    console.log('🔗 File URLs:', req.fileUrls);
    console.log('📎 Uploaded files data:', req.uploadedFiles);
    
    const { eventId, stageId } = req.params;
    const userId = req.user.id;
    
    // Get event and validate stage
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.stages || !Array.isArray(event.stages)) {
      return res.status(400).json({ error: 'This event does not have submission stages' });
    }

    const stageIndex = parseInt(stageId);
    if (stageIndex < 0 || stageIndex >= event.stages.length) {
      return res.status(400).json({ error: 'Invalid stage index' });
    }

    const stage = event.stages[stageIndex];
    const stageName = stage.title || `Stage ${stageIndex + 1}`;

    // Check if user already submitted for this stage
    const existingSubmission = await EventStageSubmission.findOne({
      where: {
        eventId,
        userId,
        stageIndex
      }
    });

    if (existingSubmission) {
      return res.status(400).json({ error: 'You have already submitted for this stage' });
    }

    // Check if stage is currently active (optional validation)
    const now = new Date();
    if (stage.startDate && new Date(stage.startDate) > now) {
      return res.status(400).json({ error: 'This stage has not started yet' });
    }

    if (stage.deadline && new Date(stage.deadline) < now) {
      return res.status(400).json({ error: 'The deadline for this stage has passed' });
    }

    // Prepare submission data
    const submissionData = {
      projectTitle: req.body.projectTitle,
      projectDescription: req.body.projectDescription,
      files: [],
      links: {},
      textFields: {}
    };

    // Add uploaded files to submission data
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      req.uploadedFiles.forEach(file => {
        submissionData.files.push({
          type: file.fieldname, // ppt, pdf, document, etc.
          label: file.originalname,
          fileName: file.originalname,
          url: file.url,
          fileUrl: file.url,
          uploadedAt: new Date(),
          size: file.size,
          mimeType: file.mimetype
        });
      });
    }

    // Add other form fields (links, text, etc.)
    Object.keys(req.body).forEach(key => {
      if (!['projectTitle', 'projectDescription', 'stageId', 'stageName'].includes(key)) {
        const value = req.body[key];
        if (value && value.trim()) {
          if (key.includes('link') || key.includes('github') || key.includes('video')) {
            submissionData.links[key] = value;
          } else {
            submissionData.textFields[key] = value;
          }
        }
      }
    });

    // Create submission
    const submission = await EventStageSubmission.create({
      eventId,
      userId,
      stageIndex,
      stageName,
      submissionData,
      status: 'submitted',
      submittedAt: new Date()
    });

    res.status(201).json({
      message: 'Submission created successfully',
      submission: {
        id: submission.id,
        stageIndex: submission.stageIndex,
        stageName: submission.stageName,
        status: submission.status,
        submittedAt: submission.submittedAt,
        filesUploaded: submissionData.files.length
      }
    });
  } catch (err) {
    console.error('Error submitting stage submission:', err);
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'You have already submitted for this stage'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to submit. Please try again.'
    });
  }
};

// Get stage submission status for a user
exports.getStageSubmissionStatus = async (req, res, next) => {
  try {
    const { eventId, stageId } = req.params;
    const userId = req.user.id;
    const stageIndex = parseInt(stageId);

    const submission = await EventStageSubmission.findOne({
      where: {
        eventId,
        userId,
        stageIndex
      }
    });

    res.json({
      hasSubmitted: !!submission,
      submission: submission ? {
        id: submission.id,
        status: submission.status,
        submittedAt: submission.submittedAt,
        reviewNotes: submission.reviewNotes,
        score: submission.score
      } : null
    });
  } catch (err) {
    console.error('Error checking stage submission status:', err);
    return res.status(500).json({
      error: 'Failed to check submission status. Please try again.'
    });
  }
};

// Get all user's submissions for an event
exports.getUserStageSubmissions = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const submissions = await EventStageSubmission.findAll({
      where: {
        eventId,
        userId
      },
      order: [['stageIndex', 'ASC']]
    });

    res.json({
      eventId,
      submissions: submissions.map(sub => ({
        id: sub.id,
        stageIndex: sub.stageIndex,
        stageName: sub.stageName,
        status: sub.status,
        submittedAt: sub.submittedAt,
        reviewNotes: sub.reviewNotes,
        score: sub.score
      }))
    });
  } catch (err) {
    console.error('Error fetching user stage submissions:', err);
    return res.status(500).json({
      error: 'Failed to fetch submissions. Please try again.'
    });
  }
};

// Get all submissions for a stage (for event organizers/judges)
exports.getStageSubmissions = async (req, res, next) => {
  try {
    const { eventId, stageId } = req.params;
    const stageIndex = parseInt(stageId);

    // Check if user is the event creator or admin
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.createdBy !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to view submissions' });
    }

    const submissions = await EventStageSubmission.findAll({
      where: {
        eventId,
        stageIndex
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email']
      }],
      order: [['submittedAt', 'DESC']]
    });

    res.json({
      eventId,
      stageIndex,
      submissions: submissions.map(sub => ({
        id: sub.id,
        user: sub.user,
        submissionData: sub.submissionData,
        status: sub.status,
        submittedAt: sub.submittedAt,
        reviewNotes: sub.reviewNotes,
        score: sub.score
      }))
    });
  } catch (err) {
    console.error('Error fetching stage submissions:', err);
    return res.status(500).json({
      error: 'Failed to fetch submissions. Please try again.'
    });
  }
};

// Update submission status (for judges/organizers)
exports.updateSubmissionStatus = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { status, reviewNotes, score } = req.body;

    const submission = await EventStageSubmission.findByPk(submissionId, {
      include: [{
        model: Event,
        as: 'event'
      }]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if user has permission to review
    if (submission.event.createdBy !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to review this submission' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (reviewNotes !== undefined) updateData.reviewNotes = reviewNotes;
    if (score !== undefined) updateData.score = score;
    if (status && status !== 'submitted') {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = req.user.id;
    }

    await submission.update(updateData);

    res.json({
      message: 'Submission updated successfully',
      submission: {
        id: submission.id,
        status: submission.status,
        reviewNotes: submission.reviewNotes,
        score: submission.score,
        reviewedAt: submission.reviewedAt
      }
    });
  } catch (err) {
    console.error('Error updating submission status:', err);
    return res.status(500).json({
      error: 'Failed to update submission. Please try again.'
    });
  }
};