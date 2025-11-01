const { Job, JobApplication } = require('../models');
const { Op } = require('sequelize');

exports.createJob = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.createdBy = req.user.id;
    
    // Generate slug from title if not provided
    if (!payload.slug && payload.title) {
      payload.slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Map company field to companyName
    if (payload.company && !payload.companyName) {
      payload.companyName = payload.company;
      delete payload.company;
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
  } catch (err) { next(err); }
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
  } catch (err) { next(err); }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Increment view counter
    await job.increment('views');
    res.json(job);
  } catch (err) { next(err); }
};

exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    const { resumeLink, coverLetter } = req.body;
    const existing = await JobApplication.findOne({ where: { jobId, userId } });
    if (existing) return res.status(400).json({ error: 'Already applied' });

    const application = await JobApplication.create({ jobId, userId, resumeLink, coverLetter });
    await Job.increment('applications', { where: { id: jobId } });
    res.status(201).json(application);
  } catch (err) { next(err); }
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
  } catch (err) { next(err); }
};
