'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('event_stage_submissions')) {
      console.log('Table event_stage_submissions already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('event_stage_submissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
      stageIndex: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Index of the stage in the event stages array'
      },
      stageName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Name of the stage (e.g., Round 1, Final Round)'
      },
      submissionData: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'JSON object containing all submission data (files, links, text, etc.)'
      },
      status: {
        type: Sequelize.ENUM('submitted', 'under_review', 'accepted', 'rejected'),
        defaultValue: 'submitted'
      },
      reviewNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes from reviewers/judges'
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Score given by judges (if applicable)'
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('event_stage_submissions', ['eventId']);
    await queryInterface.addIndex('event_stage_submissions', ['userId']);
    await queryInterface.addIndex('event_stage_submissions', ['eventId', 'userId', 'stageIndex'], {
      unique: true,
      name: 'unique_user_stage_submission'
    });
    await queryInterface.addIndex('event_stage_submissions', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('event_stage_submissions');
  }
};