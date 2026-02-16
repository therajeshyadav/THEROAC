'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add opportunityType and opportunitySubType to events table
    await queryInterface.addColumn('events', 'opportunityType', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Type of opportunity: competition, quiz, hackathon, webinar, cultural, scholarship'
    });

    await queryInterface.addColumn('events', 'opportunitySubType', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Sub-type based on opportunityType'
    });

    // Add organizationName field (separate from companyName for opportunities)
    await queryInterface.addColumn('events', 'organizationName', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Organization name for opportunities'
    });

    // Add participationType field
    await queryInterface.addColumn('events', 'participationType', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'individual',
      comment: 'individual or team'
    });

    // Add mode field (online/offline)
    await queryInterface.addColumn('events', 'mode', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'online',
      comment: 'Mode of opportunity: online or offline'
    });

    console.log('✅ Added opportunityType, opportunitySubType, organizationName, participationType, and mode fields to events table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('events', 'opportunityType');
    await queryInterface.removeColumn('events', 'opportunitySubType');
    await queryInterface.removeColumn('events', 'organizationName');
    await queryInterface.removeColumn('events', 'participationType');
    await queryInterface.removeColumn('events', 'mode');
  }
};
