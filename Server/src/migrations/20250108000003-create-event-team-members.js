'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_team_members', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      teamId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'event_teams',
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
      eventId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('leader', 'member'),
        defaultValue: 'member',
        allowNull: false
      },
      joinedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent user from joining multiple teams for same event
    await queryInterface.addIndex('event_team_members', {
      fields: ['userId', 'eventId'],
      unique: true,
      name: 'unique_user_event_team'
    });

    // Add index for faster queries
    await queryInterface.addIndex('event_team_members', {
      fields: ['teamId'],
      name: 'idx_team_members_team'
    });

    await queryInterface.addIndex('event_team_members', {
      fields: ['eventId'],
      name: 'idx_team_members_event'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_team_members');
  }
};