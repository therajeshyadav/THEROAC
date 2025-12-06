const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Notification extends Model {}

Notification.init({
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    comment: 'User who receives this notification'
  },
  type: { 
    type: DataTypes.ENUM(
      'application_status',
      'organization_invite',
      'new_application',
      'application_viewed',
      'job_posted',
      'event_registration',
      'message',
      'system'
    ),
    allowNull: false 
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  message: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  data: { 
    type: DataTypes.JSON, 
    allowNull: true,
    comment: 'Additional data like jobId, applicationId, etc.'
  },
  read: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  readAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  actionUrl: { 
    type: DataTypes.STRING, 
    allowNull: true,
    comment: 'URL to navigate when notification is clicked'
  },
  icon: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  priority: { 
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['read'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Notification;
