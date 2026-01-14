'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column exists before adding
    const tableDescription = await queryInterface.describeTable('events');
    if (!tableDescription.stages) {
      await queryInterface.addColumn('events', 'stages', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of submission stages for competitive events like hackathons'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if column exists before removing
    const tableDescription = await queryInterface.describeTable('events');
    if (tableDescription.stages) {
      await queryInterface.removeColumn('events', 'stages');
    }
  }
};