'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if faqs column exists in jobs table
      const jobsTableInfo = await queryInterface.describeTable('jobs');
      if (!jobsTableInfo.faqs) {
        await queryInterface.addColumn('jobs', 'faqs', {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Array of {question: string, answer: string}'
        });
        console.log('Added faqs column to jobs table');
      } else {
        console.log('faqs column already exists in jobs table');
      }
      
      // Check if faqs column exists in hub_content table
      const hubContentTableInfo = await queryInterface.describeTable('hub_content');
      if (!hubContentTableInfo.faqs) {
        await queryInterface.addColumn('hub_content', 'faqs', {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Array of {question: string, answer: string}'
        });
        console.log('Added faqs column to hub_content table');
      } else {
        console.log('faqs column already exists in hub_content table');
      }
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Check if faqs column exists before removing
      const jobsTableInfo = await queryInterface.describeTable('jobs');
      if (jobsTableInfo.faqs) {
        await queryInterface.removeColumn('jobs', 'faqs');
        console.log('Removed faqs column from jobs table');
      }
      
      const hubContentTableInfo = await queryInterface.describeTable('hub_content');
      if (hubContentTableInfo.faqs) {
        await queryInterface.removeColumn('hub_content', 'faqs');
        console.log('Removed faqs column from hub_content table');
      }
      
      console.log('Rollback completed successfully');
    } catch (error) {
      console.error('Error in rollback:', error);
      throw error;
    }
  }
};