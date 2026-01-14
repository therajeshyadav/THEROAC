'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if columns exist before adding them
    const tableDescription = await queryInterface.describeTable('events');
    
    if (!tableDescription.minTeamSize) {
      await queryInterface.addColumn('events', 'minTeamSize', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: 'Minimum team size for team-based events'
      });
    }

    if (!tableDescription.maxTeamSize) {
      await queryInterface.addColumn('events', 'maxTeamSize', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: 'Maximum team size for team-based events'
      });
    }

    if (!tableDescription.problemStatements) {
      await queryInterface.addColumn('events', 'problemStatements', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Problem statements for hackathons/competitions'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('events');
    
    if (tableDescription.minTeamSize) {
      await queryInterface.removeColumn('events', 'minTeamSize');
    }
    if (tableDescription.maxTeamSize) {
      await queryInterface.removeColumn('events', 'maxTeamSize');
    }
    if (tableDescription.problemStatements) {
      await queryInterface.removeColumn('events', 'problemStatements');
    }
  }
};