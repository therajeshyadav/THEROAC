'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new enum values to the notification type enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" ADD VALUE 'job_pending_approval';
      ALTER TYPE "enum_notifications_type" ADD VALUE 'event_pending_approval';
      ALTER TYPE "enum_notifications_type" ADD VALUE 'job_approval';
      ALTER TYPE "enum_notifications_type" ADD VALUE 'event_approval';
      ALTER TYPE "enum_notifications_type" ADD VALUE 'interview_scheduled';
      ALTER TYPE "enum_notifications_type" ADD VALUE 'interview_rescheduled';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type, which is complex
    // For now, we'll leave the enum values in place
    console.log('Cannot remove enum values in PostgreSQL. Migration down skipped.');
  }
};