'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.badges) {
      await queryInterface.addColumn('users', 'badges', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      });
    }

    if (!tableDescription.profileQuizCompleted) {
      await queryInterface.addColumn('users', 'profileQuizCompleted', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    if (!tableDescription.profileQuizCompletedAt) {
      await queryInterface.addColumn('users', 'profileQuizCompletedAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'badges');
    await queryInterface.removeColumn('users', 'profileQuizCompleted');
    await queryInterface.removeColumn('users', 'profileQuizCompletedAt');
  }
};