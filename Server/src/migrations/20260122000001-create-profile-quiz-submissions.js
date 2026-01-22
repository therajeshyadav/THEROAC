'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('profile_quiz_submissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
      skills: {
        type: Sequelize.JSON,
        allowNull: false
      },
      questions: {
        type: Sequelize.JSON,
        allowNull: false
      },
      answers: {
        type: Sequelize.JSON,
        allowNull: false
      },
      skillScores: {
        type: Sequelize.JSON,
        allowNull: false
      },
      overallScore: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      badges: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      timeSpent: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add unique constraint to ensure one quiz per user
    await queryInterface.addIndex('profile_quiz_submissions', ['userId'], {
      unique: true,
      name: 'unique_user_profile_quiz'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('profile_quiz_submissions');
  }
};