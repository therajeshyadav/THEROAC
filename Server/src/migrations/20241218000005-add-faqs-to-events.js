'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column exists before adding
    const tableDescription = await queryInterface.describeTable('events');
    if (!tableDescription.faqs) {
      await queryInterface.addColumn('events', 'faqs', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of {question, answer} objects'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if column exists before removing
    const tableDescription = await queryInterface.describeTable('events');
    if (tableDescription.faqs) {
      await queryInterface.removeColumn('events', 'faqs');
    }
  }
};