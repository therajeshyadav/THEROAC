'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash password
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // Insert Admin User
    const [adminUser] = await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('gen_random_uuid()'),
      fullName: 'Admin User',
      username: 'admin',
      email: 'admin@roac.com',
      passwordHash: passwordHash,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Insert Candidate User
    const [candidateUser] = await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('gen_random_uuid()'),
      fullName: 'Test Candidate',
      username: 'candidate',
      email: 'candidate@roac.com',
      passwordHash: await bcrypt.hash('User@123', 10),
      role: 'candidate',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Insert Recruiter User
    const [recruiterUser] = await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('gen_random_uuid()'),
      fullName: 'Test Recruiter',
      username: 'recruiter',
      email: 'recruiter@roac.com',
      passwordHash: await bcrypt.hash('User@123', 10),
      role: 'recruiter',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Insert Event
    await queryInterface.bulkInsert('events', [{
      id: Sequelize.literal('gen_random_uuid()'),
      title: 'AI Workshop 2025',
      slug: 'ai-workshop-2025',
      description: 'Learn AI in 3 days workshop.',
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      locationType: 'online',
      createdBy: adminUser ? adminUser.id : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Insert Hackathon
    const [hackathon] = await queryInterface.bulkInsert('hackathons', [{
      id: Sequelize.literal('gen_random_uuid()'),
      title: 'Buildathon 2025',
      slug: 'buildathon-2025',
      description: 'Build an AI chatbot in 48 hours.',
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      locationType: 'online',
      teamSizeMin: 2,
      teamSizeMax: 4,
      createdBy: adminUser ? adminUser.id : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Insert Hackathon Team
    const [team] = await queryInterface.bulkInsert('hackathon_teams', [{
      id: Sequelize.literal('gen_random_uuid()'),
      hackathonId: hackathon ? hackathon.id : null,
      name: 'Team Alpha',
      leaderId: candidateUser ? candidateUser.id : null,
      status: 'registered',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Insert Team Member
    await queryInterface.bulkInsert('team_members', [{
      id: Sequelize.literal('gen_random_uuid()'),
      teamId: team ? team.id : null,
      userId: candidateUser ? candidateUser.id : null,
      role: 'Developer',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Insert Submission
    await queryInterface.bulkInsert('submissions', [{
      id: Sequelize.literal('gen_random_uuid()'),
      hackathonId: hackathon ? hackathon.id : null,
      teamId: team ? team.id : null,
      title: 'AI Chatbot',
      description: 'A chatbot built with GPT-5.',
      submissionLink: 'https://github.com/demo/chatbot',
      status: 'submitted',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Insert Job
    await queryInterface.bulkInsert('jobs', [{
      id: Sequelize.literal('gen_random_uuid()'),
      title: 'Frontend Developer',
      slug: 'frontend-dev',
      companyName: 'Dev Innovations Labs',
      description: 'Work on cutting edge web apps.',
      jobType: 'full-time',
      experienceLevel: 'junior',
      locationType: 'remote',
      status: 'open',
      createdBy: recruiterUser ? recruiterUser.id : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('jobs', null, {});
    await queryInterface.bulkDelete('submissions', null, {});
    await queryInterface.bulkDelete('team_members', null, {});
    await queryInterface.bulkDelete('hackathon_teams', null, {});
    await queryInterface.bulkDelete('hackathons', null, {});
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
