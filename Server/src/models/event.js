const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Event extends Model {}

Event.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  bannerImage: { type: DataTypes.TEXT, allowNull: true },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  registrationDeadline: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('upcoming','ongoing','completed','cancelled'), defaultValue: 'upcoming' },
  locationType: { type: DataTypes.ENUM('online','offline','hybrid'), defaultValue: 'online' },
  location: { type: DataTypes.STRING, allowNull: true },
  eligibility: { type: DataTypes.JSON, allowNull: true },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  prizes: { type: DataTypes.JSON, allowNull: true },
  registrationLink: { type: DataTypes.TEXT, allowNull: true },
  media: { type: DataTypes.JSON, allowNull: true }, // Array of {type: 'image'|'video', url: string, thumbnail?: string}
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  registrations: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdBy: { type: DataTypes.UUID, allowNull: false }
}, {
  sequelize,
  modelName: 'Event',
  tableName: 'events',
  timestamps: true,
  paranoid: true
});

module.exports = Event;
