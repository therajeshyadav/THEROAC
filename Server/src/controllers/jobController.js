const { Job, JobApplication } = require('../models');

exports.createJob = async (req, res, next) => {
  try {
    const payload = req.body; payload.createdBy = req.user.id;
    const job = await Job.create(payload);
    res.status(201).json(job);
  } catch (err) { next(err); }
};

exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    const { resumeLink, coverLetter } = req.body;
    const existing = await JobApplication.findOne({ where: { jobId, userId }});
    if (existing) return res.status(400).json({ error: 'Already applied' });

    const application = await JobApplication.create({ jobId, userId, resumeLink, coverLetter });
    await Job.increment('applications', { where: { id: jobId }});
    res.status(201).json(application);
  } catch (err) { next(err); }
};
