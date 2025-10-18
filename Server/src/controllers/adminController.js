const { User, Job, Event, JobApplication, EventRegistration } = require('../models');
const { Op } = require('sequelize');

// Dashboard Overview
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalJobs,
      activeJobs,
      totalEvents,
      totalApplications,
      pendingUsers
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'candidate' } }),
      User.count({ where: { role: 'recruiter' } }),
      Job.count(),
      Job.count({ where: { status: 'open' } }),
      Event.count(),
      JobApplication.count(),
      User.count({ where: { status: 'inactive' } })
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
        totalApplications,
        pendingUsers
      },
      growth: {
        newUsers,
        newJobs,
        newEvents,
        newApplications
      }
    });
  } catch (err) {
    next(err);
  }
};

// User Management
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
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
    next(err);
  }
};

// Update User Status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status;
    await user.save();

    res.json({ message: 'User status updated successfully', user });
  } catch (err) {
    next(err);
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
    next(err);
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
    next(err);
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
    next(err);
  }
};

module.exports = exports;