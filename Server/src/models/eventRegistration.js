const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class EventRegistration extends Model {}

EventRegistration.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  eventId: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.ENUM('registered','attended','cancelled'), defaultValue: 'registered' },
  metadata: { type: DataTypes.JSON, allowNull: true }
}, {
  sequelize,
  modelName: 'EventRegistration',
  tableName: 'event_registrations',
  timestamps: true,
  paranoid: true
});

module.exports = EventRegistration;
