const { Job, JobApplication } = require('../models');
const { Op } = require('sequelize');

exports.createJob = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.createdBy = req.user.id;
    
    // Map company field to companyName first
    if (payload.company && !payload.companyName) {
      payload.companyName = payload.company;
      delete payload.company;
    }
    
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
    res.status(201).json(job);
  } catch (err) {
    console.error('Error in createJob:', err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: err.errors[0]?.message || 'Validation error'
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
    const where = { status: 'open' };

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
    const { resumeLink, coverLetter } = req.body;
    
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

    const application = await JobApplication.create({ 
      jobId, 
      userId, 
      resumeLink: resumeLink || '', 
      coverLetter: coverLetter || '',
      status: 'applied'
    });
    
    await Job.increment('applications', { where: { id: jobId } });
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
    
    // First try to find by slug field
    let job = await Job.findOne({
      where: { slug }
    });

    // If not found, search all jobs and match by generated slug
    if (!job) {
      const allJobs = await Job.findAll();
      
      // Find job by comparing generated slug
      for (const j of allJobs) {
        const generatedSlug = `${j.title}-${j.companyName}`
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        if (generatedSlug === slug) {
          job = j;
          break;
        }
      }
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment view counter
    await job.increment('views');
    
    res.json(job);
  } catch (err) {
    console.error('Error fetching job by slug:', err);
    return res.status(500).json({
      error: 'Failed to fetch job. Please try again.'
    });
  }
};
