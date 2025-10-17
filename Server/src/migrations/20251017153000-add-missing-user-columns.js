'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing columns to users table
    await queryInterface.addColumn('users', 'emailVerificationToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'emailVerifiedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'resetPasswordExpires', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'failedLoginAttempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('users', 'lastLoginIP', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'lastLogin', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'emailVerificationToken');
    await queryInterface.removeColumn('users', 'emailVerifiedAt');
    await queryInterface.removeColumn('users', 'resetPasswordToken');
    await queryInterface.removeColumn('users', 'resetPasswordExpires');
    await queryInterface.removeColumn('users', 'failedLoginAttempts');
    await queryInterface.removeColumn('users', 'lastLoginIP');
    await queryInterface.removeColumn('users', 'lastLogin');
  }
};