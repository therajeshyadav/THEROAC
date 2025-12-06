'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add contentType enum
    await queryInterface.addColumn('hub_content', 'contentType', {
      type: Sequelize.ENUM('internship', 'job', 'article', 'guide', 'tutorial', 'opportunity'),
      defaultValue: 'article'
    });
    
    // Update category enum to include new values
    await queryInterface.changeColumn('hub_content', 'category', {
      type: Sequelize.ENUM('career-tips', 'interview-prep', 'skill-development', 'industry-insights', 'networking', 'internships', 'jobs'),
      defaultValue: 'career-tips'
    });
    
    await queryInterface.addColumn('hub_content', 'thumbnailImage', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'bannerImage', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'companyName', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'companyLogo', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'companyDescription', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'position', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'duration', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'stipend', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'location', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'locationType', {
      type: Sequelize.ENUM('remote','onsite','hybrid'),
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'applicationDeadline', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'applyLink', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'applyEmail', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'requirements', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'responsibilities', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'skills', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'benefits', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'numberOfPositions', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    
    await queryInterface.addColumn('hub_content', 'featured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    
    await queryInterface.addColumn('hub_content', 'applications', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('hub_content', 'organizationId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('hub_content', 'contentType');
    await queryInterface.removeColumn('hub_content', 'thumbnailImage');
    await queryInterface.removeColumn('hub_content', 'bannerImage');
    await queryInterface.removeColumn('hub_content', 'companyName');
    await queryInterface.removeColumn('hub_content', 'companyLogo');
    await queryInterface.removeColumn('hub_content', 'companyDescription');
    await queryInterface.removeColumn('hub_content', 'position');
    await queryInterface.removeColumn('hub_content', 'duration');
    await queryInterface.removeColumn('hub_content', 'stipend');
    await queryInterface.removeColumn('hub_content', 'location');
    await queryInterface.removeColumn('hub_content', 'locationType');
    await queryInterface.removeColumn('hub_content', 'applicationDeadline');
    await queryInterface.removeColumn('hub_content', 'applyLink');
    await queryInterface.removeColumn('hub_content', 'applyEmail');
    await queryInterface.removeColumn('hub_content', 'requirements');
    await queryInterface.removeColumn('hub_content', 'responsibilities');
    await queryInterface.removeColumn('hub_content', 'skills');
    await queryInterface.removeColumn('hub_content', 'benefits');
    await queryInterface.removeColumn('hub_content', 'numberOfPositions');
    await queryInterface.removeColumn('hub_content', 'featured');
    await queryInterface.removeColumn('hub_content', 'applications');
    await queryInterface.removeColumn('hub_content', 'organizationId');
    
    // Revert category enum
    await queryInterface.changeColumn('hub_content', 'category', {
      type: Sequelize.ENUM('career-tips', 'interview-prep', 'skill-development', 'industry-insights', 'networking'),
      defaultValue: 'career-tips'
    });
  }
};
