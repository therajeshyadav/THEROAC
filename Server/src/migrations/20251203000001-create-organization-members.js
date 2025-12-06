'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organization_members', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('owner', 'admin', 'manager', 'member', 'viewer'),
        defaultValue: 'member'
      },
      permissions: {
        type: Sequelize.JSON,
        defaultValue: {
          canManageJobs: false,
          canManageEvents: false,
          canManageTeam: false,
          canViewAnalytics: false,
          canManageApplications: false,
          canPostJobs: false,
          canPostEvents: false,
          canEditJobs: false,
          canEditEvents: false,
          canDeleteJobs: false,
          canDeleteEvents: false,
          canRespondToApplications: false
        }
      },
      invitedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      invitedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'inactive', 'removed'),
        defaultValue: 'pending'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('organization_members', ['organizationId']);
    await queryInterface.addIndex('organization_members', ['userId']);
    await queryInterface.addIndex('organization_members', ['organizationId', 'userId'], {
      unique: true,
      name: 'unique_org_user'
    });
    await queryInterface.addIndex('organization_members', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('organization_members');
  }
};
