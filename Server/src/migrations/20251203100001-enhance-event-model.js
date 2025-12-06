'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'thumbnailImage', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'venue', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'state', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'country', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'venueAddress', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'mapLink', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'categories', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'registrationFee', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'maxParticipants', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'agenda', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'speakers', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'sponsors', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'requirements', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'whatToBring', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'contactInfo', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'socials', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('events', 'featured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('events', 'thumbnailImage');
    await queryInterface.removeColumn('events', 'venue');
    await queryInterface.removeColumn('events', 'city');
    await queryInterface.removeColumn('events', 'state');
    await queryInterface.removeColumn('events', 'country');
    await queryInterface.removeColumn('events', 'venueAddress');
    await queryInterface.removeColumn('events', 'mapLink');
    await queryInterface.removeColumn('events', 'categories');
    await queryInterface.removeColumn('events', 'registrationFee');
    await queryInterface.removeColumn('events', 'maxParticipants');
    await queryInterface.removeColumn('events', 'agenda');
    await queryInterface.removeColumn('events', 'speakers');
    await queryInterface.removeColumn('events', 'sponsors');
    await queryInterface.removeColumn('events', 'requirements');
    await queryInterface.removeColumn('events', 'whatToBring');
    await queryInterface.removeColumn('events', 'contactInfo');
    await queryInterface.removeColumn('events', 'socials');
    await queryInterface.removeColumn('events', 'featured');
  }
};
