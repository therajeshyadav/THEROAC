'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if stages column already exists in jobs table
    const jobsTableDescription = await queryInterface.describeTable('jobs');
    if (!jobsTableDescription.stages) {
      await queryInterface.addColumn('jobs', 'stages', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Recruitment stages/rounds - [{title, type, description, deadline, assessmentLink, assessmentFile, submissions: [{type, label, description, required}]}]'
      });
      console.log('✅ Added stages column to jobs table');
    } else {
      console.log('ℹ️ stages column already exists in jobs table');
    }

    // Check if stages column already exists in hub_content table
    const hubContentTableDescription = await queryInterface.describeTable('hub_content');
    if (!hubContentTableDescription.stages) {
      await queryInterface.addColumn('hub_content', 'stages', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Recruitment stages/rounds - [{title, type, description, deadline, assessmentLink, assessmentFile, submissions: [{type, label, description, required}]}]'
      });
      console.log('✅ Added stages column to hub_content table');
    } else {
      console.log('ℹ️ stages column already exists in hub_content table');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if stages column exists before removing from jobs table
    const jobsTableDescription = await queryInterface.describeTable('jobs');
    if (jobsTableDescription.stages) {
      await queryInterface.removeColumn('jobs', 'stages');
      console.log('✅ Removed stages column from jobs table');
    }

    // Check if stages column exists before removing from hub_content table
    const hubContentTableDescription = await queryInterface.describeTable('hub_content');
    if (hubContentTableDescription.stages) {
      await queryInterface.removeColumn('hub_content', 'stages');
      console.log('✅ Removed stages column from hub_content table');
    }
  }
};
