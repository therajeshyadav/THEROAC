const { User, Job, Event, JobApplication, EventRegistration } = require('../models');
const { Op } = require('sequelize');
const { getNotificationService } = require('../socket');

// Helper function to handle applications when job is rejected
const handleJobRejectionApplications = async (jobId, rejectionReason) => {
  try {
    // Find all applications for this job
    const applications = await JobApplication.findAll({
      where: { 
        jobId: jobId,
        status: { [Op.notIn]: ['rejected', 'cancelled'] }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email']
      }, {
        model: Job,
        as: 'job',
        attributes: ['title', 'companyName']
      }]
    });

    if (applications.length > 0) {
      // Update all applications to cancelled status
      await JobApplication.update(
        { 
          status: 'cancelled',
          notes: `Job posting was not approved by admin. Reason: ${rejectionReason}`
        },
        {
          where: { 
            jobId: jobId,
            status: { [Op.notIn]: ['rejected', 'cancelled'] }
          }
        }
      );

      // Send notifications to all applicants
      const notificationService = getNotificationService();
      for (const application of applications) {
        try {
          await notificationService.createNotification(
            application.user.id,
            'job_cancelled',
            'Job Application Cancelled',
            `Unfortunately, the job "${application.job.title}" at ${application.job.companyName} has been cancelled by the admin. Your application has been automatically cancelled.`,
            { 
              jobId: jobId,
              applicationId: application.id,
              rejectionReason: rejectionReason
            },
            '/candidate-dashboard?tab=applications'
          );
        } catch (notifError) {
          console.error(`Failed to notify applicant ${application.user.id}:`, notifError);
        }
      }

      console.log(`Cancelled ${applications.length} applications for rejected job ${jobId}`);
    }
  } catch (error) {
    console.error('Error handling job rejection applications:', error);
    // Don't throw error to prevent blocking the main rejection process
  }
};

// Helper function to handle registrations when event is rejected
const handleEventRejectionRegistrations = async (eventId, rejectionReason) => {
  try {
    // Find all registrations for this event
    const registrations = await EventRegistration.findAll({
      where: { 
        eventId: eventId,
        status: { [Op.notIn]: ['cancelled'] }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email']
      }, {
        model: Event,
        as: 'event',
        attributes: ['title']
      }]
    });

    if (registrations.length > 0) {
      // Update all registrations to cancelled status
      await EventRegistration.update(
        { 
          status: 'cancelled',
          notes: `Event was not approved by admin. Reason: ${rejectionReason}`
        },
        {
          where: { 
            eventId: eventId,
            status: { [Op.notIn]: ['cancelled'] }
          }
        }
      );

      // Send notifications to all registrants
      const notificationService = getNotificationService();
      for (const registration of registrations) {
        try {
          await notificationService.createNotification(
            registration.user.id,
            'event_cancelled',
            'Event Registration Cancelled',
            `Unfortunately, the event "${registration.event.title}" has been cancelled by the admin. Your registration has been automatically cancelled.`,
            { 
              eventId: eventId,
              registrationId: registration.id,
              rejectionReason: rejectionReason
            },
            '/candidate-dashboard?tab=events'
          );
        } catch (notifError) {
          console.error(`Failed to notify registrant ${registration.user.id}:`, notifError);
        }
      }

      console.log(`Cancelled ${registrations.length} registrations for rejected event ${eventId}`);
    }
  } catch (error) {
    console.error('Error handling event rejection registrations:', error);
    // Don't throw error to prevent blocking the main rejection process
  }
};

// Helper function to handle applications when internship is rejected
const handleInternshipRejectionApplications = async (internshipId, rejectionReason) => {
  try {
    const { HubContentApplication } = require('../models');
    
    // Find all applications for this internship
    const applications = await HubContentApplication.findAll({
      where: { 
        hubContentId: internshipId,
        status: { [Op.notIn]: ['rejected', 'cancelled'] }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email']
      }, {
        model: require('../models').HubContent,
        as: 'hubContent',
        attributes: ['title', 'companyName']
      }]
    });

    if (applications.length > 0) {
      // Update all applications to cancelled status
      await HubContentApplication.update(
        { 
          status: 'cancelled',
          notes: `Internship posting was not approved by admin. Reason: ${rejectionReason}`
        },
        {
          where: { 
            hubContentId: internshipId,
            status: { [Op.notIn]: ['rejected', 'cancelled'] }
          }
        }
      );

      // Send notifications to all applicants
      const notificationService = getNotificationService();
      for (const application of applications) {
        try {
          await notificationService.createNotification(
            application.user.id,
            'internship_cancelled',
            'Internship Application Cancelled',
            `Unfortunately, the internship "${application.hubContent.title}" at ${application.hubContent.companyName} has been cancelled by the admin. Your application has been automatically cancelled.`,
            { 
              internshipId: internshipId,
              applicationId: application.id,
              rejectionReason: rejectionReason
            },
            '/candidate-dashboard?tab=internships'
          );
        } catch (notifError) {
          console.error(`Failed to notify internship applicant ${application.user.id}:`, notifError);
        }
      }

      console.log(`Cancelled ${applications.length} applications for rejected internship ${internshipId}`);
    }
  } catch (error) {
    console.error('Error handling internship rejection applications:', error);
    // Don't throw error to prevent blocking the main rejection process
  }
};

// Dashboard Overview
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { Notification } = require('../models');
    
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalJobs,
      activeJobs,
      totalEvents,
      upcomingEvents,
      totalApplications,
      pendingApplications,
      pendingUsers,
      pendingJobApprovals,
      pendingEventApprovals,
      pendingInternshipApprovals,
      pendingROACPrimeApprovals,
      unreadNotifications
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'candidate' } }),
      User.count({ where: { role: 'recruiter' } }),
      Job.count(),
      Job.count({ where: { status: 'open' } }),
      Event.count(),
      Event.count({ where: { status: 'upcoming' } }),
      JobApplication.count(),
      JobApplication.count({ where: { status: 'pending' } }),
      User.count({ where: { status: 'inactive' } }),
      Job.count({ where: { approvalStatus: 'pending' } }),
      Event.count({ where: { approvalStatus: 'pending' } }),
      require('../models').HubContent.count({ where: { approvalStatus: 'pending', contentType: 'internship' } }),
      require('../models').HubContent.count({ 
        where: { 
          approvalStatus: 'pending',
          [Op.or]: [
            {
              contentType: { [Op.in]: ['job', 'opportunity'] },
              organizationId: { [Op.ne]: null }
            },
            {
              title: 'ROAC Talent Prime Hub',
              contentType: 'opportunity'
            }
          ]
        }
      }),
      Notification.count({ where: { userId: req.user.id, read: false } })
    ]);

    // Growth calculations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      newUsers,
      newJobs,
      newEvents,
      newApplications
    ] = await Promise.all([
      User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Job.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Event.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      JobApplication.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } })
    ]);

    res.json({
      overview: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalJobs,
        activeJobs,
        totalEvents,
        upcomingEvents,
        totalApplications,
        pendingApplications,
        pendingUsers,
        pendingJobApprovals,
        pendingEventApprovals,
        pendingInternshipApprovals,
        pendingROACPrimeApprovals,
        unreadNotifications
      },
      growth: {
        newUsers,
        newJobs,
        newEvents,
        newApplications
      }
    });
  } catch (err) {
    console.error('Error in getDashboardStats:', err);
    return res.status(500).json({
      error: 'Failed to fetch dashboard stats. Please try again.'
    });
  }
};

// User Management
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      // Exclude the current admin user to prevent self-banning
      id: { [Op.ne]: req.user.id }
    };
    
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'fullName', 'email', 'role', 'status', 'createdAt', 'lastLogin']
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    return res.status(500).json({
      error: 'Failed to fetch users. Please try again.'
    });
  }
};

// Update User Status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Prevent admin from banning themselves
    if (userId === req.user.id && status === 'banned') {
      return res.status(400).json({ 
        message: 'You cannot ban yourself. Please ask another admin to perform this action if needed.' 
      });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status;
    await user.save();

    res.json({ message: 'User status updated successfully', user });
  } catch (err) {
    console.error('Error in updateUserStatus:', err);
    return res.status(500).json({
      error: 'Failed to update user status. Please try again.'
    });
  }
};

// Job Management
exports.getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['fullName', 'email']
      }]
    });

    res.json({
      jobs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error in getAllJobs:', err);
    return res.status(500).json({
      error: 'Failed to fetch jobs. Please try again.'
    });
  }
};

// Update Job Status (Admin can change job status)
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.status = status;
    await job.save();

    res.json({ message: 'Job status updated successfully', job });
  } catch (err) {
    console.error('Error in updateJobStatus:', err);
    return res.status(500).json({
      error: 'Failed to update job status. Please try again.'
    });
  }
};

// Delete Job (Admin can delete any job)
exports.deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    await job.destroy();

    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Error in deleteJob:', err);
    return res.status(500).json({
      error: 'Failed to delete job. Please try again.'
    });
  }
};

// Event Management
exports.getAllEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;

    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['fullName', 'email']
      }]
    });

    res.json({
      events,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error in getAllEvents:', err);
    return res.status(500).json({
      error: 'Failed to fetch events. Please try again.'
    });
  }
};

// Update Event Status (Admin can change event status)
exports.updateEventStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = status;
    await event.save();

    res.json({ message: 'Event status updated successfully', event });
  } catch (err) {
    console.error('Error in updateEventStatus:', err);
    return res.status(500).json({
      error: 'Failed to update event status. Please try again.'
    });
  }
};

// Delete Event (Admin can delete any event)
exports.deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await event.destroy();

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error in deleteEvent:', err);
    return res.status(500).json({
      error: 'Failed to delete event. Please try again.'
    });
  }
};

// Get Pending Approvals (Jobs, Events, Internships, and ROAC Prime Content)
exports.getPendingApprovals = async (req, res, next) => {
  try {
    const { HubContent } = require('../models');
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    let pendingJobs = [];
    let pendingEvents = [];
    let pendingInternships = [];
    let pendingROACPrime = [];

    if (!type || type === 'jobs') {
      const jobs = await Job.findAll({
        where: { approvalStatus: 'pending' },
        include: [{
          model: User,
          as: 'recruiter',
          attributes: ['fullName', 'email']
        }],
        order: [['createdAt', 'DESC']],
        limit: type === 'jobs' ? parseInt(limit) : 10,
        offset: type === 'jobs' ? parseInt(offset) : 0
      });
      pendingJobs = jobs;
    }

    if (!type || type === 'events') {
      const events = await Event.findAll({
        where: { approvalStatus: 'pending' },
        include: [{
          model: User,
          as: 'organizer',
          attributes: ['fullName', 'email']
        }],
        order: [['createdAt', 'DESC']],
        limit: type === 'events' ? parseInt(limit) : 10,
        offset: type === 'events' ? parseInt(offset) : 0
      });
      pendingEvents = events;
    }

    if (!type || type === 'internships') {
      const internships = await HubContent.findAll({
        where: { 
          approvalStatus: 'pending',
          contentType: 'internship'
        },
        include: [{
          model: User,
          as: 'author',
          attributes: ['fullName', 'email']
        }],
        order: [['createdAt', 'DESC']],
        limit: type === 'internships' ? parseInt(limit) : 10,
        offset: type === 'internships' ? parseInt(offset) : 0
      });
      pendingInternships = internships;
    }

    if (!type || type === 'roac-prime') {
      const roacPrime = await HubContent.findAll({
        where: { 
          approvalStatus: 'pending',
          [Op.or]: [
            {
              contentType: { [Op.in]: ['job', 'opportunity'] },
              organizationId: { [Op.ne]: null } // ROAC Prime content has organizationId
            },
            {
              title: 'ROAC Talent Prime Hub',
              contentType: 'opportunity' // ROAC Prime Hub feature
            }
          ]
        },
        include: [{
          model: User,
          as: 'author',
          attributes: ['fullName', 'email']
        }],
        order: [['createdAt', 'DESC']],
        limit: type === 'roac-prime' ? parseInt(limit) : 10,
        offset: type === 'roac-prime' ? parseInt(offset) : 0
      });
      pendingROACPrime = roacPrime;
    }

    res.json({
      pendingJobs,
      pendingEvents,
      pendingInternships,
      pendingROACPrime,
      totalPending: pendingJobs.length + pendingEvents.length + pendingInternships.length + pendingROACPrime.length
    });
  } catch (err) {
    console.error('Error in getPendingApprovals:', err);
    return res.status(500).json({
      error: 'Failed to fetch pending approvals. Please try again.'
    });
  }
};

// Approve/Reject Job
exports.approveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const job = await Job.findByPk(jobId, {
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['fullName', 'email']
      }]
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (action === 'approve') {
      job.approvalStatus = 'approved';
      job.approvedBy = req.user.id;
      job.approvedAt = new Date();
      job.rejectionReason = null;
    } else if (action === 'reject') {
      job.approvalStatus = 'rejected';
      job.approvedBy = req.user.id;
      job.approvedAt = new Date();
      job.rejectionReason = rejectionReason || 'No reason provided';
      
      // Handle existing applications when job is rejected
      await handleJobRejectionApplications(job.id, rejectionReason);
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    await job.save();

    // Send notification to recruiter
    try {
      const notificationService = getNotificationService();
      await notificationService.notifyJobApproval(
        job.createdBy,
        job.title,
        action,
        rejectionReason,
        job.id
      );
    } catch (notifError) {
      console.error('Failed to send job approval notification:', notifError);
      // Don't fail the approval if notification fails
    }

    res.json({ 
      message: `Job ${action}d successfully`,
      job: {
        id: job.id,
        title: job.title,
        approvalStatus: job.approvalStatus,
        recruiter: job.recruiter
      }
    });
  } catch (err) {
    console.error('Error in approveJob:', err);
    return res.status(500).json({
      error: 'Failed to process job approval. Please try again.'
    });
  }
};

// Approve/Reject Event
exports.approveEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const event = await Event.findByPk(eventId, {
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['fullName', 'email']
      }]
    });

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (action === 'approve') {
      event.approvalStatus = 'approved';
      event.approvedBy = req.user.id;
      event.approvedAt = new Date();
      event.rejectionReason = null;
    } else if (action === 'reject') {
      event.approvalStatus = 'rejected';
      event.approvedBy = req.user.id;
      event.approvedAt = new Date();
      event.rejectionReason = rejectionReason || 'No reason provided';
      
      // Handle existing registrations when event is rejected
      await handleEventRejectionRegistrations(event.id, rejectionReason);
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    await event.save();

    // Send notification to organizer
    try {
      const notificationService = getNotificationService();
      await notificationService.notifyEventApproval(
        event.createdBy,
        event.title,
        action,
        rejectionReason,
        event.id
      );
    } catch (notifError) {
      console.error('Failed to send event approval notification:', notifError);
      // Don't fail the approval if notification fails
    }

    res.json({ 
      message: `Event ${action}d successfully`,
      event: {
        id: event.id,
        title: event.title,
        approvalStatus: event.approvalStatus,
        organizer: event.organizer
      }
    });
  } catch (err) {
    console.error('Error in approveEvent:', err);
    return res.status(500).json({
      error: 'Failed to process event approval. Please try again.'
    });
  }
};

// Approve/Reject Internship
exports.approveInternship = async (req, res, next) => {
  try {
    const { HubContent } = require('../models');
    const { internshipId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const internship = await HubContent.findByPk(internshipId, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['fullName', 'email']
      }]
    });

    if (!internship) return res.status(404).json({ message: 'Internship not found' });

    if (action === 'approve') {
      internship.approvalStatus = 'approved';
      internship.approvedBy = req.user.id;
      internship.approvedAt = new Date();
      internship.rejectionReason = null;
      internship.status = 'published'; // Auto-publish when approved
    } else if (action === 'reject') {
      internship.approvalStatus = 'rejected';
      internship.approvedBy = req.user.id;
      internship.approvedAt = new Date();
      internship.rejectionReason = rejectionReason || 'No reason provided';
      
      // Handle existing applications when internship is rejected
      await handleInternshipRejectionApplications(internship.id, rejectionReason);
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    await internship.save();

    // Send notification to creator
    try {
      const notificationService = getNotificationService();
      await notificationService.notifyInternshipApproval(
        internship.createdBy,
        internship.title,
        action,
        rejectionReason,
        internship.id
      );
    } catch (notifError) {
      console.error('Failed to send internship approval notification:', notifError);
      // Don't fail the approval if notification fails
    }

    res.json({ 
      message: `Internship ${action}d successfully`,
      internship: {
        id: internship.id,
        title: internship.title,
        approvalStatus: internship.approvalStatus,
        author: internship.author
      }
    });
  } catch (err) {
    console.error('Error in approveInternship:', err);
    return res.status(500).json({
      error: 'Failed to process internship approval. Please try again.'
    });
  }
};

// Approve/Reject ROAC Prime Content
exports.approveROACPrime = async (req, res, next) => {
  try {
    const { HubContent } = require('../models');
    const { contentId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const content = await HubContent.findByPk(contentId, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['fullName', 'email']
      }]
    });

    if (!content) return res.status(404).json({ message: 'ROAC Prime content not found' });

    if (action === 'approve') {
      content.approvalStatus = 'approved';
      content.approvedBy = req.user.id;
      content.approvedAt = new Date();
      content.rejectionReason = null;
      content.status = 'published'; // Auto-publish when approved
    } else if (action === 'reject') {
      content.approvalStatus = 'rejected';
      content.approvedBy = req.user.id;
      content.approvedAt = new Date();
      content.rejectionReason = rejectionReason || 'No reason provided';
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    await content.save();

    // Send notification to creator
    try {
      const notificationService = getNotificationService();
      await notificationService.notifyROACPrimeApproval(
        content.createdBy,
        content.title,
        action,
        rejectionReason,
        content.id
      );
    } catch (notifError) {
      console.error('Failed to send ROAC Prime approval notification:', notifError);
      // Don't fail the approval if notification fails
    }

    res.json({ 
      message: `ROAC Prime content ${action}d successfully`,
      content: {
        id: content.id,
        title: content.title,
        approvalStatus: content.approvalStatus,
        author: content.author
      }
    });
  } catch (err) {
    console.error('Error in approveROACPrime:', err);
    return res.status(500).json({
      error: 'Failed to process ROAC Prime content approval. Please try again.'
    });
  }
};

// Application Management
exports.getAllApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;

    const { count, rows: applications } = await JobApplication.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email'],
          where: search ? {
            [Op.or]: [
              { fullName: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } }
            ]
          } : {}
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'slug']
        }
      ]
    });

    res.json({
      applications,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error in getAllApplications:', err);
    return res.status(500).json({
      error: 'Failed to fetch applications. Please try again.'
    });
  }
};

// Analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    // User growth over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.findAll({
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      attributes: [
        [User.sequelize.fn('DATE_TRUNC', 'month', User.sequelize.col('createdAt')), 'month'],
        [User.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [User.sequelize.fn('DATE_TRUNC', 'month', User.sequelize.col('createdAt'))],
      order: [[User.sequelize.fn('DATE_TRUNC', 'month', User.sequelize.col('createdAt')), 'ASC']]
    });

    // Job application success rate
    const applicationStats = await JobApplication.findAll({
      attributes: [
        'status',
        [JobApplication.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status']
    });

    res.json({
      userGrowth,
      applicationStats
    });
  } catch (err) {
    console.error('Error in getAnalytics:', err);
    return res.status(500).json({
      error: 'Failed to fetch analytics. Please try again.'
    });
  }
};

// Get Platform Settings
exports.getPlatformSettings = async (req, res, next) => {
  try {
    // For now, we'll store platform settings in the admin user's profile
    // In a real app, you might want a dedicated PlatformSettings model
    const adminUser = await User.findByPk(req.user.id);
    
    const defaultSettings = {
      branding: {
        platformName: "The ROAC",
        tagline: "Rise of All Careers",
        primaryColor: "#FFD600",
        supportEmail: "support@theroac.com",
        supportPhone: "+91-0000000000",
        websiteUrl: "https://theroac.com",
        helpCenterUrl: "https://theroac.com/help"
      },
      rules: {
        autoApproveRecruiters: false,
        autoPublishJobs: false,
        autoApproveEvents: false,
        requireCompleteProfileToApply: true
      }
    };

    // Get settings from user's metadata or use defaults
    const settings = adminUser?.metadata?.platformSettings || defaultSettings;

    res.json({ settings });
  } catch (err) {
    console.error('Error in getPlatformSettings:', err);
    return res.status(500).json({
      error: 'Failed to fetch platform settings. Please try again.'
    });
  }
};

// Update Platform Settings
exports.updatePlatformSettings = async (req, res, next) => {
  try {
    const { branding, rules } = req.body;
    
    const adminUser = await User.findByPk(req.user.id);
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Update the admin user's metadata with platform settings
    const currentMetadata = adminUser.metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      platformSettings: {
        branding: branding || currentMetadata.platformSettings?.branding,
        rules: rules || currentMetadata.platformSettings?.rules
      }
    };

    adminUser.metadata = updatedMetadata;
    await adminUser.save();

    res.json({ 
      message: 'Platform settings updated successfully',
      settings: updatedMetadata.platformSettings
    });
  } catch (err) {
    console.error('Error in updatePlatformSettings:', err);
    return res.status(500).json({
      error: 'Failed to update platform settings. Please try again.'
    });
  }
};

// Get Admin Notifications
exports.getAdminNotifications = async (req, res, next) => {
  try {
    const { Notification } = require('../models');
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const whereClause = {
      userId: req.user.id
    };
    
    if (unreadOnly === 'true') {
      whereClause.read = false;
    }

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    // Get counts for different notification types
    const { HubContent } = require('../models');
    const [
      totalUnread,
      pendingJobs,
      pendingEvents,
      pendingHubContent
    ] = await Promise.all([
      Notification.count({ where: { userId: req.user.id, read: false } }),
      Job.count({ where: { approvalStatus: 'pending' } }),
      Event.count({ where: { approvalStatus: 'pending' } }),
      HubContent.count({ where: { approvalStatus: 'pending' } })
    ]);

    const pendingApprovalsCount = pendingJobs + pendingEvents + pendingHubContent;

    res.json({
      notifications: notifications.rows,
      pagination: {
        total: notifications.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(notifications.count / parseInt(limit))
      },
      counts: {
        totalUnread,
        pendingApprovals: pendingApprovalsCount
      }
    });
  } catch (err) {
    console.error('Error in getAdminNotifications:', err);
    return res.status(500).json({
      error: 'Failed to fetch notifications. Please try again.'
    });
  }
};

// Mark Notification as Read
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { Notification } = require('../models');
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Error in markNotificationAsRead:', err);
    return res.status(500).json({
      error: 'Failed to mark notification as read. Please try again.'
    });
  }
};

// Mark all admin notifications as read
exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const { Notification } = require('../models');

    await Notification.update(
      { 
        read: true,
        readAt: new Date()
      },
      {
        where: { 
          userId: req.user.id,
          read: false
        }
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error in markAllNotificationsAsRead:', err);
    return res.status(500).json({
      error: 'Failed to mark all notifications as read. Please try again.'
    });
  }
};

// Get Rejected Items (for admin analytics and recruiter resubmission)
exports.getRejectedItems = async (req, res, next) => {
  try {
    const { HubContent } = require('../models');
    const { page = 1, limit = 20, type, userId } = req.query;
    const offset = (page - 1) * limit;

    let rejectedJobs = [];
    let rejectedEvents = [];
    let rejectedInternships = [];
    let rejectedROACPrime = [];

    const whereClause = { 
      approvalStatus: 'rejected'
    };

    // If userId is provided, filter by creator (for recruiter dashboard)
    if (userId) {
      whereClause.createdBy = userId;
    }

    if (!type || type === 'jobs') {
      const jobs = await Job.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'recruiter',
          attributes: ['fullName', 'email']
        }],
        order: [['updatedAt', 'DESC']],
        limit: type === 'jobs' ? parseInt(limit) : 10,
        offset: type === 'jobs' ? parseInt(offset) : 0
      });
      rejectedJobs = jobs;
    }

    if (!type || type === 'events') {
      const events = await Event.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'organizer',
          attributes: ['fullName', 'email']
        }],
        order: [['updatedAt', 'DESC']],
        limit: type === 'events' ? parseInt(limit) : 10,
        offset: type === 'events' ? parseInt(offset) : 0
      });
      rejectedEvents = events;
    }

    if (!type || type === 'internships') {
      const internships = await HubContent.findAll({
        where: { 
          ...whereClause,
          contentType: 'internship'
        },
        include: [{
          model: User,
          as: 'author',
          attributes: ['fullName', 'email']
        }],
        order: [['updatedAt', 'DESC']],
        limit: type === 'internships' ? parseInt(limit) : 10,
        offset: type === 'internships' ? parseInt(offset) : 0
      });
      rejectedInternships = internships;
    }

    if (!type || type === 'roac-prime') {
      const roacPrime = await HubContent.findAll({
        where: { 
          ...whereClause,
          [Op.or]: [
            {
              contentType: { [Op.in]: ['job', 'opportunity'] },
              organizationId: { [Op.ne]: null }
            },
            {
              title: 'ROAC Talent Prime Hub',
              contentType: 'opportunity'
            }
          ]
        },
        include: [{
          model: User,
          as: 'author',
          attributes: ['fullName', 'email']
        }],
        order: [['updatedAt', 'DESC']],
        limit: type === 'roac-prime' ? parseInt(limit) : 10,
        offset: type === 'roac-prime' ? parseInt(offset) : 0
      });
      rejectedROACPrime = roacPrime;
    }

    res.json({
      rejectedJobs,
      rejectedEvents,
      rejectedInternships,
      rejectedROACPrime,
      totalRejected: rejectedJobs.length + rejectedEvents.length + rejectedInternships.length + rejectedROACPrime.length
    });
  } catch (err) {
    console.error('Error in getRejectedItems:', err);
    return res.status(500).json({
      error: 'Failed to fetch rejected items. Please try again.'
    });
  }
};

// Allow Resubmission (Reset approval status to pending)
exports.allowResubmission = async (req, res, next) => {
  try {
    const { type, itemId } = req.params;
    const { clearRejectionReason = true } = req.body;

    let item;
    let itemName;

    switch (type) {
      case 'job':
        item = await Job.findByPk(itemId);
        itemName = 'Job';
        break;
      case 'event':
        item = await Event.findByPk(itemId);
        itemName = 'Event';
        break;
      case 'internship':
      case 'roac-prime':
        const { HubContent } = require('../models');
        item = await HubContent.findByPk(itemId);
        itemName = type === 'internship' ? 'Internship' : 'ROAC Prime Content';
        break;
      default:
        return res.status(400).json({ message: 'Invalid item type' });
    }

    if (!item) {
      return res.status(404).json({ message: `${itemName} not found` });
    }

    if (item.approvalStatus !== 'rejected') {
      return res.status(400).json({ message: `${itemName} is not in rejected status` });
    }

    // Reset approval status
    item.approvalStatus = 'pending';
    item.approvedBy = null;
    item.approvedAt = null;
    
    // Keep rejection reason for tracking resubmissions, but only clear if explicitly requested
    if (clearRejectionReason) {
      item.rejectionReason = null;
    }

    await item.save();

    // Send notification to creator about resubmission opportunity
    try {
      const notificationService = getNotificationService();
      await notificationService.createNotification(
        item.createdBy,
        'resubmission_allowed',
        'Resubmission Allowed',
        `Your ${itemName.toLowerCase()} "${item.title}" has been reset to pending status. You can now edit and resubmit it for approval.`,
        { 
          itemId: item.id,
          itemType: type,
          itemTitle: item.title
        },
        '/recruiter-dashboard'
      );
    } catch (notifError) {
      console.error('Failed to send resubmission notification:', notifError);
    }

    res.json({ 
      message: `${itemName} has been reset for resubmission`,
      item: {
        id: item.id,
        title: item.title,
        approvalStatus: item.approvalStatus
      }
    });
  } catch (err) {
    console.error('Error in allowResubmission:', err);
    return res.status(500).json({
      error: 'Failed to allow resubmission. Please try again.'
    });
  }
};

// Handle Banned User Contact (No authentication required)
exports.handleBannedUserContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: 'Name, email, and message are required' 
      });
    }

    // In a real application, you would:
    // 1. Send email to admin team
    // 2. Store the message in database
    // 3. Create a support ticket
    
    // For now, we'll just log it and return success
    console.log('Banned User Contact Request:', {
      name,
      email,
      message,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement email sending to admin team
    // await emailService.sendBannedUserContact({
    //   name,
    //   email,
    //   message,
    //   adminEmail: 'admin@theroac.com'
    // });

    res.json({ 
      message: 'Your message has been sent to the admin team. We will review your case and get back to you soon.' 
    });
  } catch (err) {
    console.error('Error in handleBannedUserContact:', err);
    return res.status(500).json({
      error: 'Failed to send message. Please try again.'
    });
  }
};

module.exports = exports;