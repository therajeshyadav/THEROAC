'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, update the enum type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_hub_content_applications_status" 
      ADD VALUE IF NOT EXISTS 'applied';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_hub_content_applications_status" 
      ADD VALUE IF NOT EXISTS 'reviewing';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_hub_content_applications_status" 
      ADD VALUE IF NOT EXISTS 'shortlisted';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_hub_content_applications_status" 
      ADD VALUE IF NOT EXISTS 'interview';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_hub_content_applications_status" 
      ADD VALUE IF NOT EXISTS 'offered';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_hub_content_applications_status" 
      ADD VALUE IF NOT EXISTS 'hired';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values directly
    // You would need to recreate the enum type if you want to remove values
    console.log('Rollback not supported for adding enum values');
  }
};
