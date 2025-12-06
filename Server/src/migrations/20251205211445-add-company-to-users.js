'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'company', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'education'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'company');
  }
};
