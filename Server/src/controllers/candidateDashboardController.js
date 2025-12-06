const { User, Job, JobApplication, Interview, SavedJob, ProfileView, HubContent, HubContentApplication } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get enhanced candidate stats
exports.getCandidateStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all applications
    const [jobApplications, hubApplications] = await Promise.all([
      JobApplication.findAll({
        where: { userId },
        include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'companyName', 'companyLogo'] }]
      }),
      HubContentApplication.findAll({
        where: { userId },
        include: [{ model: HubContent, as: 'hubContent', attributes: ['id', 'title', 'companyName'] }]
      })
    ]);

    const totalApplications = jobApplications.length + hubApplications.length;
    const applicationsThisMonth = jobApplications.filter(app => 
      new Date(app.createdAt) >= oneMonthAgo
    ).length + hubApplications.filter(app => 
      new Date(app.createdAt) >= oneMonthAgo
    ).length;

    // Status counts
    const statusCounts = jobApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    // Get available jobs
    const availableJobs = await Job.count({
      where: { status: 'open' }
    });

    const newJobsThisWeek = await Job.count({
      where: {
        status: 'open',
        createdAt: { [Op.gte]: oneWeekAgo }
      }
    });

    // Get profile views
    const profileViews = await ProfileView.count({
      where: { profileUserId: userId }
    });

    const profileViewsThisWeek = await ProfileView.count({
      where: {
        profileUserId: userId,
        createdAt: { [Op.gte]: oneWeekAgo }
      }
    });

    // Get upcoming interviews
    const upcomingInterviews = await Interview.count({
      where: {
        candidateId: userId,
        scheduledAt: { [Op.gte]: now },
        status: { [Op.in]: ['scheduled', 'rescheduled'] }
      }
    });

    // Get saved jobs count
    const savedJobsCount = await SavedJob.count({
      where: { userId }
    });

    // Recent applications with details
    const recentApplications = jobApplications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(app => ({
        id: app.id,
        jobTitle: app.job?.title || 'Unknown',
        companyName: app.job?.companyName || 'Unknown',
        companyLogo: app.job?.companyLogo,
        status: app.status,
        appliedAt: app.createdAt
      }));

    // Application success rate
    const acceptedCount = statusCounts.accepted || statusCounts.hired || 0;
    const successRate = totalApplications > 0 
      ? Math.round((acceptedCount / totalApplications) * 100) 
      : 0;

    // Response rate (applications that got any response)
    const respondedCount = Object.keys(statusCounts).reduce((sum, status) => {
      if (status !== 'pending' && status !== 'applied') {
        return sum + statusCounts[status];
      }
      return sum;
    }, 0);
    const responseRate = totalApplications > 0 
      ? Math.round((respondedCount / totalApplications) * 100) 
      : 0;

    res.json({
      totalApplications,
      applicationsThisMonth,
      availableJobs,
      newJobsThisWeek,
      profileViews,
      profileViewsThisWeek,
      upcomingInterviews,
      savedJobsCount,
      statusCounts,
      recentApplications,
      successRate,
      responseRate
    });
  } catch (error) {
    console.error('Get candidate stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch candidate stats' });
  }
};

// Get job recommendations
exports.getJobRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get user profile
    const user = await User.findByPk(userId);
    const userSkills = user.skills || [];
    const userLocation = user.location || '';

    // Get jobs user hasn't applied to
    const appliedJobIds = await JobApplication.findAll({
      where: { userId },
      attributes: ['jobId']
    }).then(apps => apps.map(app => app.jobId));

    // Find matching jobs
    const jobs = await Job.findAll({
      where: {
        status: 'open',
        id: { [Op.notIn]: appliedJobIds }
      },
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    // Calculate match score for each job
    const recommendations = jobs.map(job => {
      let matchScore = 0;
      const jobSkills = job.skills || [];

      // Skill matching (60% weight)
      const matchingSkills = jobSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      const skillMatch = jobSkills.length > 0 
        ? (matchingSkills.length / jobSkills.length) * 60 
        : 30;
      matchScore += skillMatch;

      // Location matching (20% weight)
      if (userLocation && job.location) {
        const locationMatch = job.location.toLowerCase().includes(userLocation.toLowerCase()) ||
                             userLocation.toLowerCase().includes(job.location.toLowerCase());
        if (locationMatch) matchScore += 20;
      } else if (job.locationType === 'remote') {
        matchScore += 15;
      }

      // Recency (20% weight)
      const daysSincePosted = Math.floor((new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.max(0, 20 - daysSincePosted);
      matchScore += recencyScore;

      return {
        ...job.toJSON(),
        matchScore: Math.round(matchScore),
        matchingSkills
      };
    });

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ recommendations });
  } catch (error) {
    console.error('Get job recommendations error:', error);
    return res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

// Get application analytics
exports.getApplicationAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    const daysAgo = parseInt(period);
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Get applications in period
    const applications = await JobApplication.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: startDate }
      },
      include: [{ model: Job, as: 'job' }],
      order: [['createdAt', 'ASC']]
    });

    // Group by date
    const applicationsByDate = {};
    applications.forEach(app => {
      const date = new Date(app.createdAt).toISOString().split('T')[0];
      applicationsByDate[date] = (applicationsByDate[date] || 0) + 1;
    });

    // Group by status
    const applicationsByStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    // Top companies applied to
    const companyCounts = applications.reduce((acc, app) => {
      const company = app.job?.companyName || 'Unknown';
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {});

    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    // Average response time
    const responseTimes = applications
      .filter(app => app.status !== 'pending' && app.status !== 'applied')
      .map(app => {
        const applied = new Date(app.createdAt);
        const updated = new Date(app.updatedAt);
        return Math.floor((updated - applied) / (1000 * 60 * 60 * 24)); // days
      });

    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    res.json({
      applicationsByDate,
      applicationsByStatus,
      topCompanies,
      avgResponseTime,
      totalApplications: applications.length
    });
  } catch (error) {
    console.error('Get application analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

module.exports = exports;
