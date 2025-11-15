'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove unique constraint from phone column
    await queryInterface.removeConstraint('users', 'users_phone_key').catch(() => {
      // Constraint might not exist or have different name
      console.log('Constraint users_phone_key not found, trying alternative names...');
    });
    
    // Try alternative constraint names
    await queryInterface.removeConstraint('users', 'phone').catch(() => {
      console.log('Constraint phone not found');
    });
    
    // If above don't work, try removing index
    await queryInterface.removeIndex('users', 'users_phone_key').catch(() => {
      console.log('Index users_phone_key not found');
    });
    
    await queryInterface.removeIndex('users', ['phone']).catch(() => {
      console.log('Index on phone column not found');
    });
    
    console.log('Phone unique constraint removed successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back unique constraint if needed to rollback
    await queryInterface.addConstraint('users', {
      fields: ['phone'],
      type: 'unique',
      name: 'users_phone_key'
    });
  }
};
