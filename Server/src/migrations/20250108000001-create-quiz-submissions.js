'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quiz_submissions', {
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
      stageIndex: {
        type: Sequelize.INTEGER,
        allowNull: false
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
      answers: {
        type: Sequelize.JSON,
        allowNull: false
      },
      score: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      correctAnswers: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      totalQuestions: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      timeSpent: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      passed: {
        type: Sequelize.BOOLEAN,
        allowNull: false
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

    // Add unique constraint to prevent multiple submissions per user per stage
    await queryInterface.addIndex('quiz_submissions', {
      fields: ['eventId', 'stageIndex', 'userId'],
      unique: true,
      name: 'unique_user_stage_quiz'
    });

    // Add index for faster queries
    await queryInterface.addIndex('quiz_submissions', {
      fields: ['eventId', 'stageIndex'],
      name: 'idx_event_stage_quiz'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('quiz_submissions');
  }
};