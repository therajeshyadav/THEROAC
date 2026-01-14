const { v4: uuidv4 } = require('uuid');

// Test hackathon with sequential stages for testing
const testHackathon = {
  id: uuidv4(),
  title: 'Sequential Test Hackathon 2024',
  slug: 'sequential-test-hackathon-2024',
  description: 'Test hackathon to demonstrate sequential stage flow. Each stage unlocks after the previous one ends.',
  startDate: new Date('2024-01-10T18:00:00Z'),
  endDate: new Date('2024-01-15T18:00:00Z'),
  registrationDeadline: new Date('2024-01-08T23:59:59Z'),
  status: 'upcoming',
  approvalStatus: 'approved',
  locationType: 'hybrid',
  location: 'Test Hub + Online',
  venue: 'Test Center',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  categories: ['hackathon'],
  tags: ['test', 'sequential', 'hackathon', 'demo'],
  maxParticipants: 50,
  registrationFee: { type: 'free' },
  prizes: [
    { position: '1st Place', prize: '₹50,000', description: 'Winner prize' },
    { position: '2nd Place', prize: '₹25,000', description: 'Runner-up prize' }
  ],
  stages: [
    {
      title: 'Stage 1: Team Registration',
      description: 'Form your team and submit basic information. This stage is currently active.',
      startDate: '2024-01-05T00:00:00Z',
      deadline: '2024-01-08T23:59:59Z', // This should be in the past to unlock Stage 2
      submissions: [
        {
          type: 'document',
          label: 'Team Details',
          description: 'Team member information and roles (PDF)',
          required: true
        },
        {
          type: 'document',
          label: 'Initial Idea',
          description: 'Brief description of your project concept',
          required: true
        }
      ]
    },
    {
      title: 'Stage 2: Development Phase',
      description: 'Build your solution. This stage will unlock after Stage 1 deadline.',
      startDate: '2024-01-09T00:00:00Z',
      deadline: '2024-01-12T23:59:59Z',
      submissions: [
        {
          type: 'github-link',
          label: 'Source Code',
          description: 'Complete GitHub repository with documentation',
          required: true
        },
        {
          type: 'demo-video',
          label: 'Demo Video',
          description: '3-minute demo video of your solution',
          required: true
        }
      ]
    },
    {
      title: 'Stage 3: Final Presentation',
      description: 'Present your solution to judges. This unlocks after Stage 2.',
      startDate: '2024-01-13T00:00:00Z',
      deadline: '2024-01-15T17:00:00Z',
      submissions: [
        {
          type: 'ppt',
          label: 'Presentation Slides',
          description: 'Final presentation for judges (PPT/PDF)',
          required: true
        }
      ]
    }
  ],
  agenda: [
    { time: 'Jan 5-8', title: 'Team Registration', description: 'Form teams and register' },
    { time: 'Jan 9-12', title: 'Development Phase', description: 'Build your solution' },
    { time: 'Jan 13-15', title: 'Presentations', description: 'Present to judges' }
  ],
  contactInfo: { email: 'test@hackathon.com', phone: '+91-9876543210' }
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
      ...testHackathon,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Convert JSON fields to strings
      registrationFee: JSON.stringify(testHackathon.registrationFee),
      agenda: JSON.stringify(testHackathon.agenda),
      contactInfo: JSON.stringify(testHackathon.contactInfo),
      prizes: JSON.stringify(testHackathon.prizes),
      stages: JSON.stringify(testHackathon.stages)
    };

    // Insert event into database
    await queryInterface.bulkInsert('events', [formattedEvent]);

    console.log('✅ Successfully created test sequential hackathon!');
    console.log('📅 Stage 1: Jan 5-8 (should be ended - unlocks Stage 2)');
    console.log('📅 Stage 2: Jan 9-12 (should be active)');
    console.log('📅 Stage 3: Jan 13-15 (should be locked until Stage 2 ends)');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('events', {
      slug: 'sequential-test-hackathon-2024'
    });
  }
};