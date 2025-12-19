const { Job, JobApplication, Event, EventRegistration, User, ProfileView, HubContent, HubContentApplication } = require('../models');
const { Op } = require('sequelize');

exports.getOrganizerStats = async (req, res, next) => {
    try {
        const organizerId = req.user.id;

        // Get total candidates (job applications for organizer's jobs and internships)
        const organizerJobs = await Job.findAll({
            where: { 
                createdBy: organizerId,
                jobType: { [Op.in]: ['full-time', 'part-time', 'internship', 'contract'] }
            },
            attributes: ['id']
        });

        const jobIds = organizerJobs.map(job => job.id);

        const jobCandidatesCount = await JobApplication.count({
            where: { jobId: { [Op.in]: jobIds } }
        });

        // Get total internship candidates
        const organizerInternships = await HubContent.findAll({
            where: { 
                createdBy: organizerId,
                contentType: 'internship'
            },
            attributes: ['id']
        });

        const internshipIds = organizerInternships.map(internship => internship.id);

        const internshipCandidatesCount = await HubContentApplication.count({
            where: { hubContentId: { [Op.in]: internshipIds } }
        });

        // Get total event registrations
        const allOrganizerEvents = await Event.findAll({
            where: { createdBy: organizerId },
            attributes: ['id']
        });

        const allEventIds = allOrganizerEvents.map(event => event.id);

        const eventRegistrationsCount = await EventRegistration.count({
            where: { eventId: { [Op.in]: allEventIds } }
        });

        // Total candidates = job candidates + internship candidates + event registrations
        const totalCandidates = jobCandidatesCount + internshipCandidatesCount + eventRegistrationsCount;

        // Get new candidates this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newJobCandidatesThisWeek = await JobApplication.count({
            where: {
                jobId: { [Op.in]: jobIds },
                createdAt: { [Op.gte]: oneWeekAgo }
            }
        });

        const newInternshipCandidatesThisWeek = await HubContentApplication.count({
            where: {
                hubContentId: { [Op.in]: internshipIds },
                createdAt: { [Op.gte]: oneWeekAgo }
            }
        });

        const newEventRegistrationsThisWeek = await EventRegistration.count({
            where: {
                eventId: { [Op.in]: allEventIds },
                createdAt: { [Op.gte]: oneWeekAgo }
            }
        });

        // Total new candidates this week = job candidates + internship candidates + event registrations
        const newCandidatesThisWeek = newJobCandidatesThisWeek + newInternshipCandidatesThisWeek + newEventRegistrationsThisWeek;

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

        // Get active opportunities (jobs and internships) - only approved ones
        const activeJobs = await Job.count({
            where: {
                createdBy: organizerId,
                status: 'open',
                approvalStatus: 'approved',
                jobType: { [Op.in]: ['full-time', 'part-time', 'internship', 'contract'] }
            }
        });

        // Get active internships from HubContent
        const activeInternships = await HubContent.count({
            where: {
                createdBy: organizerId,
                status: 'published',
                approvalStatus: 'approved',
                contentType: 'internship'
            }
        });

        // Total active opportunities = jobs + internships
        const activeOpportunities = activeJobs + activeInternships;

        // Get total job applications for active opportunities (jobs and internships) - only approved ones
        const activeJobIds = await Job.findAll({
            where: {
                createdBy: organizerId,
                status: 'open',
                approvalStatus: 'approved',
                jobType: { [Op.in]: ['full-time', 'part-time', 'internship', 'contract'] }
            },
            attributes: ['id']
        });

        const jobApplicationsCount = await JobApplication.count({
            where: { jobId: { [Op.in]: activeJobIds.map(job => job.id) } }
        });

        // Get active internship IDs and their applications
        const activeInternshipIds = await HubContent.findAll({
            where: {
                createdBy: organizerId,
                status: 'published',
                approvalStatus: 'approved',
                contentType: 'internship'
            },
            attributes: ['id']
        });

        const internshipApplicationsCount = await HubContentApplication.count({
            where: { hubContentId: { [Op.in]: activeInternshipIds.map(internship => internship.id) } }
        });

        // Total applications = job applications + internship applications
        const activeJobApplications = jobApplicationsCount + internshipApplicationsCount;

        const result = {
            totalCandidates,
            newCandidatesThisWeek,
            activeEvents,
            totalEventRegistrations,
            activeOpportunities,
            activeJobApplications
        };
        
        // Debug log to see what's being returned
        console.log(`Dashboard stats for user ${organizerId}:`, {
            ...result,
            breakdown: {
                activeJobs,
                activeInternships,
                jobCandidatesCount,
                internshipCandidatesCount,
                eventRegistrationsCount,
                jobApplicationsCount,
                internshipApplicationsCount
            }
        });
        
        // Set cache headers to ensure fresh data
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.json(result);
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

        let allCandidates = [];

        // 1. Get Job Applications
        const organizerJobs = await Job.findAll({
            where: { 
                createdBy: organizerId,
                jobType: { [Op.in]: ['full-time', 'part-time', 'internship', 'contract'] }
            },
            attributes: ['id', 'title', 'companyName']
        });

        const jobIds = organizerJobs.map(job => job.id);

        if (jobIds.length > 0) {
            const whereClause = { jobId: { [Op.in]: jobIds } };
            if (stage) {
                whereClause.status = stage;
            }

            const jobApplications = await JobApplication.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: [
                            'id', 'fullName', 'email', 'city', 'state', 'country',
                            'resumePath', 'profilePicture', 'phone', 'headline', 
                            'about', 'skills', 'experiences', 'education',
                            'linkedinUrl', 'githubUrl'
                        ],
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
                order: [['createdAt', 'DESC']]
            });

            // Format job applications
            const jobCandidates = jobApplications.map(app => ({
                id: `job_${app.id}`,
                originalId: app.id,
                type: 'job',
                name: app.user?.fullName || 'Unknown',
                email: app.user?.email || 'No email',
                position: app.job?.title || 'Unknown Position',
                department: app.job?.companyName || 'Unknown Company',
                stage: app.status,
                appliedDate: app.createdAt.toISOString().split('T')[0],
                daysAgo: Math.floor((new Date() - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)),
                score: Math.floor(Math.random() * 40) + 60,
                nextAction: getNextAction(app.status),
                skills: app.user?.skills || [],
                resumeLink: app.resumeLink || app.user?.resumePath || null,
                coverLetter: app.coverLetter,
                location: `${app.user?.city || ''}, ${app.user?.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Unknown',
                createdAt: app.createdAt,
                // Additional user details for recruiter
                phone: app.user?.phone || null,
                headline: app.user?.headline || null,
                about: app.user?.about || null,
                experiences: app.user?.experiences || null,
                education: app.user?.education || null,
                profilePicture: app.user?.profilePicture || null,
                linkedinUrl: app.user?.linkedinUrl || null,
                githubUrl: app.user?.githubUrl || null
            }));

            allCandidates = allCandidates.concat(jobCandidates);
        }

        // 2. Get Internship Applications
        const organizerInternships = await HubContent.findAll({
            where: { 
                createdBy: organizerId,
                contentType: 'internship'
            },
            attributes: ['id', 'title', 'companyName']
        });

        const internshipIds = organizerInternships.map(internship => internship.id);

        if (internshipIds.length > 0) {
            const internshipApplications = await HubContentApplication.findAll({
                where: { hubContentId: { [Op.in]: internshipIds } },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: [
                            'id', 'fullName', 'email', 'city', 'state', 'country',
                            'resumePath', 'profilePicture', 'phone', 'headline', 
                            'about', 'skills', 'experiences', 'education',
                            'linkedinUrl', 'githubUrl'
                        ],
                        where: search ? {
                            [Op.or]: [
                                { fullName: { [Op.iLike]: `%${search}%` } },
                                { email: { [Op.iLike]: `%${search}%` } }
                            ]
                        } : {}
                    },
                    {
                        model: HubContent,
                        as: 'hubContent',
                        attributes: ['id', 'title', 'companyName']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Format internship applications
            const internshipCandidates = internshipApplications.map(app => ({
                id: `internship_${app.id}`,
                originalId: app.id,
                type: 'internship',
                name: app.user?.fullName || 'Unknown',
                email: app.user?.email || 'No email',
                position: app.hubContent?.title || 'Unknown Internship',
                department: app.hubContent?.companyName || 'Unknown Company',
                stage: app.status || 'pending',
                appliedDate: app.createdAt.toISOString().split('T')[0],
                daysAgo: Math.floor((new Date() - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)),
                score: Math.floor(Math.random() * 40) + 60,
                nextAction: getNextAction(app.status || 'pending'),
                skills: app.user?.skills || [],
                resumeLink: app.user?.resumePath || null,
                coverLetter: app.notes || '',
                location: `${app.user?.city || ''}, ${app.user?.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Unknown',
                createdAt: app.createdAt,
                // Additional user details for recruiter
                phone: app.user?.phone || null,
                headline: app.user?.headline || null,
                about: app.user?.about || null,
                experiences: app.user?.experiences || null,
                education: app.user?.education || null,
                profilePicture: app.user?.profilePicture || null,
                linkedinUrl: app.user?.linkedinUrl || null,
                githubUrl: app.user?.githubUrl || null
            }));

            allCandidates = allCandidates.concat(internshipCandidates);
        }

        // 3. Get Event Registrations
        const organizerEvents = await Event.findAll({
            where: { createdBy: organizerId },
            attributes: ['id', 'title', 'location']
        });

        const eventIds = organizerEvents.map(event => event.id);

        if (eventIds.length > 0) {
            const eventRegistrations = await EventRegistration.findAll({
                where: { eventId: { [Op.in]: eventIds } },
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
                        model: Event,
                        as: 'event',
                        attributes: ['id', 'title', 'location']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Format event registrations
            const eventCandidates = eventRegistrations.map(reg => ({
                id: `event_${reg.id}`,
                originalId: reg.id,
                type: 'event',
                name: reg.user?.fullName || 'Unknown',
                email: reg.user?.email || 'No email',
                position: reg.event?.title || 'Unknown Event',
                department: reg.event?.location || 'Event Registration',
                stage: reg.status || 'registered',
                appliedDate: reg.createdAt.toISOString().split('T')[0],
                daysAgo: Math.floor((new Date() - new Date(reg.createdAt)) / (1000 * 60 * 60 * 24)),
                score: Math.floor(Math.random() * 40) + 60,
                nextAction: 'Contact',
                skills: [],
                resumeLink: null,
                coverLetter: reg.notes || '',
                location: `${reg.user?.city || ''}, ${reg.user?.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Unknown',
                createdAt: reg.createdAt
            }));

            allCandidates = allCandidates.concat(eventCandidates);
        }

        // Filter by stage if specified
        if (stage && stage !== 'all') {
            allCandidates = allCandidates.filter(candidate => candidate.stage === stage);
        }

        // Sort by creation date (newest first)
        allCandidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Apply pagination
        const total = allCandidates.length;
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedCandidates = allCandidates.slice(startIndex, endIndex);

        res.json({
            candidates: paginatedCandidates,
            total: total,
            totalPages: Math.ceil(total / parseInt(limit)),
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

        // Get organizer's jobs, internships and events
        const organizerJobs = await Job.findAll({
            where: { 
                createdBy: organizerId,
                jobType: { [Op.in]: ['full-time', 'part-time', 'internship', 'contract'] }
            },
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

        // Get available jobs and internships count
        const availableJobs = await Job.count({
            where: { 
                status: 'open',
                jobType: { [Op.in]: ['full-time', 'part-time', 'internship', 'contract'] }
            }
        });

        // Get new jobs this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newJobsThisWeek = await Job.count({
            where: {
                status: 'open',
                createdAt: { [Op.gte]: oneWeekAgo },
                jobType: { [Op.in]: ['full-time', 'part-time', 'internship', 'contract'] }
            }
        });

        // Get upcoming events count
        const upcomingEvents = await Event.count({
            where: {
                status: { [Op.in]: ['upcoming', 'ongoing'] },
                approvalStatus: 'approved',
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

// Get activity heatmap data for recruiter dashboard
exports.getActivityHeatmap = async (req, res, next) => {
    try {
        const recruiterId = req.user.id;
        
        // Get last 7 days of activity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        
        // Fetch all content created in last 7 days
        const [jobs, events] = await Promise.all([
            Job.findAll({
                where: {
                    createdBy: recruiterId,
                    createdAt: { [Op.gte]: sevenDaysAgo },
                    jobType: { [Op.in]: ['full-time', 'part-time', 'internship', 'contract'] }
                },
                attributes: ['createdAt'],
                raw: true
            }),
            Event.findAll({
                where: {
                    createdBy: recruiterId,
                    createdAt: { [Op.gte]: sevenDaysAgo }
                },
                attributes: ['createdAt'],
                raw: true
            })
        ]);
        
        // Combine all activities
        const allActivities = [...jobs, ...events];
        
        // Create heatmap data structure
        // Group by day of week (0-6) and hour (0-23)
        const heatmapData = {};
        
        allActivities.forEach(activity => {
            const date = new Date(activity.createdAt);
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            const hour = date.getHours();
            
            const key = `${dayOfWeek}-${hour}`;
            heatmapData[key] = (heatmapData[key] || 0) + 1;
        });
        
        // Convert to array format for frontend
        // Create 6 time slots from 10:30 to 8:00 (descending order to match frontend labels)
        const timeSlots = ['10:30', '10:00', '09:30', '09:00', '08:30', '08:00'];
        
        const heatmap = [];
        for (let day = 0; day < 7; day++) {
            const dayData = {
                day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
                hours: []
            };
            
            // For each time slot, check activity in that hour range
            timeSlots.forEach((timeSlot) => {
                const hour = parseInt(timeSlot.split(':')[0]); // Extract hour from time string
                const key = `${day}-${hour}`;
                const count = heatmapData[key] || 0;
                
                dayData.hours.push({
                    time: timeSlot,
                    count: count,
                    level: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
                });
            });
            
            heatmap.push(dayData);
        }
        
        return res.status(200).json({
            success: true,
            heatmap: heatmap,
            totalActivities: allActivities.length
        });
        
    } catch (err) {
        console.error('Error in getActivityHeatmap:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch activity heatmap. Please try again.'
        });
    }
};
