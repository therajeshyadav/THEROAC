'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add approval fields to HubContent table for internships and ROAC Prime content
    await queryInterface.addColumn('hub_content', 'approvalStatus', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'draft'),
      defaultValue: 'pending',
      allowNull: false
    });

    await queryInterface.addColumn('hub_content', 'approvedBy', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('hub_content', 'approvedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('hub_content', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Update existing published content to approved status
    await queryInterface.sequelize.query(`
      UPDATE hub_content 
      SET "approvalStatus" = 'approved', "approvedAt" = NOW() 
      WHERE status = 'published'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove approval fields from HubContent table
    await queryInterface.removeColumn('hub_content', 'approvalStatus');
    await queryInterface.removeColumn('hub_content', 'approvedBy');
    await queryInterface.removeColumn('hub_content', 'approvedAt');
    await queryInterface.removeColumn('hub_content', 'rejectionReason');
  }
};