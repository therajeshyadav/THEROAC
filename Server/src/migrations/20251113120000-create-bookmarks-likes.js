'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create bookmarks table
    await queryInterface.createTable('bookmarks', {
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
      itemId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      itemType: {
        type: Sequelize.ENUM('jobs', 'events', 'internships'),
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

    // Add unique constraint for bookmarks
    await queryInterface.addConstraint('bookmarks', {
      fields: ['userId', 'itemId', 'itemType'],
      type: 'unique',
      name: 'unique_user_item_bookmark'
    });

    // Create likes table
    await queryInterface.createTable('likes', {
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
      itemId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      itemType: {
        type: Sequelize.ENUM('jobs', 'events', 'internships'),
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

    // Add unique constraint for likes
    await queryInterface.addConstraint('likes', {
      fields: ['userId', 'itemId', 'itemType'],
      type: 'unique',
      name: 'unique_user_item_like'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('likes');
    await queryInterface.dropTable('bookmarks');
  }
};
