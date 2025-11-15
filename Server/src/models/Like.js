const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Like extends Model {}

Like.init({
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
  itemId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  itemType: {
    type: DataTypes.ENUM('jobs', 'events', 'internships'),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Like',
  tableName: 'likes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'itemId', 'itemType']
    }
  ]
});

module.exports = Like;
