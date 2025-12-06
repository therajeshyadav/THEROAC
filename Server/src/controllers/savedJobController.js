const { SavedJob, Job, HubContent } = require('../models');
const { Op } = require('sequelize');

// Save/Unsave a job
exports.toggleSaveJob = async (req, res) => {
  try {
    const { jobId, jobType = 'job', collection = 'default' } = req.body;
    const userId = req.user.id;

    // Check if already saved
    const existing = await SavedJob.findOne({
      where: { userId, jobId, jobType }
    });

    if (existing) {
      // Unsave
      await existing.destroy();
      return res.json({ 
        message: 'Job removed from saved', 
        isSaved: false 
      });
    } else {
      // Save
      const saved = await SavedJob.create({
        userId,
        jobId,
        jobType,
        collection
      });
      return res.json({ 
        message: 'Job saved successfully', 
        isSaved: true,
        savedJob: saved
      });
    }
  } catch (error) {
    console.error('Toggle save job error:', error);
    return res.status(500).json({ error: 'Failed to save/unsave job' });
  }
};

// Get all saved jobs
exports.getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { collection } = req.query;

    const where = { userId };
    if (collection) where.collection = collection;

    const savedJobs = await SavedJob.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    // Fetch actual job details
    const jobIds = savedJobs.filter(s => s.jobType === 'job').map(s => s.jobId);
    const internshipIds = savedJobs.filter(s => s.jobType === 'internship').map(s => s.jobId);

    const [jobs, internships] = await Promise.all([
      jobIds.length > 0 ? Job.findAll({ where: { id: { [Op.in]: jobIds } } }) : [],
      internshipIds.length > 0 ? HubContent.findAll({ where: { id: { [Op.in]: internshipIds } } }) : []
    ]);

    // Merge saved data with job details
    const result = savedJobs.map(saved => {
      const jobData = saved.jobType === 'job' 
        ? jobs.find(j => j.id === saved.jobId)
        : internships.find(i => i.id === saved.jobId);
      
      return {
        ...saved.toJSON(),
        jobDetails: jobData || null
      };
    });

    res.json({ savedJobs: result });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    return res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
};

// Check if job is saved
exports.checkSavedStatus = async (req, res) => {
  try {
    const { jobId, jobType = 'job' } = req.params;
    const userId = req.user.id;

    const saved = await SavedJob.findOne({
      where: { userId, jobId, jobType }
    });

    res.json({ isSaved: !!saved });
  } catch (error) {
    console.error('Check saved status error:', error);
    return res.status(500).json({ error: 'Failed to check saved status' });
  }
};

// Update saved job collection/notes
exports.updateSavedJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { collection, notes } = req.body;
    const userId = req.user.id;

    const savedJob = await SavedJob.findOne({
      where: { id, userId }
    });

    if (!savedJob) {
      return res.status(404).json({ error: 'Saved job not found' });
    }

    if (collection !== undefined) savedJob.collection = collection;
    if (notes !== undefined) savedJob.notes = notes;
    
    await savedJob.save();

    res.json({ message: 'Saved job updated', savedJob });
  } catch (error) {
    console.error('Update saved job error:', error);
    return res.status(500).json({ error: 'Failed to update saved job' });
  }
};

// Get collections
exports.getCollections = async (req, res) => {
  try {
    const userId = req.user.id;

    const collections = await SavedJob.findAll({
      where: { userId },
      attributes: ['collection'],
      group: ['collection']
    });

    const collectionNames = collections.map(c => c.collection);

    res.json({ collections: collectionNames });
  } catch (error) {
    console.error('Get collections error:', error);
    return res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

module.exports = exports;
