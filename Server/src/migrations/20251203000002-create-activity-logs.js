'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activity_logs', {
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
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      entityType: {
        type: Sequelize.ENUM('job', 'event', 'organization', 'member', 'application'),
        allowNull: false
      },
      entityId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      changes: {
        type: Sequelize.JSON,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('activity_logs', ['organizationId']);
    await queryInterface.addIndex('activity_logs', ['userId']);
    await queryInterface.addIndex('activity_logs', ['entityType', 'entityId']);
    await queryInterface.addIndex('activity_logs', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activity_logs');
  }
};
