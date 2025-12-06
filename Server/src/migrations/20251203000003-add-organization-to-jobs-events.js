'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check and add organizationId to jobs table
    const jobsTable = await queryInterface.describeTable('jobs');
    if (!jobsTable.organizationId) {
      await queryInterface.addColumn('jobs', 'organizationId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      await queryInterface.addIndex('jobs', ['organizationId']);
    }

    // Check and add organizationId to events table
    const eventsTable = await queryInterface.describeTable('events');
    if (!eventsTable.organizationId) {
      await queryInterface.addColumn('events', 'organizationId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      await queryInterface.addIndex('events', ['organizationId']);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('jobs', 'organizationId');
    await queryInterface.removeColumn('events', 'organizationId');
  }
};
