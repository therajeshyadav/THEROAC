'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'media', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of media objects: {type: "image"|"video", url: string, thumbnail?: string}'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('events', 'media');
  }
};
