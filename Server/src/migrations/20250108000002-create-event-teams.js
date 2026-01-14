'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_teams', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
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
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      teamCode: {
        type: Sequelize.STRING(6),
        allowNull: false,
        unique: true
      },
      leaderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      maxMembers: {
        type: Sequelize.INTEGER,
        defaultValue: 4,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      projectTitle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      projectDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      submissionData: {
        type: Sequelize.JSON,
        allowNull: true
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

    // Add unique constraint for team code
    await queryInterface.addIndex('event_teams', {
      fields: ['teamCode'],
      unique: true,
      name: 'unique_team_code'
    });

    // Add index for faster queries
    await queryInterface.addIndex('event_teams', {
      fields: ['eventId'],
      name: 'idx_event_teams_event'
    });

    await queryInterface.addIndex('event_teams', {
      fields: ['leaderId'],
      name: 'idx_event_teams_leader'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_teams');
  }
};