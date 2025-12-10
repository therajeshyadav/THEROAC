require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('./models');
const { sequelize } = require('./models');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'https://theroac.com',
  'https://www.theroac.com',
  'https://api.theroac.com',
  'http://localhost:3000',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log('CORS Blocked:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Organization-Id',
    'X-Requested-With',
  ]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: false }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
const { authenticate } = require('./middlewares/auth');
const { attachOrganizationContext } = require('./middlewares/organizationMiddleware');
const errorHandler = require('./middlewares/errorHandler');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/jobs', jobRoutes);
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
app.get('/health', (req, res) => res.json({ ok: true }));
app.use(errorHandler);
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
