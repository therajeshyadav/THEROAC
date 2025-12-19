const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Review extends Model {}

Review.init({
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
  rating: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  comment: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  pros: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  cons: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  isAnonymous: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  isVerified: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  status: { 
    type: DataTypes.ENUM('pending', 'approved', 'rejected'), 
    defaultValue: 'pending' 
  },
  helpfulCount: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  createdBy: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  moderatedBy: { 
    type: DataTypes.UUID, 
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  moderatedAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  }
}, {
  sequelize,
  modelName: 'Review',
  tableName: 'reviews',
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
    }
  ]
});

module.exports = Review;