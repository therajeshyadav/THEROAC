'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const usersTable = await queryInterface.describeTable('users');
    
    // Add organization-related fields to users table
    if (!usersTable.currentOrganizationId) {
      await queryInterface.addColumn('users', 'currentOrganizationId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      await queryInterface.addIndex('users', ['currentOrganizationId']);
    }

    if (!usersTable.companyWebsite) {
      await queryInterface.addColumn('users', 'companyWebsite', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!usersTable.linkedinUrl) {
      await queryInterface.addColumn('users', 'linkedinUrl', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!usersTable.twitterUrl) {
      await queryInterface.addColumn('users', 'twitterUrl', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!usersTable.githubUrl) {
      await queryInterface.addColumn('users', 'githubUrl', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'currentOrganizationId');
    await queryInterface.removeColumn('users', 'companyWebsite');
    await queryInterface.removeColumn('users', 'linkedinUrl');
    await queryInterface.removeColumn('users', 'twitterUrl');
    await queryInterface.removeColumn('users', 'githubUrl');
  }
};
