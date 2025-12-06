'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organizations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      logo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.JSON,
        allowNull: true
      },
      industry: {
        type: Sequelize.STRING,
        allowNull: true
      },
      companySize: {
        type: Sequelize.ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'),
        allowNull: true
      },
      foundedYear: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      socialLinks: {
        type: Sequelize.JSON,
        allowNull: true
      },
      settings: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    await queryInterface.addIndex('organizations', ['slug']);
    await queryInterface.addIndex('organizations', ['ownerId']);
    await queryInterface.addIndex('organizations', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('organizations');
  }
};
