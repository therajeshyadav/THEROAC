require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const hackathonRoutes = require('./routes/hackathons');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const gmailRoutes = require('./routes/gmailRoutes');
const hubContentRoutes = require('./routes/hubContent');
const bookmarkRoutes = require('./routes/bookmarks');
const likeRoutes = require('./routes/likes');
const profileViewRoutes = require('./routes/profileViews');
const organizationRoutes = require('./routes/organizationRoutes');
const notificationRoutes = require('./routes/notifications');
const candidateDashboardRoutes = require('./routes/candidateDashboard');
const interviewRoutes = require('./routes/interviews');
const savedJobRoutes = require('./routes/savedJobs');
const resumeRoutes = require('./routes/resumes');
const talentPipelineRoutes = require('./routes/talentPipeline');
const errorHandler = require('./middlewares/errorHandler');
const { attachOrganizationContext } = require('./middlewares/organizationMiddleware');

const app = express();
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// routes (auth routes should come first, before authentication middleware)
app.use('/api/auth', authRoutes);

// Attach organization context to authenticated requests (after auth routes)
const { authenticate } = require('./middlewares/auth');

// Public routes (authentication handled per-route inside these routers)
app.use('/api/events', eventRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/jobs', jobRoutes);

// Apply authentication and organization context to protected routes
app.use('/api/users', authenticate, attachOrganizationContext, userRoutes);
app.use('/api/admin', authenticate, attachOrganizationContext, adminRoutes);
app.use('/api/dashboard', authenticate, attachOrganizationContext, dashboardRoutes);
app.use('/api/hub-content', authenticate, attachOrganizationContext, hubContentRoutes);
app.use('/api/gmail', authenticate, attachOrganizationContext, gmailRoutes);
app.use('/api/bookmarks', authenticate, attachOrganizationContext, bookmarkRoutes);
app.use('/api/likes', authenticate, attachOrganizationContext, likeRoutes);
app.use('/api/profile-views', authenticate, attachOrganizationContext, profileViewRoutes);
app.use('/api/organizations', authenticate, attachOrganizationContext, organizationRoutes);
app.use('/api/notifications', authenticate, attachOrganizationContext, notificationRoutes);
app.use('/api/candidate-dashboard', authenticate, attachOrganizationContext, candidateDashboardRoutes);
app.use('/api/interviews', authenticate, attachOrganizationContext, interviewRoutes);
app.use('/api/saved-jobs', authenticate, attachOrganizationContext, savedJobRoutes);
app.use('/api/resumes', authenticate, attachOrganizationContext, resumeRoutes);
app.use('/api/talent-pipeline', authenticate, attachOrganizationContext, talentPipelineRoutes);

// health check
app.get('/health', (req, res) => res.json({ ok: true }));

// error handler
app.use(errorHandler);

// Database initialization (server.js will handle the actual server start)
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('DB connected');
  } catch (err) {
    console.error('Unable to connect to DB', err);
  }
})();

module.exports = app;
