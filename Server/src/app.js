require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const eventStageRoutes = require('./routes/eventStages');
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
const reviewRoutes = require('./routes/reviews');
const faqRoutes = require('./routes/faqs');
const quizRoutes = require('./routes/quiz');
const profileQuizRoutes = require('./routes/profileQuiz');
const walletRoutes = require('./routes/roacWallet');
const errorHandler = require('./middleware/errorHandler');
const { attachOrganizationContext } = require('./middleware/organizationMiddleware');

const app = express();
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// routes (auth routes should come first, before authentication middleware)
// Passport Config
require('./config/passport');
const passport = require('passport');

// routes (auth routes should come first, before authentication middleware)
app.use(passport.initialize());
app.use('/api/auth', authRoutes);

// Attach organization context to authenticated requests (after auth routes)
const { authenticate } = require('./middleware/auth');

// Public routes (authentication handled per-route inside these routers)
app.use('/api/events', eventRoutes);
app.use('/api/events', eventStageRoutes); // Event stages routes
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/hub-content', hubContentRoutes);
app.use('/api/payment/phonepe', require('./routes/phonepePayment'));

// Apply authentication and organization context to protected routes
app.use('/api/users', authenticate, attachOrganizationContext, userRoutes);
app.use('/api/admin', authenticate, attachOrganizationContext, adminRoutes);
app.use('/api/dashboard', authenticate, attachOrganizationContext, dashboardRoutes);
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
app.use('/api/reviews', reviewRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/profile-quiz', authenticate, attachOrganizationContext, profileQuizRoutes);
app.use('/api/', authenticate, walletRoutes);

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
