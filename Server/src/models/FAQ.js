const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class FAQ extends Model {}

FAQ.init({
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  itemType: { 
    type: DataTypes.ENUM('job', 'event', 'internship', 'hubContent'), 
    allowNull: false 
  },
  itemId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  question: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  answer: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  isAnswered: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  isPublic: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  upvotes: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  downvotes: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  status: { 
    type: DataTypes.ENUM('pending', 'approved', 'rejected'), 
    defaultValue: 'approved' 
  },
  createdBy: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  answeredBy: { 
    type: DataTypes.UUID, 
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  answeredAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  }
}, {
  sequelize,
  modelName: 'FAQ',
  tableName: 'faqs',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['itemType', 'itemId']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isAnswered']
    }
  ]
});

module.exports = FAQ;