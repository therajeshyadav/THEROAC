const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ProfileView extends Model {}

ProfileView.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profileUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  viewerUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  viewedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ProfileView',
  tableName: 'ProfileViews',
  timestamps: true,
  indexes: [
    {
      fields: ['profileUserId']
    },
    {
      fields: ['viewerUserId']
    },
    {
      fields: ['viewedAt']
    }
  ]
});

module.exports = ProfileView;
