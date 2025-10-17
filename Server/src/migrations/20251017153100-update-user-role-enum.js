'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update role enum to include candidate and recruiter
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'candidate';
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'recruiter';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values easily
    // This would require recreating the enum type
    console.log('Rollback not implemented for enum values');
  }
};