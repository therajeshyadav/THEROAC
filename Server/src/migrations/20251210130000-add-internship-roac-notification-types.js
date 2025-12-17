'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new enum values for internship and ROAC Prime approval notifications
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'internship_approval';
      ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'roac_prime_approval';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type, which is complex
    // For now, we'll leave the enum values in place
    console.log('Cannot remove enum values in PostgreSQL. Migration down skipped.');
  }
};