'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'faqs', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of {question, answer} objects'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('events', 'faqs');
  }
};