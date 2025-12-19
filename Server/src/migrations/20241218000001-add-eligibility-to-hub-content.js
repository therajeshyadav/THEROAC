'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('hub_content');
    if (!tableDescription.eligibility) {
      await queryInterface.addColumn('hub_content', 'eligibility', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of eligibility criteria for the internship/content'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('hub_content');
    if (tableDescription.eligibility) {
      await queryInterface.removeColumn('hub_content', 'eligibility');
    }
  }
};