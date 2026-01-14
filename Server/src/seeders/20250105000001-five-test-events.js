const { v4: uuidv4 } = require('uuid');

// Current date: January 5, 2026
const now = new Date('2026-01-05T10:00:00Z');

// Event 1: Live Hackathon (Currently Active)
const liveHackathon = {
  id: uuidv4(),
  title: 'AI Innovation Hackathon 2026',
  slug: 'ai-innovation-hackathon-2026',
  description: 'Build the next generation AI applications. Stage 1 is LIVE now!',
  startDate: new Date('2026-01-05T09:00:00Z'),
  endDate: new Date('2026-01-07T18:00:00Z'),
  registrationDeadline: new Date('2026-01-06T23:59:00Z'),
  status: 'upcoming',
  approvalStatus: 'approved',
  locationType: 'hybrid',
  location: 'IIT Bombay + Online',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  categories: ['hackathon'],
  tags: ['ai', 'machine-learning', 'innovation'],
  maxParticipants: 200,
  registrationFee: { type: 'free' },
  prizes: [
    { position: '1st Place', prize: '₹1,00,000', description: 'Winner takes all' },
    { position: '2nd Place', prize: '₹50,000', description: 'Runner up' }
  ],
  stages: [
    {
      title: 'Team Registration & Idea Submission',
      description: 'Form your team and submit your innovative AI idea. This stage is currently LIVE!',
      startDate: new Date('2026-01-05T09:00:00Z').toISOString(),
      deadline: new Date('2026-01-06T23:59:00Z').toISOString(),
      submissions: [
        { type: 'document', label: 'Team Details', description: 'Team member information (PDF)', required: true },
        { type: 'document', label: 'Idea Pitch', description: 'Your AI innovation idea (PDF/PPT)', required: true }
      ]
    },
    {
      title: 'Development Phase',
      description: 'Build your AI application with your team.',
      startDate: new Date('2026-01-07T00:00:00Z').toISOString(),
      deadline: new Date('2026-01-07T15:00:00Z').toISOString(),
      submissions: [
        { type: 'github-link', label: 'Source Code', description: 'GitHub repository link', required: true },
        { type: 'demo-video', label: 'Demo Video', description: 'Product demonstration video', required: true }
      ]
    },
    {
      title: 'Final Presentation',
      description: 'Present your solution to the judges. No submission required.',
      startDate: new Date('2026-01-07T16:00:00Z').toISOString(),
      deadline: new Date('2026-01-07T18:00:00Z').toISOString(),
      submissions: []
    }
  ],
  agenda: [
    { time: 'Jan 5, 9:00 AM', title: 'Registration Opens', description: 'Team building starts' },
    { time: 'Jan 7, 4:00 PM', title: 'Final Presentations', description: 'Pitch to judges' }
  ],
  contactInfo: { email: 'ai-hackathon@iitb.ac.in', phone: '+91-9876543210' }
};

// Event 2: Upcoming Workshop
const upcomingWorkshop = {
  id: uuidv4(),
  title: 'Full Stack Development Bootcamp',
  slug: 'full-stack-development-bootcamp',
  description: 'Master React, Node.js, and MongoDB in this intensive 3-day workshop.',
  startDate: new Date('2026-01-15T10:00:00Z'),
  endDate: new Date('2026-01-17T17:00:00Z'),
  registrationDeadline: new Date('2026-01-14T23:59:00Z'),
  status: 'upcoming',
  approvalStatus: 'approved',
  locationType: 'offline',
  location: 'Tech Hub, Bangalore',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  categories: ['workshop'],
  tags: ['react', 'nodejs', 'mongodb', 'fullstack'],
  maxParticipants: 50,
  registrationFee: { type: 'paid', amount: 2999, currency: 'INR' },
  prizes: [
    { position: 'Certificate', prize: 'Completion Certificate', description: 'Industry recognized certificate' }
  ],
  stages: [
    {
      title: 'Registration & Prerequisites',
      description: 'Complete registration and setup development environment.',
      startDate: new Date('2026-01-10T00:00:00Z').toISOString(),
      deadline: new Date('2026-01-14T23:59:00Z').toISOString(),
      submissions: [
        { type: 'document', label: 'Resume', description: 'Your latest resume (PDF)', required: true },
        { type: 'link', label: 'GitHub Profile', description: 'Your GitHub profile URL', required: false }
      ]
    },
    {
      title: 'Workshop Sessions',
      description: 'Attend all workshop sessions and complete hands-on exercises.',
      startDate: new Date('2026-01-15T10:00:00Z').toISOString(),
      deadline: new Date('2026-01-17T17:00:00Z').toISOString(),
      submissions: []
    },
    {
      title: 'Final Project Submission',
      description: 'Submit your capstone project built during the workshop.',
      startDate: new Date('2026-01-17T14:00:00Z').toISOString(),
      deadline: new Date('2026-01-20T23:59:00Z').toISOString(),
      submissions: [
        { type: 'github-link', label: 'Project Repository', description: 'Your full-stack project', required: true },
        { type: 'link', label: 'Live Demo', description: 'Deployed application URL', required: true }
      ]
    }
  ],
  agenda: [
    { time: 'Day 1', title: 'React Fundamentals', description: 'Components, State, Props' },
    { time: 'Day 2', title: 'Backend with Node.js', description: 'APIs, Express, MongoDB' },
    { time: 'Day 3', title: 'Integration & Deployment', description: 'Full-stack integration' }
  ],
  contactInfo: { email: 'workshop@techhub.com', phone: '+91-8765432109' }
};

// Event 3: Conference in February
const conference = {
  id: uuidv4(),
  title: 'DevCon India 2026',
  slug: 'devcon-india-2026',
  description: 'India\'s largest developer conference featuring industry leaders and cutting-edge technologies.',
  startDate: new Date('2026-02-20T09:00:00Z'),
  endDate: new Date('2026-02-22T18:00:00Z'),
  registrationDeadline: new Date('2026-02-15T23:59:00Z'),
  status: 'upcoming',
  approvalStatus: 'approved',
  locationType: 'hybrid',
  location: 'Pragati Maidan, New Delhi + Virtual',
  city: 'New Delhi',
  state: 'Delhi',
  country: 'India',
  categories: ['conference'],
  tags: ['developers', 'technology', 'networking', 'innovation'],
  maxParticipants: 5000,
  registrationFee: { type: 'paid', amount: 4999, currency: 'INR' },
  prizes: [
    { position: 'Networking', prize: 'Industry Connections', description: 'Meet 500+ developers' },
    { position: 'Swag', prize: 'Developer Kit', description: 'Exclusive conference merchandise' }
  ],
  stages: [
    {
      title: 'Early Bird Registration',
      description: 'Register early and save 30% on conference tickets.',
      startDate: new Date('2026-01-20T00:00:00Z').toISOString(),
      deadline: new Date('2026-02-10T23:59:00Z').toISOString(),
      submissions: [
        { type: 'document', label: 'Professional Profile', description: 'Your professional background', required: true }
      ]
    },
    {
      title: 'Conference Days',
      description: 'Attend keynotes, workshops, and networking sessions.',
      startDate: new Date('2026-02-20T09:00:00Z').toISOString(),
      deadline: new Date('2026-02-22T18:00:00Z').toISOString(),
      submissions: []
    },
    {
      title: 'Post-Conference Survey',
      description: 'Share your feedback and get access to recorded sessions.',
      startDate: new Date('2026-02-22T19:00:00Z').toISOString(),
      deadline: new Date('2026-02-28T23:59:00Z').toISOString(),
      submissions: [
        { type: 'link', label: 'Feedback Form', description: 'Conference feedback survey', required: false }
      ]
    }
  ],
  agenda: [
    { time: 'Feb 20', title: 'Keynotes & Tech Talks', description: 'Industry leaders share insights' },
    { time: 'Feb 21', title: 'Workshops & Hands-on', description: 'Interactive learning sessions' },
    { time: 'Feb 22', title: 'Networking & Closing', description: 'Connect with peers' }
  ],
  contactInfo: { email: 'info@devconindia.com', phone: '+91-7654321098' }
};

// Event 4: Competition (Ended)
const endedCompetition = {
  id: uuidv4(),
  title: 'Code Sprint Challenge 2025',
  slug: 'code-sprint-challenge-2025',
  description: 'Fast-paced coding competition that concluded last month. Check results!',
  startDate: new Date('2025-12-10T10:00:00Z'),
  endDate: new Date('2025-12-15T18:00:00Z'),
  registrationDeadline: new Date('2025-12-08T23:59:00Z'),
  status: 'completed',
  approvalStatus: 'approved',
  locationType: 'online',
  location: 'Virtual Platform',
  city: 'Online',
  state: 'Online',
  country: 'India',
  categories: ['competition'],
  tags: ['coding', 'algorithms', 'competitive-programming'],
  maxParticipants: 1000,
  registrationFee: { type: 'free' },
  prizes: [
    { position: '1st Place', prize: '₹25,000', description: 'Top coder award' },
    { position: '2nd Place', prize: '₹15,000', description: 'Runner up' },
    { position: '3rd Place', prize: '₹10,000', description: 'Third place' }
  ],
  stages: [
    {
      title: 'Qualification Round',
      description: 'Solve basic algorithmic problems to qualify.',
      startDate: new Date('2025-12-10T10:00:00Z').toISOString(),
      deadline: new Date('2025-12-12T23:59:00Z').toISOString(),
      submissions: [
        { type: 'code', label: 'Solution Code', description: 'Your algorithmic solutions', required: true }
      ]
    },
    {
      title: 'Final Round',
      description: 'Advanced problem solving for qualified participants.',
      startDate: new Date('2025-12-14T10:00:00Z').toISOString(),
      deadline: new Date('2025-12-15T15:00:00Z').toISOString(),
      submissions: [
        { type: 'code', label: 'Final Solutions', description: 'Advanced algorithmic solutions', required: true }
      ]
    },
    {
      title: 'Results & Awards',
      description: 'Winner announcement and prize distribution.',
      startDate: new Date('2025-12-15T16:00:00Z').toISOString(),
      deadline: new Date('2025-12-15T18:00:00Z').toISOString(),
      submissions: []
    }
  ],
  agenda: [
    { time: 'Dec 10-12', title: 'Qualification', description: 'Basic problems' },
    { time: 'Dec 14-15', title: 'Finals', description: 'Advanced challenges' }
  ],
  contactInfo: { email: 'codesprint@techcompany.com' }
};

// Event 5: Career Fair
const careerFair = {
  id: uuidv4(),
  title: 'Tech Career Fair 2026',
  slug: 'tech-career-fair-2026',
  description: 'Connect with top tech companies and land your dream job. 100+ companies participating.',
  startDate: new Date('2026-02-05T10:00:00Z'),
  endDate: new Date('2026-02-07T17:00:00Z'),
  registrationDeadline: new Date('2026-02-03T23:59:00Z'),
  status: 'upcoming',
  approvalStatus: 'approved',
  locationType: 'offline',
  location: 'NSIC Exhibition Complex, Okhla',
  city: 'New Delhi',
  state: 'Delhi',
  country: 'India',
  categories: ['career-fair'],
  tags: ['jobs', 'careers', 'recruitment', 'networking'],
  maxParticipants: 2000,
  registrationFee: { type: 'free' },
  prizes: [
    { position: 'Job Offers', prize: 'Multiple Job Opportunities', description: 'Direct hiring by companies' }
  ],
  stages: [
    {
      title: 'Pre-Registration & Profile Setup',
      description: 'Register and create your professional profile for companies to review.',
      startDate: new Date('2026-01-25T00:00:00Z').toISOString(),
      deadline: new Date('2026-02-03T23:59:00Z').toISOString(),
      submissions: [
        { type: 'document', label: 'Resume', description: 'Your latest resume (PDF)', required: true },
        { type: 'document', label: 'Portfolio', description: 'Work portfolio or projects', required: false }
      ]
    },
    {
      title: 'Career Fair Days',
      description: 'Meet recruiters, attend company presentations, and apply for positions.',
      startDate: new Date('2026-02-05T10:00:00Z').toISOString(),
      deadline: new Date('2026-02-07T17:00:00Z').toISOString(),
      submissions: []
    },
    {
      title: 'Follow-up & Interviews',
      description: 'Companies will contact selected candidates for interviews.',
      startDate: new Date('2026-02-08T00:00:00Z').toISOString(),
      deadline: new Date('2026-02-20T23:59:00Z').toISOString(),
      submissions: []
    }
  ],
  agenda: [
    { time: 'Feb 5', title: 'Company Presentations', description: 'Learn about opportunities' },
    { time: 'Feb 6', title: 'One-on-One Meetings', description: 'Direct recruiter interactions' },
    { time: 'Feb 7', title: 'Final Networking', description: 'Last chance connections' }
  ],
  contactInfo: { email: 'careers@techfair.in', phone: '+91-6543210987' }
};

const events = [liveHackathon, upcomingWorkshop, conference, endedCompetition, careerFair];

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get or create a sample recruiter user
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'recruiter' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    let createdBy = users.length > 0 ? users[0].id : uuidv4();

    // Format events for database insertion
    const formattedEvents = events.map(event => ({
      ...event,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Convert JSON fields to strings
      registrationFee: JSON.stringify(event.registrationFee),
      agenda: JSON.stringify(event.agenda),
      contactInfo: JSON.stringify(event.contactInfo),
      prizes: JSON.stringify(event.prizes),
      stages: JSON.stringify(event.stages)
    }));

    // Insert events into database
    await queryInterface.bulkInsert('events', formattedEvents);

    console.log('✅ Successfully created 5 TEST EVENTS!');
    console.log('');
    console.log('🔥 Event 1: AI Hackathon - LIVE NOW (Stage 1 active)');
    console.log('📅 Event 2: Full Stack Workshop - Jan 15-17, 2026');
    console.log('🎤 Event 3: DevCon Conference - Feb 20-22, 2026');
    console.log('🏆 Event 4: Code Sprint - ENDED (Dec 2025)');
    console.log('💼 Event 5: Career Fair - Feb 5-7, 2026');
    console.log('');
    console.log('🎯 All events have different stages and submission types!');
    console.log('📊 Test different scenarios: Live, Upcoming, Ended');
  },

  async down(queryInterface, Sequelize) {
    const slugs = events.map(event => event.slug);
    await queryInterface.bulkDelete('events', {
      slug: { [Sequelize.Op.in]: slugs }
    });
  }
};