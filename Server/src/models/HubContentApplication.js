const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class HubContentApplication extends Model {}

HubContentApplication.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  hubContentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hub_content',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'HubContentApplication',
  tableName: 'hub_content_applications',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'hubContentId']
    }
  ]
});

module.exports = HubContentApplication;
