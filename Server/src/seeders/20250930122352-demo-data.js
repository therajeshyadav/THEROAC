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

    // Insert Jobs
    const [job1] = await queryInterface.bulkInsert('jobs', [{
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
    }], { returning: ['id'] });

    const [job2] = await queryInterface.bulkInsert('jobs', [{
      id: Sequelize.literal('gen_random_uuid()'),
      title: 'Backend Developer',
      slug: 'backend-dev',
      companyName: 'Tech Solutions Inc',
      description: 'Build scalable APIs and microservices.',
      jobType: 'full-time',
      experienceLevel: 'mid',
      locationType: 'hybrid',
      status: 'open',
      createdBy: recruiterUser ? recruiterUser.id : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Insert more candidate users for job applications
    const [candidate2] = await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('gen_random_uuid()'),
      fullName: 'Sarah Johnson',
      username: 'sarah.johnson',
      email: 'sarah.johnson@email.com',
      passwordHash: await bcrypt.hash('User@123', 10),
      role: 'candidate',
      status: 'active',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    const [candidate3] = await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('gen_random_uuid()'),
      fullName: 'Michael Chen',
      username: 'michael.chen',
      email: 'michael.chen@email.com',
      passwordHash: await bcrypt.hash('User@123', 10),
      role: 'candidate',
      status: 'active',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    const [candidate4] = await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('gen_random_uuid()'),
      fullName: 'Emily Rodriguez',
      username: 'emily.rodriguez',
      email: 'emily.rodriguez@email.com',
      passwordHash: await bcrypt.hash('User@123', 10),
      role: 'candidate',
      status: 'active',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Insert Job Applications
    await queryInterface.bulkInsert('job_applications', [{
      id: Sequelize.literal('gen_random_uuid()'),
      userId: candidateUser ? candidateUser.id : null,
      jobId: job1 ? job1.id : null,
      status: 'applied',
      resumeLink: 'https://example.com/resume1.pdf',
      coverLetter: 'I am very interested in this position...',
      createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000)
    }]);

    await queryInterface.bulkInsert('job_applications', [{
      id: Sequelize.literal('gen_random_uuid()'),
      userId: candidate2 ? candidate2.id : null,
      jobId: job1 ? job1.id : null,
      status: 'interview',
      resumeLink: 'https://example.com/resume2.pdf',
      coverLetter: 'Looking forward to contributing to your team...',
      createdAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000)  // 1 day ago
    }]);

    await queryInterface.bulkInsert('job_applications', [{
      id: Sequelize.literal('gen_random_uuid()'),
      userId: candidate3 ? candidate3.id : null,
      jobId: job2 ? job2.id : null,
      status: 'shortlisted',
      resumeLink: 'https://example.com/resume3.pdf',
      coverLetter: 'Excited about this opportunity...',
      createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000)  // 2 days ago
    }]);

    await queryInterface.bulkInsert('job_applications', [{
      id: Sequelize.literal('gen_random_uuid()'),
      userId: candidate4 ? candidate4.id : null,
      jobId: job1 ? job1.id : null,
      status: 'offered',
      resumeLink: 'https://example.com/resume4.pdf',
      coverLetter: 'Perfect fit for this role...',
      createdAt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      updatedAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000)   // 1 day ago
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('job_applications', null, {});
    await queryInterface.bulkDelete('jobs', null, {});
    await queryInterface.bulkDelete('submissions', null, {});
    await queryInterface.bulkDelete('team_members', null, {});
    await queryInterface.bulkDelete('hackathon_teams', null, {});
    await queryInterface.bulkDelete('hackathons', null, {});
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
