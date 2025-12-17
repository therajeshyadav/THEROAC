'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add approval fields to Jobs table
    await queryInterface.addColumn('jobs', 'approvalStatus', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'draft'),
      defaultValue: 'pending',
      allowNull: false
    });

    await queryInterface.addColumn('jobs', 'approvedBy', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('jobs', 'approvedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add approval fields to Events table
    await queryInterface.addColumn('events', 'approvalStatus', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'draft'),
      defaultValue: 'pending',
      allowNull: false
    });

    await queryInterface.addColumn('events', 'approvedBy', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('events', 'approvedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('events', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove approval fields from Jobs table
    await queryInterface.removeColumn('jobs', 'approvalStatus');
    await queryInterface.removeColumn('jobs', 'approvedBy');
    await queryInterface.removeColumn('jobs', 'approvedAt');
    await queryInterface.removeColumn('jobs', 'rejectionReason');

    // Remove approval fields from Events table
    await queryInterface.removeColumn('events', 'approvalStatus');
    await queryInterface.removeColumn('events', 'approvedBy');
    await queryInterface.removeColumn('events', 'approvedAt');
    await queryInterface.removeColumn('events', 'rejectionReason');
  }
};