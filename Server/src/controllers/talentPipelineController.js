const TalentPipeline = require('../models/TalentPipeline');
const User = require('../models/user');
const JobApplication = require('../models/jobApplication');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

// Add candidate to talent pipeline
exports.addToTalentPipeline = async (req, res) => {
  try {
    const { candidateId, stage, source, sourceId, skills, experience, desiredRole, expectedSalary, availability, notes, tags } = req.body;
    const organizationId = req.user.organizationId || req.user.currentOrganizationId;
    const addedBy = req.user.id;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required. Please set up your organization first.' });
    }

    if (!candidateId) {
      return res.status(400).json({ message: 'Candidate ID is required' });
    }

    // Check if candidate exists
    const candidate = await User.findByPk(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if already in pipeline
    const existing = await TalentPipeline.findOne({
      where: { candidateId, organizationId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Candidate already in talent pipeline' });
    }

    const pipelineEntry = await TalentPipeline.create({
      candidateId,
      organizationId,
      addedBy,
      stage: stage || 'prospect',
      source,
      sourceId,
      skills,
      experience,
      desiredRole,
      expectedSalary,
      availability,
      notes,
      tags
    });

    const result = await TalentPipeline.findByPk(pipelineEntry.id, {
      include: [{
        model: User,
        as: 'candidate',
        attributes: ['id', 'fullName', 'email', 'phone', 'city', 'state', 'country', 'profilePicture']
      }]
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding to talent pipeline:', error);
    res.status(500).json({ message: 'Failed to add candidate to talent pipeline', error: error.message });
  }
};

// Get all candidates in talent pipeline
exports.getTalentPipeline = async (req, res) => {
  try {
    const organizationId = req.user.organizationId || req.user.currentOrganizationId;
    
    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required. Please set up your organization first.' });
    }

    const { stage, search, skills, page = 1, limit = 20 } = req.query;

    const where = { organizationId };

    if (stage) {
      where.stage = stage;
    }

    if (skills) {
      where.skills = { [Op.contains]: skills.split(',') };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await TalentPipeline.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'candidate',
        attributes: ['id', 'fullName', 'email', 'phone', 'city', 'state', 'country', 'profilePicture', 'bio'],
        where: search ? {
          [Op.or]: [
            { fullName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
          ]
        } : undefined
      }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      candidates: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching talent pipeline:', error);
    res.status(500).json({ message: 'Failed to fetch talent pipeline', error: error.message });
  }
};

// Get single candidate from pipeline
exports.getPipelineCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId || req.user.currentOrganizationId;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    const candidate = await TalentPipeline.findOne({
      where: { id, organizationId },
      include: [{
        model: User,
        as: 'candidate',
        attributes: ['id', 'fullName', 'email', 'phone', 'city', 'state', 'country', 'profilePicture', 'bio']
      }]
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found in pipeline' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Error fetching pipeline candidate:', error);
    res.status(500).json({ message: 'Failed to fetch candidate', error: error.message });
  }
};

// Update pipeline candidate
exports.updatePipelineCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId || req.user.currentOrganizationId;
    const updates = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    const candidate = await TalentPipeline.findOne({
      where: { id, organizationId }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found in pipeline' });
    }

    if (updates.stage) {
      candidate.stage = updates.stage;
    }
    if (updates.notes !== undefined) {
      candidate.notes = updates.notes;
    }
    if (updates.tags) {
      candidate.tags = updates.tags;
    }
    if (updates.skills) {
      candidate.skills = updates.skills;
    }
    if (updates.experience !== undefined) {
      candidate.experience = updates.experience;
    }
    if (updates.desiredRole !== undefined) {
      candidate.desiredRole = updates.desiredRole;
    }
    if (updates.expectedSalary !== undefined) {
      candidate.expectedSalary = updates.expectedSalary;
    }
    if (updates.availability !== undefined) {
      candidate.availability = updates.availability;
    }
    if (updates.lastContactedAt) {
      candidate.lastContactedAt = updates.lastContactedAt;
    }

    await candidate.save();

    const result = await TalentPipeline.findByPk(candidate.id, {
      include: [{
        model: User,
        as: 'candidate',
        attributes: ['id', 'fullName', 'email', 'phone', 'city', 'state', 'country', 'profilePicture', 'bio']
      }]
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating pipeline candidate:', error);
    res.status(500).json({ message: 'Failed to update candidate', error: error.message });
  }
};

// Remove from pipeline
exports.removeFromPipeline = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId || req.user.currentOrganizationId;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    const candidate = await TalentPipeline.findOne({
      where: { id, organizationId }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found in pipeline' });
    }

    await candidate.destroy();

    res.json({ message: 'Candidate removed from pipeline' });
  } catch (error) {
    console.error('Error removing from pipeline:', error);
    res.status(500).json({ message: 'Failed to remove candidate', error: error.message });
  }
};

// Get pipeline statistics
exports.getPipelineStats = async (req, res) => {
  try {
    const organizationId = req.user.organizationId || req.user.currentOrganizationId;
    
    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required. Please set up your organization first.' });
    }

    const totalCandidates = await TalentPipeline.count({ where: { organizationId } });
    
    const byStage = await TalentPipeline.findAll({
      where: { organizationId },
      attributes: [
        'stage',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['stage']
    });

    const stageStats = {
      prospect: 0,
      contacted: 0,
      interested: 0,
      qualified: 0,
      'ready-to-hire': 0
    };

    byStage.forEach(item => {
      stageStats[item.stage] = parseInt(item.get('count'));
    });

    res.json({
      totalCandidates,
      byStage: stageStats
    });
  } catch (error) {
    console.error('Error fetching pipeline stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

// Add from job application
exports.addFromJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { stage, notes, tags } = req.body;
    const organizationId = req.user.organizationId || req.user.currentOrganizationId;
    const addedBy = req.user.id;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required. Please set up your organization first.' });
    }

    const application = await JobApplication.findByPk(applicationId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'phone']
      }]
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const candidateId = application.userId;

    // Check if already in pipeline
    const existing = await TalentPipeline.findOne({
      where: { candidateId, organizationId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Candidate already in talent pipeline' });
    }

    const pipelineEntry = await TalentPipeline.create({
      candidateId,
      organizationId,
      addedBy,
      stage: stage || 'prospect',
      source: 'job-application',
      sourceId: applicationId,
      notes,
      tags
    });

    const result = await TalentPipeline.findByPk(pipelineEntry.id, {
      include: [{
        model: User,
        as: 'candidate',
        attributes: ['id', 'fullName', 'email', 'phone', 'city', 'state', 'country', 'profilePicture']
      }]
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding from job application:', error);
    res.status(500).json({ message: 'Failed to add candidate to talent pipeline', error: error.message });
  }
};
