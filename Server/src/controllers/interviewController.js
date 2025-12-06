const { Interview, JobApplication, Job, User } = require('../models');
const { Op } = require('sequelize');
const { getNotificationService } = require('../socket');

// Schedule interview (recruiter)
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicationId, scheduledAt, duration, type, meetingLink, location, notes } = req.body;
    const recruiterId = req.user.id;

    // Get application details
    const application = await JobApplication.findByPk(applicationId, {
      include: [{ model: Job, as: 'job' }]
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if recruiter owns this job
    if (application.job.createdBy !== recruiterId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const interview = await Interview.create({
      applicationId,
      candidateId: application.userId,
      recruiterId,
      jobId: application.jobId,
      scheduledAt,
      duration: duration || 60,
      type: type || 'video',
      meetingLink,
      location,
      notes
    });

    // Send notification to candidate
    try {
      const notificationService = getNotificationService();
      await notificationService.notifyInterviewScheduled(
        application.userId,
        application.job.title,
        scheduledAt,
        interview.id
      );
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    res.json({ message: 'Interview scheduled successfully', interview });
  } catch (error) {
    console.error('Schedule interview error:', error);
    return res.status(500).json({ error: 'Failed to schedule interview' });
  }
};

// Get candidate interviews
exports.getCandidateInterviews = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { status, upcoming } = req.query;

    const where = { candidateId };
    if (status) where.status = status;
    if (upcoming === 'true') {
      where.scheduledAt = { [Op.gte]: new Date() };
      where.status = { [Op.in]: ['scheduled', 'rescheduled'] };
    }

    const interviews = await Interview.findAll({
      where,
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'companyLogo']
        },
        {
          model: User,
          as: 'recruiter',
          attributes: ['id', 'fullName', 'email', 'profilePicture']
        }
      ],
      order: [['scheduledAt', 'ASC']]
    });

    res.json({ interviews });
  } catch (error) {
    console.error('Get candidate interviews error:', error);
    return res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

// Get recruiter interviews
exports.getRecruiterInterviews = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { status, upcoming } = req.query;

    const where = { recruiterId };
    if (status) where.status = status;
    if (upcoming === 'true') {
      where.scheduledAt = { [Op.gte]: new Date() };
      where.status = { [Op.in]: ['scheduled', 'rescheduled'] };
    }

    const interviews = await Interview.findAll({
      where,
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName']
        },
        {
          model: User,
          as: 'candidate',
          attributes: ['id', 'fullName', 'email', 'phone', 'profilePicture']
        }
      ],
      order: [['scheduledAt', 'ASC']]
    });

    res.json({ interviews });
  } catch (error) {
    console.error('Get recruiter interviews error:', error);
    return res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

// Update interview status
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, rating } = req.body;
    const userId = req.user.id;

    const interview = await Interview.findByPk(id);

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Check authorization
    if (interview.recruiterId !== userId && interview.candidateId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (status) interview.status = status;
    if (feedback) interview.feedback = feedback;
    if (rating) interview.rating = rating;

    await interview.save();

    res.json({ message: 'Interview updated', interview });
  } catch (error) {
    console.error('Update interview error:', error);
    return res.status(500).json({ error: 'Failed to update interview' });
  }
};

// Reschedule interview
exports.rescheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, notes } = req.body;
    const userId = req.user.id;

    const interview = await Interview.findByPk(id, {
      include: [{ model: Job, as: 'job' }]
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Check authorization
    if (interview.recruiterId !== userId && interview.candidateId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    interview.scheduledAt = scheduledAt;
    interview.status = 'rescheduled';
    if (notes) interview.notes = notes;

    await interview.save();

    // Notify the other party
    try {
      const notificationService = getNotificationService();
      const notifyUserId = interview.recruiterId === userId 
        ? interview.candidateId 
        : interview.recruiterId;
      
      await notificationService.notifyInterviewRescheduled(
        notifyUserId,
        interview.job.title,
        scheduledAt,
        interview.id
      );
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    res.json({ message: 'Interview rescheduled', interview });
  } catch (error) {
    console.error('Reschedule interview error:', error);
    return res.status(500).json({ error: 'Failed to reschedule interview' });
  }
};

module.exports = exports;
