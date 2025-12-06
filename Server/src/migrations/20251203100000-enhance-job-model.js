'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('jobs', 'bannerImage', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'qualifications', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'perks', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'state', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'country', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'applyEmail', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'categories', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'department', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'numberOfPositions', {
      type: Sequelize.INTEGER,
      defaultValue: 1
    });
    
    await queryInterface.addColumn('jobs', 'media', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'companyDescription', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'companyWebsite', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'companySocials', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'contactPerson', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'featured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    
    await queryInterface.addColumn('jobs', 'urgent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('jobs', 'bannerImage');
    await queryInterface.removeColumn('jobs', 'qualifications');
    await queryInterface.removeColumn('jobs', 'perks');
    await queryInterface.removeColumn('jobs', 'city');
    await queryInterface.removeColumn('jobs', 'state');
    await queryInterface.removeColumn('jobs', 'country');
    await queryInterface.removeColumn('jobs', 'applyEmail');
    await queryInterface.removeColumn('jobs', 'categories');
    await queryInterface.removeColumn('jobs', 'department');
    await queryInterface.removeColumn('jobs', 'numberOfPositions');
    await queryInterface.removeColumn('jobs', 'media');
    await queryInterface.removeColumn('jobs', 'companyDescription');
    await queryInterface.removeColumn('jobs', 'companyWebsite');
    await queryInterface.removeColumn('jobs', 'companySocials');
    await queryInterface.removeColumn('jobs', 'contactPerson');
    await queryInterface.removeColumn('jobs', 'featured');
    await queryInterface.removeColumn('jobs', 'urgent');
  }
};
