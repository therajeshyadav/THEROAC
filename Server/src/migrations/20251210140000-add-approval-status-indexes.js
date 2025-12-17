'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add indexes for approval status queries to improve performance
      // Use IF NOT EXISTS equivalent by catching errors
      
      try {
        await queryInterface.addIndex('jobs', ['approvalStatus'], {
          name: 'jobs_approval_status_idx'
        });
      } catch (e) {
        console.log('Index jobs_approval_status_idx already exists');
      }
      
      try {
        await queryInterface.addIndex('events', ['approvalStatus'], {
          name: 'events_approval_status_idx'
        });
      } catch (e) {
        console.log('Index events_approval_status_idx already exists');
      }
      
      try {
        await queryInterface.addIndex('hub_content', ['approvalStatus'], {
          name: 'hub_contents_approval_status_idx'
        });
      } catch (e) {
        console.log('Index hub_contents_approval_status_idx already exists');
      }
      
      // Add composite indexes for better query performance
      try {
        await queryInterface.addIndex('jobs', ['approvalStatus', 'createdAt'], {
          name: 'jobs_approval_status_created_at_idx'
        });
      } catch (e) {
        console.log('Index jobs_approval_status_created_at_idx already exists');
      }
      
      try {
        await queryInterface.addIndex('events', ['approvalStatus', 'createdAt'], {
          name: 'events_approval_status_created_at_idx'
        });
      } catch (e) {
        console.log('Index events_approval_status_created_at_idx already exists');
      }
      
      try {
        await queryInterface.addIndex('hub_content', ['approvalStatus', 'contentType', 'createdAt'], {
          name: 'hub_contents_approval_content_created_idx'
        });
      } catch (e) {
        console.log('Index hub_contents_approval_content_created_idx already exists');
      }
    } catch (error) {
      console.error('Error adding indexes:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('jobs', 'jobs_approval_status_idx');
    await queryInterface.removeIndex('events', 'events_approval_status_idx');
    await queryInterface.removeIndex('hub_content', 'hub_contents_approval_status_idx');
    await queryInterface.removeIndex('jobs', 'jobs_approval_status_created_at_idx');
    await queryInterface.removeIndex('events', 'events_approval_status_created_at_idx');
    await queryInterface.removeIndex('hub_content', 'hub_contents_approval_content_created_idx');
  }
};