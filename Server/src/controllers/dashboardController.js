const { Job, JobApplication, Event, EventRegistration, User, ProfileView } = require('../models');
const { Op } = require('sequelize');

exports.getOrganizerStats = async (req, res, next) => {
    try {
        const organizerId = req.user.id;

        // Get total candidates (job applications for organizer's jobs)
        const organizerJobs = await Job.findAll({
            where: { createdBy: organizerId },
            attributes: ['id']
        });

        const jobIds = organizerJobs.map(job => job.id);

        const totalCandidates = await JobApplication.count({
            where: { jobId: { [Op.in]: jobIds } }
        });

        // Get new candidates this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newCandidatesThisWeek = await JobApplication.count({
            where: {
                jobId: { [Op.in]: jobIds },
                createdAt: { [Op.gte]: oneWeekAgo }
            }
        });

        // Get active events count
        const activeEvents = await Event.count({
            where: {
                createdBy: organizerId,
                status: { [Op.in]: ['upcoming', 'ongoing'] }
            }
        });

        // Get total event registrations
        const organizerEvents = await Event.findAll({
            where: { createdBy: organizerId },
            attributes: ['id']
        });

        const eventIds = organizerEvents.map(event => event.id);

        const totalEventRegistrations = await EventRegistration.count({
            where: { eventId: { [Op.in]: eventIds } }
        });

        // Get active opportunities (jobs)
        const activeOpportunities = await Job.count({
            where: {
                createdBy: organizerId,
                status: 'open'
            }
        });

        // Get total job applications for active opportunities
        const activeJobIds = await Job.findAll({
            where: {
                createdBy: organizerId,
                status: 'open'
            },
            attributes: ['id']
        });

        const activeJobApplications = await JobApplication.count({
            where: { jobId: { [Op.in]: activeJobIds.map(job => job.id) } }
        });

        res.json({
            totalCandidates,
            newCandidatesThisWeek,
            activeEvents,
            totalEventRegistrations,
            activeOpportunities,
            activeJobApplications
        });
    } catch (err) {
        console.error('Error in getOrganizerStats:', err);
        return res.status(500).json({
            error: 'Failed to fetch organizer stats. Please try again.'
        });
    }
};

exports.getCandidates = async (req, res, next) => {
    try {
        const organizerId = req.user.id;
        const { page = 1, limit = 10, search, stage } = req.query;

        // Get organizer's jobs
        const organizerJobs = await Job.findAll({
            where: { createdBy: organizerId },
            attributes: ['id', 'title', 'companyName']
        });

        const jobIds = organizerJobs.map(job => job.id);

        if (jobIds.length === 0) {
            return res.json({ candidates: [], total: 0, totalPages: 0 });
        }

        // Build where clause for applications
        const whereClause = { jobId: { [Op.in]: jobIds } };
        if (stage) {
            whereClause.status = stage;
        }

        // Get applications with user and job details
        const applications = await JobApplication.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'email', 'city', 'state', 'country'],
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
                    attributes: ['id', 'title', 'companyName']
                }
            ],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        // Format the response
        const candidates = applications.rows.map(app => ({
            id: app.id,
            name: app.user?.fullName || 'Unknown',
            email: app.user?.email || 'No email',
            position: app.job?.title || 'Unknown Position',
            department: app.job?.companyName || 'Unknown Company',
            stage: app.status,
            appliedDate: app.createdAt.toISOString().split('T')[0],
            daysAgo: Math.floor((new Date() - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)),
            score: Math.floor(Math.random() * 40) + 60, // Mock score for now
            nextAction: getNextAction(app.status),
            skills: [], // Could be added to user profile later
            resumeLink: app.resumeLink,
            coverLetter: app.coverLetter,
            location: `${app.user?.city || ''}, ${app.user?.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Unknown'
        }));

        res.json({
            candidates,
            total: applications.count,
            totalPages: Math.ceil(applications.count / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (err) {
        console.error('Error in getCandidates:', err);
        return res.status(500).json({
            error: 'Failed to fetch candidates. Please try again.'
        });
    }
};

exports.getAnalytics = async (req, res, next) => {
    try {
        const organizerId = req.user.id;
        const { period = 'year' } = req.query;

        // Get date range based on period
        let startDate = new Date();
        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
            default:
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        // Get organizer's jobs and events
        const organizerJobs = await Job.findAll({
            where: { createdBy: organizerId },
            attributes: ['id']
        });

        const organizerEvents = await Event.findAll({
            where: { createdBy: organizerId },
            attributes: ['id']
        });

        const jobIds = organizerJobs.map(job => job.id);
        const eventIds = organizerEvents.map(event => event.id);

        // Get monthly data for the chart
        const monthlyData = [];
        const currentDate = new Date();

        for (let i = 11; i >= 0; i--) {
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

            const applications = await JobApplication.count({
                where: {
                    jobId: { [Op.in]: jobIds },
                    createdAt: { [Op.between]: [monthStart, monthEnd] }
                }
            });

            const interviews = await JobApplication.count({
                where: {
                    jobId: { [Op.in]: jobIds },
                    status: { [Op.in]: ['interview', 'shortlisted'] },
                    updatedAt: { [Op.between]: [monthStart, monthEnd] }
                }
            });

            monthlyData.push({
                month: monthStart.toLocaleString('default', { month: 'short' }),
                applications,
                interviews
            });
        }

        res.json({ monthlyData });
    } catch (err) {
        console.error('Error in getAnalytics:', err);
        return res.status(500).json({
            error: 'Failed to fetch analytics. Please try again.'
        });
    }
};

exports.getCandidateStats = async (req, res, next) => {
    try {
        const candidateId = req.user.id;

        // Get total applications by the candidate
        const totalApplications = await JobApplication.count({
            where: { userId: candidateId }
        });

        // Get applications this month
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const applicationsThisMonth = await JobApplication.count({
            where: {
                userId: candidateId,
                createdAt: { [Op.gte]: oneMonthAgo }
            }
        });

        // Get applications by status
        const applicationsByStatus = await JobApplication.findAll({
            where: { userId: candidateId },
            attributes: ['status'],
            raw: true
        });

        const statusCounts = applicationsByStatus.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});

        // Get available jobs count
        const availableJobs = await Job.count({
            where: { status: 'open' }
        });

        // Get new jobs this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newJobsThisWeek = await Job.count({
            where: {
                status: 'open',
                createdAt: { [Op.gte]: oneWeekAgo }
            }
        });

        // Get upcoming events count
        const upcomingEvents = await Event.count({
            where: {
                status: { [Op.in]: ['upcoming', 'ongoing'] },
                startDate: { [Op.gte]: new Date() }
            }
        });

        // Get events the candidate is registered for
        const candidateEventRegistrations = await EventRegistration.count({
            where: { userId: candidateId }
        });

        // Get real profile views count from database
        const profileViews = await ProfileView.count({
            where: { profileUserId: candidateId }
        });

        // Get profile views in last 7 days (reuse oneWeekAgo from above)
        const profileViewsThisWeek = await ProfileView.count({
            where: {
                profileUserId: candidateId,
                viewedAt: { [Op.gte]: oneWeekAgo }
            }
        });

        // Get recent applications with job details
        const recentApplications = await JobApplication.findAll({
            where: { userId: candidateId },
            include: [
                {
                    model: Job,
                    as: 'job',
                    attributes: ['id', 'title', 'companyName', 'location', 'salary']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        res.json({
            totalApplications,
            applicationsThisMonth,
            availableJobs,
            newJobsThisWeek,
            upcomingEvents,
            profileViews,
            profileViewsThisWeek,
            statusCounts,
            candidateEventRegistrations,
            recentApplications: recentApplications.map(app => ({
                id: app.id,
                status: app.status,
                appliedDate: app.createdAt,
                job: app.job
            }))
        });
    } catch (err) {
        console.error('Error in getCandidateStats:', err);
        return res.status(500).json({
            error: 'Failed to fetch candidate stats. Please try again.'
        });
    }
};

function getNextAction(status) {
    switch (status) {
        case 'applied':
            return 'Review Application';
        case 'shortlisted':
            return 'Schedule Interview';
        case 'interview':
            return 'Conduct Interview';
        case 'offered':
            return 'Awaiting Response';
        case 'hired':
            return 'Onboarding';
        case 'rejected':
            return 'Closed';
        default:
            return 'Review';
    }
}