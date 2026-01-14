const { v4: uuidv4 } = require('uuid');

// Current test hackathon with live dates for testing submission
const currentTestHackathon = {
  id: uuidv4(),
  title: 'Live Test Hackathon - Team Submission',
  slug: 'live-test-hackathon-team-submission',
  description: 'Live hackathon for testing team submission functionality. Stage 1 is currently active for team registration.',
  startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  status: 'upcoming',
  approvalStatus: 'approved',
  locationType: 'hybrid',
  location: 'Live Test Hub + Online',
  venue: 'Test Center',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  categories: ['hackathon'],
  tags: ['live-test', 'team-submission', 'hackathon', 'active'],
  maxParticipants: 100,
  registrationFee: { type: 'free' },
  prizes: [
    { position: '1st Place', prize: '₹1,00,000', description: 'Winner prize' },
    { position: '2nd Place', prize: '₹50,000', description: 'Runner-up prize' }
  ],
  stages: [
    {
      title: 'Team Registration & Idea Submission',
      description: 'Form your team (2-4 members) and submit your innovative project idea. This is the first step to participate in the hackathon.',
      startDate: new Date().toISOString(), // Started now
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      submissions: [
        {
          type: 'document',
          label: 'Team Details',
          description: 'Upload team member information including names, roles, and contact details (PDF format)',
          required: true
        },
        {
          type: 'document',
          label: 'Project Idea Pitch',
          description: 'Submit your project concept, problem statement, and proposed solution (max 3 pages PDF)',
          required: true
        },
        {
          type: 'link',
          label: 'Team Leader LinkedIn',
          description: 'LinkedIn profile of the team leader for verification',
          required: false
        }
      ]
    },
    {
      title: 'Development Phase',
      description: 'Build your solution during the 48-hour development period. Submit your working prototype and demo.',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(), // 2 days + 1 hour from now
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
      submissions: [
        {
          type: 'github-link',
          label: 'Source Code Repository',
          description: 'Complete GitHub repository with proper documentation and README',
          required: true
        },
        {
          type: 'demo-video',
          label: 'Product Demo Video',
          description: '5-minute demo video showcasing your working solution',
          required: true
        },
        {
          type: 'link',
          label: 'Live Demo URL',
          description: 'Deployed application URL (if applicable)',
          required: false
        }
      ]
    },
    {
      title: 'Final Presentation',
      description: 'Present your solution to the judging panel. Showcase your innovation, technical implementation, and business potential.',
      startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 4 days + 2 hours from now
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      submissions: [
        {
          type: 'ppt',
          label: 'Final Presentation Slides',
          description: 'Comprehensive presentation for the judging panel (PPT/PDF format)',
          required: true
        },
        {
          type: 'document',
          label: 'Business Plan',
          description: 'Brief business plan or go-to-market strategy (optional)',
          required: false
        }
      ]
    }
  ],
  agenda: [
    { time: 'Today - Stage 1', title: 'Team Registration Open', description: 'Form teams and submit ideas' },
    { time: 'Day 3 - Stage 2', title: 'Development Begins', description: '48-hour coding marathon starts' },
    { time: 'Day 5 - Stage 3', title: 'Final Presentations', description: 'Present to judges and win prizes' }
  ],
  contactInfo: { email: 'live-test@hackathon.com', phone: '+91-9876543210' }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get or create a sample recruiter user
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'recruiter' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    let createdBy = users.length > 0 ? users[0].id : uuidv4();

    // Format event for database insertion
    const formattedEvent = {
      ...currentTestHackathon,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Convert JSON fields to strings
      registrationFee: JSON.stringify(currentTestHackathon.registrationFee),
      agenda: JSON.stringify(currentTestHackathon.agenda),
      contactInfo: JSON.stringify(currentTestHackathon.contactInfo),
      prizes: JSON.stringify(currentTestHackathon.prizes),
      stages: JSON.stringify(currentTestHackathon.stages)
    };

    // Insert event into database
    await queryInterface.bulkInsert('events', [formattedEvent]);

    console.log('✅ Successfully created LIVE test hackathon!');
    console.log('🔥 Stage 1: ACTIVE NOW - Team Registration (submit team details)');
    console.log('⏳ Stage 2: Starts in 2 days - Development Phase');
    console.log('🏆 Stage 3: Starts in 4 days - Final Presentation');
    console.log('');
    console.log('🎯 You can now test team submission functionality!');
    console.log('📝 Go to the event page and click "Submit for Team Registration"');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('events', {
      slug: 'live-test-hackathon-team-submission'
    });
  }
};