'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('jobs');
    if (!tableDescription.eligibility) {
      await queryInterface.addColumn('jobs', 'eligibility', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of eligibility criteria for the job'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('jobs');
    if (tableDescription.eligibility) {
      await queryInterface.removeColumn('jobs', 'eligibility');
    }
  }
};