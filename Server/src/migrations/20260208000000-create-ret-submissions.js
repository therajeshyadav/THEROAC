'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ret_submissions', {
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
      topic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      difficulty: {
        type: Sequelize.STRING,
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
      coinsEarned: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    // Add index for userId and createdAt (check if exists first)
    try {
      await queryInterface.addIndex('ret_submissions', ['userId', 'createdAt'], {
        name: 'ret_submissions_user_id_created_at'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ret_submissions');
  }
};
