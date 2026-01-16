'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new notification types to the enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" 
      ADD VALUE IF NOT EXISTS 'interview_stage_shortlist';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" 
      ADD VALUE IF NOT EXISTS 'job_offer';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values directly
    // You would need to recreate the enum type to remove values
    console.log('Removing enum values is not supported in PostgreSQL. Manual intervention required.');
  }
};
