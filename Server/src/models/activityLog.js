const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ActivityLog extends Model {}

ActivityLog.init({
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  organizationId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  action: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  entityType: { 
    type: DataTypes.ENUM('job', 'event', 'organization', 'member', 'application'), 
    allowNull: false 
  },
  entityId: { 
    type: DataTypes.UUID, 
    allowNull: true 
  },
  changes: { 
    type: DataTypes.JSON, 
    allowNull: true 
  },
  metadata: { 
    type: DataTypes.JSON, 
    allowNull: true 
  },
  ipAddress: { 
    type: DataTypes.STRING, 
    allowNull: true 
  }
}, {
  sequelize,
  modelName: 'ActivityLog',
  tableName: 'activity_logs',
  timestamps: true,
  updatedAt: false
});

module.exports = ActivityLog;
