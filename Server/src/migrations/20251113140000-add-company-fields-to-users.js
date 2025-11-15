'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add company fields for recruiters (lowercase for PostgreSQL)
    await queryInterface.addColumn('users', 'companyname', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'companylogo', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'companywebsite', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'companydescription', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'companysociallinks', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Company social media links: {facebook, twitter, linkedin, instagram}'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'companyname');
    await queryInterface.removeColumn('users', 'companylogo');
    await queryInterface.removeColumn('users', 'companywebsite');
    await queryInterface.removeColumn('users', 'companydescription');
    await queryInterface.removeColumn('users', 'companysociallinks');
  }
};
