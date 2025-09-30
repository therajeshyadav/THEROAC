'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // USERS
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      fullName: { type: Sequelize.STRING, allowNull: false },
      username: { type: Sequelize.STRING, unique: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      phone: { type: Sequelize.STRING, unique: true },
      passwordHash: { type: Sequelize.STRING },
      provider: { type: Sequelize.ENUM('email','google','linkedin','github','apple'), defaultValue: 'email' },
      providerId: { type: Sequelize.STRING },
      profilePicture: { type: Sequelize.TEXT },
      bio: { type: Sequelize.TEXT },
      gender: { type: Sequelize.ENUM('male','female','other') },
      dateOfBirth: { type: Sequelize.DATEONLY },
      city: { type: Sequelize.STRING },
      state: { type: Sequelize.STRING },
      country: { type: Sequelize.STRING },
      role: { type: Sequelize.ENUM('user','organizer','moderator','admin','superadmin'), defaultValue: 'user' },
      status: { type: Sequelize.ENUM('active','inactive','banned','suspended'), defaultValue: 'active' },
      isVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
      preferences: { type: Sequelize.JSON, defaultValue: {} },
      fcmToken: { type: Sequelize.STRING },
      deviceInfo: { type: Sequelize.JSON },
      signupSource: { type: Sequelize.ENUM('website','mobile-app','referral','campaign'), defaultValue: 'website' },
      referralCode: { type: Sequelize.STRING },
      referredBy: { type: Sequelize.UUID },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deletedAt: { type: Sequelize.DATE }
    });

    // EVENTS
    await queryInterface.createTable('events', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, unique: true },
      description: { type: Sequelize.TEXT },
      bannerImage: { type: Sequelize.TEXT },
      startDate: { type: Sequelize.DATE, allowNull: false },
      endDate: { type: Sequelize.DATE, allowNull: false },
      registrationDeadline: { type: Sequelize.DATE },
      status: { type: Sequelize.ENUM('upcoming','ongoing','completed','cancelled'), defaultValue: 'upcoming' },
      locationType: { type: Sequelize.ENUM('online','offline','hybrid'), defaultValue: 'online' },
      location: { type: Sequelize.STRING },
      eligibility: { type: Sequelize.JSON },
      tags: { type: Sequelize.ARRAY(Sequelize.STRING) },
      prizes: { type: Sequelize.JSON },
      registrationLink: { type: Sequelize.TEXT },
      views: { type: Sequelize.INTEGER, defaultValue: 0 },
      registrations: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdBy: { type: Sequelize.UUID, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deletedAt: { type: Sequelize.DATE }
    });

    // HACKATHONS
    await queryInterface.createTable('hackathons', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, unique: true },
      description: { type: Sequelize.TEXT },
      bannerImage: { type: Sequelize.TEXT },
      problemStatement: { type: Sequelize.TEXT },
      rules: { type: Sequelize.TEXT },
      startDate: { type: Sequelize.DATE, allowNull: false },
      endDate: { type: Sequelize.DATE, allowNull: false },
      registrationDeadline: { type: Sequelize.DATE },
      status: { type: Sequelize.ENUM('upcoming','ongoing','completed','cancelled'), defaultValue: 'upcoming' },
      locationType: { type: Sequelize.ENUM('online','offline','hybrid'), defaultValue: 'online' },
      prizes: { type: Sequelize.JSON },
      eligibility: { type: Sequelize.JSON },
      tags: { type: Sequelize.ARRAY(Sequelize.STRING) },
      teamSizeMin: { type: Sequelize.INTEGER },
      teamSizeMax: { type: Sequelize.INTEGER },
      submissionType: { type: Sequelize.ENUM('idea','ppt','code','prototype') },
      submissionLink: { type: Sequelize.TEXT },
      views: { type: Sequelize.INTEGER, defaultValue: 0 },
      registrations: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdBy: { type: Sequelize.UUID, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deletedAt: { type: Sequelize.DATE }
    });

    // JOBS
    await queryInterface.createTable('jobs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, unique: true },
      companyName: { type: Sequelize.STRING, allowNull: false },
      companyLogo: { type: Sequelize.TEXT },
      description: { type: Sequelize.TEXT },
      responsibilities: { type: Sequelize.TEXT },
      requirements: { type: Sequelize.TEXT },
      jobType: { type: Sequelize.ENUM('full-time','part-time','internship','contract'), defaultValue: 'full-time' },
      experienceLevel: { type: Sequelize.ENUM('fresher','junior','mid','senior'), defaultValue: 'fresher' },
      locationType: { type: Sequelize.ENUM('remote','onsite','hybrid'), defaultValue: 'remote' },
      location: { type: Sequelize.STRING },
      salary: { type: Sequelize.JSON },
      applicationDeadline: { type: Sequelize.DATE },
      applyLink: { type: Sequelize.TEXT },
      skills: { type: Sequelize.ARRAY(Sequelize.STRING) },
      status: { type: Sequelize.ENUM('open','closed','paused'), defaultValue: 'open' },
      views: { type: Sequelize.INTEGER, defaultValue: 0 },
      applications: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdBy: { type: Sequelize.UUID, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deletedAt: { type: Sequelize.DATE }
    });

    // EVENT REGISTRATIONS
    await queryInterface.createTable('event_registrations', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      userId: { type: Sequelize.UUID, allowNull: false },
      eventId: { type: Sequelize.UUID, allowNull: false },
      status: { type: Sequelize.ENUM('registered','attended','cancelled'), defaultValue: 'registered' },
      metadata: { type: Sequelize.JSON },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deletedAt: { type: Sequelize.DATE }
    });

    // HACKATHON TEAMS
    await queryInterface.createTable('hackathon_teams', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      hackathonId: { type: Sequelize.UUID, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      leaderId: { type: Sequelize.UUID, allowNull: false },
      status: { type: Sequelize.ENUM('registered','shortlisted','winner','disqualified'), defaultValue: 'registered' },
      metadata: { type: Sequelize.JSON },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deletedAt: { type: Sequelize.DATE }
    });

    // TEAM MEMBERS
    await queryInterface.createTable('team_members', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      teamId: { type: Sequelize.UUID, allowNull: false },
      userId: { type: Sequelize.UUID, allowNull: false },
      role: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deletedAt: { type: Sequelize.DATE }
    });

    // SUBMISSIONS
    await queryInterface.createTable('submissions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      hackathonId: { type: Sequelize.UUID, allowNull: false },
      teamId: { type: Sequelize.UUID, allowNull: false },
      title: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      submissionLink: { type: Sequelize.TEXT },
      metadata: { type: Sequelize.JSON },
      status: { type: Sequelize.ENUM('submitted','under_review','accepted','rejected'), defaultValue: 'submitted' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deletedAt: { type: Sequelize.DATE }
    });

    // JOB APPLICATIONS
    await queryInterface.createTable('job_applications', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      userId: { type: Sequelize.UUID, allowNull: false },
      jobId: { type: Sequelize.UUID, allowNull: false },
      resumeLink: { type: Sequelize.TEXT },
      coverLetter: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('applied','shortlisted','interview','offered','hired','rejected'), defaultValue: 'applied' },
      metadata: { type: Sequelize.JSON },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deletedAt: { type: Sequelize.DATE }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_applications');
    await queryInterface.dropTable('submissions');
    await queryInterface.dropTable('team_members');
    await queryInterface.dropTable('hackathon_teams');
    await queryInterface.dropTable('event_registrations');
    await queryInterface.dropTable('jobs');
    await queryInterface.dropTable('hackathons');
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('users');
  }
};