'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new fields to jobs table
    await queryInterface.addColumn('jobs', 'workingDays', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Working days configuration - ["5 Days", "6 Days", etc]'
    });

    await queryInterface.addColumn('jobs', 'jobSchedule', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Job schedule options - ["Day shift", "Night shift", etc]'
    });

    await queryInterface.addColumn('jobs', 'hideOpenings', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Hide number of openings from candidates'
    });

    await queryInterface.addColumn('jobs', 'festivalCampaign', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Linked festival or campaign name'
    });

    await queryInterface.addColumn('jobs', 'applicationSettings', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Application settings - {platform, timeline, maxLimit, status, formFields, screeningQuestions}'
    });

    await queryInterface.addColumn('jobs', 'importantDates', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Important dates - [{title, date}]'
    });

    await queryInterface.addColumn('jobs', 'attachments', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'File attachments - [{name, url, size}]'
    });

    await queryInterface.addColumn('jobs', 'gallery', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Image gallery - [{url, caption}]'
    });

    await queryInterface.addColumn('jobs', 'mobileBanner', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Mobile banner image URL'
    });

    await queryInterface.addColumn('jobs', 'themeColor', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Theme color for the listing'
    });

    await queryInterface.addColumn('jobs', 'terms', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Terms and conditions'
    });

    await queryInterface.addColumn('jobs', 'additionalNotes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Additional notes or information'
    });

    // Add new fields to events table (for opportunities)
    await queryInterface.addColumn('events', 'workingDays', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('events', 'hideOpenings', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('events', 'festivalCampaign', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('events', 'registrationSettings', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Registration settings - {platform, timeline, maxLimit, status, formFields, screeningQuestions}'
    });

    await queryInterface.addColumn('events', 'prizes', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Prizes list - [{rank, prizeType, amount, currency, perks, otherDetails}]'
    });

    await queryInterface.addColumn('events', 'prizeDescription', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'What do participants receive description'
    });

    await queryInterface.addColumn('events', 'prizeDeliverDays', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Prize delivery timeline'
    });

    await queryInterface.addColumn('events', 'participationCertificate', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether participation certificate will be provided'
    });

    await queryInterface.addColumn('events', 'paymentSettings', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Payment settings - {hasRegistrationFee, platform, tickets, accountDetails, serviceChargeFrom, paymentMethods}'
    });

    await queryInterface.addColumn('events', 'importantDates', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Important dates - [{title, date}]'
    });

    await queryInterface.addColumn('events', 'attachments', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'File attachments - [{name, url, size}]'
    });

    await queryInterface.addColumn('events', 'gallery', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Image gallery - [{url, caption}]'
    });

    await queryInterface.addColumn('events', 'mobileBanner', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Mobile banner image URL'
    });

    await queryInterface.addColumn('events', 'themeColor', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Theme color for the event'
    });

    await queryInterface.addColumn('events', 'terms', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Terms and conditions'
    });

    await queryInterface.addColumn('events', 'additionalNotes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Additional notes or information'
    });

    await queryInterface.addColumn('events', 'socialLinks', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Social media links - {discord, slack, etc}'
    });

    console.log('✅ Migration completed: Added unified edit modal fields');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns from jobs table
    await queryInterface.removeColumn('jobs', 'workingDays');
    await queryInterface.removeColumn('jobs', 'jobSchedule');
    await queryInterface.removeColumn('jobs', 'hideOpenings');
    await queryInterface.removeColumn('jobs', 'festivalCampaign');
    await queryInterface.removeColumn('jobs', 'applicationSettings');
    await queryInterface.removeColumn('jobs', 'importantDates');
    await queryInterface.removeColumn('jobs', 'attachments');
    await queryInterface.removeColumn('jobs', 'gallery');
    await queryInterface.removeColumn('jobs', 'mobileBanner');
    await queryInterface.removeColumn('jobs', 'themeColor');
    await queryInterface.removeColumn('jobs', 'terms');
    await queryInterface.removeColumn('jobs', 'additionalNotes');

    // Remove columns from events table
    await queryInterface.removeColumn('events', 'workingDays');
    await queryInterface.removeColumn('events', 'hideOpenings');
    await queryInterface.removeColumn('events', 'festivalCampaign');
    await queryInterface.removeColumn('events', 'registrationSettings');
    await queryInterface.removeColumn('events', 'prizes');
    await queryInterface.removeColumn('events', 'prizeDescription');
    await queryInterface.removeColumn('events', 'prizeDeliverDays');
    await queryInterface.removeColumn('events', 'participationCertificate');
    await queryInterface.removeColumn('events', 'paymentSettings');
    await queryInterface.removeColumn('events', 'importantDates');
    await queryInterface.removeColumn('events', 'attachments');
    await queryInterface.removeColumn('events', 'gallery');
    await queryInterface.removeColumn('events', 'mobileBanner');
    await queryInterface.removeColumn('events', 'themeColor');
    await queryInterface.removeColumn('events', 'terms');
    await queryInterface.removeColumn('events', 'additionalNotes');
    await queryInterface.removeColumn('events', 'socialLinks');

    console.log('✅ Migration rolled back: Removed unified edit modal fields');
  }
};
