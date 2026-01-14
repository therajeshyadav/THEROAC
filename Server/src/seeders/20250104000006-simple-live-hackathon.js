const { v4: uuidv4 } = require('uuid');

// Simple live hackathon with current timestamps - GUARANTEED LIVE
const now = new Date();
const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Stage 1 ends in 2 hours
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

const simpleLiveHackathon = {
  id: uuidv4(),
  title: 'Team Building Test Hackathon 2024',
  slug: 'team-building-test-hackathon-2024',
  description: 'Simple hackathon for testing submission functionality. Stage 1 is currently LIVE.',
  startDate: now,
  endDate: dayAfterTomorrow,
  registrationDeadline: in2Hours,
  status: 'upcoming',
  approvalStatus: 'approved',
  locationType: 'online',
  location: 'Online Platform',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  categories: ['hackathon'],
  tags: ['simple', 'live', 'test', 'submission'],
  maxParticipants: 50,
  registrationFee: { type: 'free' },
  prizes: [
    { position: '1st Place', prize: '₹50,000', description: 'Winner prize' }
  ],
  stages: [
    {
      title: 'Team Registration',
      description: 'Register your team and submit basic details. This stage is currently LIVE and you can submit now!',
      startDate: now.toISOString(),
      deadline: in2Hours.toISOString(),
      submissions: [
        {
          type: 'document',
          label: 'Team Details',
          description: 'Upload team information (PDF)',
          required: true
        },
        {
          type: 'link',
          label: 'Team Leader Contact',
          description: 'WhatsApp or email contact',
          required: true
        }
      ]
    },
    {
      title: 'Final Submission',
      description: 'Submit your final project. This will unlock after Stage 1 ends.',
      startDate: in2Hours.toISOString(),
      deadline: dayAfterTomorrow.toISOString(),
      submissions: [
        {
          type: 'github-link',
          label: 'Project Repository',
          description: 'GitHub repository link',
          required: true
        }
      ]
    }
  ],
  agenda: [
    { time: 'Now', title: 'Stage 1 - Team Registration', description: 'Currently LIVE' },
    { time: 'Tomorrow', title: 'Stage 2 - Final Submission', description: 'Unlocks tomorrow' }
  ],
  contactInfo: { email: 'test@hackathon.com' }
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
      ...simpleLiveHackathon,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Convert JSON fields to strings
      registrationFee: JSON.stringify(simpleLiveHackathon.registrationFee),
      agenda: JSON.stringify(simpleLiveHackathon.agenda),
      contactInfo: JSON.stringify(simpleLiveHackathon.contactInfo),
      prizes: JSON.stringify(simpleLiveHackathon.prizes),
      stages: JSON.stringify(simpleLiveHackathon.stages)
    };

    // Insert event into database
    await queryInterface.bulkInsert('events', [formattedEvent]);

    console.log('✅ Successfully created SIMPLE LIVE hackathon!');
    console.log('🔥 Stage 1: LIVE RIGHT NOW - Team Registration');
    console.log('📅 Current time:', now.toISOString());
    console.log('📅 Stage 1 deadline:', in2Hours.toISOString());
    console.log('📅 Stage 2 starts:', in2Hours.toISOString());
    console.log('');
    console.log('🎯 Go test the submission functionality NOW!');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('events', {
      slug: 'team-building-test-hackathon-2024'
    });
  }
};