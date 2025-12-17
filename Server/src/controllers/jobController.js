const { Job, JobApplication, User } = require('../models');
const { Op } = require('sequelize');
const { getNotificationService } = require('../socket');

exports.createJob = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.createdBy = req.user.id;
    payload.approvalStatus = 'pending'; // Set to pending for admin approval
    
    // Add organization context if available
    if (req.currentOrganization) {
      payload.organizationId = req.currentOrganization.id;
      // Auto-populate from organization if not provided
      if (!payload.companyName) payload.companyName = req.currentOrganization.name;
      if (!payload.companyLogo) payload.companyLogo = req.currentOrganization.logo;
    }
    
    // Auto-populate company info from recruiter profile if not provided
    if (req.user.role === 'recruiter') {
      if (!payload.companyName && req.user.companyName) {
        payload.companyName = req.user.companyName;
      }
      if (!payload.companyLogo && req.user.companyLogo) {
        payload.companyLogo = req.user.companyLogo;
      }
      if (!payload.sociallinks && req.user.companySocialLinks) {
        payload.sociallinks = req.user.companySocialLinks;
      }
    }
    
    // Map company field to companyName first
    if (payload.company && !payload.companyName) {
      payload.companyName = payload.company;
      delete payload.company;
    }
    
    // Validate and sanitize salary field
    if (payload.salary) {
      if (typeof payload.salary === 'string') {
        try {
          payload.salary = JSON.parse(payload.salary);
        } catch (e) {
          payload.salary = null;
        }
      }
      // Ensure salary has proper structure
      if (payload.salary && typeof payload.salary === 'object') {
        payload.salary = {
          min: payload.salary.min || '',
          max: payload.salary.max || '',
          currency: payload.salary.currency || 'USD',
          period: payload.salary.period || 'yearly'
        };
      }
    }
    
    // Validate and sanitize JSON fields
    ['perks', 'skills', 'categories', 'media', 'companySocials', 'contactPerson'].forEach(field => {
      if (payload[field] && typeof payload[field] === 'string') {
        try {
          payload[field] = JSON.parse(payload[field]);
        } catch (e) {
          payload[field] = field === 'perks' || field === 'skills' || field === 'categories' || field === 'media' ? [] : null;
        }
      }
    });
    
    // Generate slug from title and company if not provided
    if (!payload.slug && payload.title && payload.companyName) {
      const titleSlug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const companySlug = payload.companyName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      payload.slug = `${titleSlug}-${companySlug}`;
    }
    
    // Handle companyLogo field
    if (payload.companyLogo) {
      // Validate URL format (basic validation)
      try {
        new URL(payload.companyLogo);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid company logo URL format' });
      }
    }
    
    // Convert requirements array to string if needed
    if (Array.isArray(payload.requirements)) {
      payload.requirements = payload.requirements.join('\n');
    }
    
    // Convert benefits array to string if needed
    if (Array.isArray(payload.benefits)) {
      payload.benefits = payload.benefits.join('\n');
    }
    
    const job = await Job.create(payload);
    
    // Create notification for admin about new job pending approval
    try {
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
          'job_pending_approval',
          'New Job Pending Approval',
          `${req.user.fullName || req.user.email} posted a new job "${job.title}" that requires approval.`,
          { 
            jobId: job.id, 
            jobTitle: job.title, 
            recruiterName: req.user.fullName || req.user.email,
            recruiterId: req.user.id
          },
          `/admin-dashboard?tab=approvals`
        );
      }
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
      // Don't fail job creation if notification fails
    }
    
    // Send success response with approval info
    res.status(201).json({
      ...job.toJSON(),
      message: 'Job posted successfully! It will be visible after admin approval.',
      requiresApproval: true
    });
  } catch (err) {
    console.error('Error in createJob:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: err.errors[0]?.message || 'Validation error'
      });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'A job with this slug already exists'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to create job. Please try again.'
    });
  }
};

exports.listJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, jobType, experienceLevel, locationType } = req.query;
    const where = { 
      status: 'open',
      approvalStatus: 'approved' // Only show approved jobs
    };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (jobType) where.jobType = jobType;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (locationType) where.locationType = locationType;

    const jobs = await Job.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      jobs: jobs.rows,
      total: jobs.count,
      totalPages: Math.ceil(jobs.count / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('Error in listJobs:', err);
    return res.status(500).json({
      error: 'Failed to fetch jobs. Please try again.'
    });
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Increment view counter
    await job.increment('views');
    res.json(job);
  } catch (err) {
    console.error('Error in getJob:', err);
    return res.status(500).json({
      error: 'Failed to fetch job details. Please try again.'
    });
  }
};

exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    const { resumeLink, coverLetter, metadata } = req.body;
    
    // Check if job exists first
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if already applied
    const existing = await JobApplication.findOne({ where: { jobId, userId } });
    if (existing) {
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    // Store all candidate data in metadata
    const applicationData = {
      jobId, 
      userId, 
      resumeLink: resumeLink || '', 
      coverLetter: coverLetter || '',
      status: 'applied',
      metadata: metadata || {}
    };

    const application = await JobApplication.create(applicationData);
    
    await Job.increment('applications', { where: { id: jobId } });
    
    // Send notification to recruiter and organization members
    try {
      const { OrganizationMember } = require('../models');
      const notificationService = getNotificationService();
      const candidate = await User.findByPk(userId);
      const candidateName = candidate?.fullName || candidate?.name || 'A candidate';
      
      // Notify job creator
      await notificationService.notifyNewApplication(
        job.createdBy,
        candidateName,
        job.title,
        application.id
      );
      
      // If job belongs to an organization, notify all active members with permission
      if (job.organizationId) {
        const members = await OrganizationMember.findAll({
          where: { 
            organizationId: job.organizationId, 
            status: 'active'
          }
        });
        
        for (const member of members) {
          // Skip the job creator (already notified) and members without permission
          if (member.userId !== job.createdBy && 
              (member.permissions?.canManageApplications || 
               member.permissions?.canRespondToApplications ||
               member.role === 'owner' || 
               member.role === 'admin')) {
            await notificationService.notifyNewApplication(
              member.userId,
              candidateName,
              job.title,
              application.id
            );
          }
        }
      }
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Don't fail the application if notification fails
    }
    
    res.status(201).json(application);
  } catch (err) { 
    console.error('Apply to job error:', err);
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'You have already applied to this job'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to submit application. Please try again.'
    });
  }
};

exports.getUserApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const applications = await JobApplication.findAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'location', 'salary', 'jobType']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ applications });
  } catch (err) {
    console.error('Error in getUserApplications:', err);
    return res.status(500).json({
      error: 'Failed to fetch applications. Please try again.'
    });
  }
};

// Get applications for recruiter's jobs
exports.getRecruiterApplications = async (req, res, next) => {
  try {
    const { User } = require('../models');
    const recruiterId = req.user.id;
    
    // Get all jobs created by this recruiter
    const recruiterJobs = await Job.findAll({
      where: { createdBy: recruiterId },
      attributes: ['id']
    });
    
    const jobIds = recruiterJobs.map(job => job.id);
    
    // Get all applications for these jobs with full candidate details
    const applications = await JobApplication.findAll({
      where: { jobId: { [Op.in]: jobIds } },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'location', 'salary', 'jobType', 'experienceLevel']
        },
        {
          model: User,
          as: 'user',
          attributes: [
            'id', 'fullName', 'email', 'phone', 'headline', 'location',
            'about', 'skills', 'experiences', 'education', 'resumePath',
            'profilePicture', 'linkedinUrl', 'githubUrl'
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ applications });
  } catch (err) {
    console.error('Error in getRecruiterApplications:', err);
    return res.status(500).json({
      error: 'Failed to fetch applications. Please try again.'
    });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const recruiterId = req.user.id;
    
    // Find the application
    const application = await JobApplication.findByPk(applicationId, {
      include: [{
        model: Job,
        as: 'job',
        attributes: ['createdBy']
      }]
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Check if the recruiter owns this job
    if (application.job.createdBy !== recruiterId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update status
    application.status = status;
    await application.save();
    
    // Send notification to candidate
    try {
      const notificationService = getNotificationService();
      const job = await Job.findByPk(application.jobId);
      
      await notificationService.notifyApplicationStatusChange(
        application.userId,
        job.title,
        status,
        application.id
      );
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }
    
    res.json({ message: 'Application status updated', application });
  } catch (err) {
    console.error('Error in updateApplicationStatus:', err);
    return res.status(500).json({
      error: 'Failed to update application status. Please try again.'
    });
  }
};

// Update application notes
exports.updateApplicationNotes = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;
    const recruiterId = req.user.id;
    
    // Find the application
    const application = await JobApplication.findByPk(applicationId, {
      include: [{
        model: Job,
        as: 'job',
        attributes: ['createdBy']
      }]
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Check if the recruiter owns this job
    if (application.job.createdBy !== recruiterId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update notes
    if (notes !== undefined) application.notes = notes;
    await application.save();
    
    res.json({ message: 'Application notes updated', application });
  } catch (err) {
    console.error('Error in updateApplicationNotes:', err);
    return res.status(500).json({
      error: 'Failed to update application notes. Please try again.'
    });
  }
};


// Check if user has applied to a specific job
exports.checkJobApplicationStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const application = await JobApplication.findOne({
      where: {
        userId,
        jobId
      }
    });

    res.json({
      hasApplied: !!application,
      application: application || null
    });
  } catch (err) {
    console.error('Error checking job application status:', err);
    return res.status(500).json({
      error: 'Failed to check application status. Please try again.'
    });
  }
};


// Get job by slug
exports.getJobBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // Try multiple matching strategies
    let job = null;
    
    // Strategy 1: Exact match with DB slug field
    job = await Job.findOne({
      where: { slug }
    });

    // Strategy 2: Match with generated slug (title-company)
    if (!job) {
      const allJobs = await Job.findAll();
      
      for (const j of allJobs) {
        // Generate slug with company name
        const generatedSlug = `${j.title}-${j.companyName}`
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // Also check if DB slug matches (for backward compatibility)
        const dbSlug = j.slug || '';
        
        if (generatedSlug === slug || dbSlug === slug) {
          job = j;
          break;
        }
      }
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment view counter only for candidates (not for recruiters viewing their own jobs)
    if (req.user && req.user.role === 'candidate') {
      await job.increment('views');
    }
    
    res.json(job);
  } catch (err) {
    console.error('Error fetching job by slug:', err);
    return res.status(500).json({
      error: 'Failed to fetch job. Please try again.'
    });
  }
};

// Update job
exports.updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if user is authorized to update
    if (job.createdBy !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }
    
    const payload = { ...req.body };
    
    // Validate and sanitize salary field
    if (payload.salary) {
      if (typeof payload.salary === 'string') {
        try {
          payload.salary = JSON.parse(payload.salary);
        } catch (e) {
          payload.salary = null;
        }
      }
      // Ensure salary has proper structure
      if (payload.salary && typeof payload.salary === 'object') {
        payload.salary = {
          min: payload.salary.min || '',
          max: payload.salary.max || '',
          currency: payload.salary.currency || 'USD',
          period: payload.salary.period || 'yearly'
        };
      }
    }
    
    // Validate and sanitize JSON fields
    ['perks', 'skills', 'categories', 'media', 'companySocials', 'contactPerson'].forEach(field => {
      if (payload[field] && typeof payload[field] === 'string') {
        try {
          payload[field] = JSON.parse(payload[field]);
        } catch (e) {
          payload[field] = field === 'perks' || field === 'skills' || field === 'categories' || field === 'media' ? [] : null;
        }
      }
    });
    
    // Update slug if title or company changed
    if ((payload.title || payload.companyName) && !payload.slug) {
      const titleSlug = (payload.title || job.title)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const companySlug = (payload.companyName || job.companyName)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      payload.slug = `${titleSlug}-${companySlug}`;
    }
    
    await job.update(payload);
    res.json(job);
  } catch (err) {
    console.error('Error in updateJob:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: err.errors[0]?.message || 'Validation error'
      });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'A job with this slug already exists'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to update job. Please try again.'
    });
  }
};

// Delete job
exports.deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if user is authorized to delete
    if (job.createdBy !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }
    
    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Error in deleteJob:', err);
    return res.status(500).json({
      error: 'Failed to delete job. Please try again.'
    });
  }
};

// Get recruiter's own jobs
exports.getMyJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, approvalStatus, showAll = false } = req.query;
    const where = { createdBy: req.user.id };

    if (status) where.status = status;
    
    // By default, only show approved jobs unless explicitly requested otherwise
    if (approvalStatus) {
      where.approvalStatus = approvalStatus;
    } else if (showAll !== 'true') {
      where.approvalStatus = 'approved';
    }

    const jobs = await Job.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      jobs: jobs.rows,
      total: jobs.count,
      totalPages: Math.ceil(jobs.count / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('Error in getMyJobs:', err);
    return res.status(500).json({
      error: 'Failed to fetch your jobs. Please try again.'
    });
  }
};

// Upload image for job
exports.uploadJobImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Generate image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/jobs/${req.file.filename}`;

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading job image:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};
