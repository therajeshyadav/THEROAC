'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add social links to jobs table (lowercase for PostgreSQL)
    await queryInterface.addColumn('jobs', 'sociallinks', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Social media links: {facebook, twitter, linkedin, instagram, website}'
    });

    // Add social links to events table
    await queryInterface.addColumn('events', 'sociallinks', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Social media links: {facebook, twitter, linkedin, instagram, website}'
    });

    // Add social links to hub_content table
    await queryInterface.addColumn('hub_content', 'sociallinks', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Social media links: {facebook, twitter, linkedin, instagram, website}'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('jobs', 'sociallinks');
    await queryInterface.removeColumn('events', 'sociallinks');
    await queryInterface.removeColumn('hub_content', 'sociallinks');
  }
};
