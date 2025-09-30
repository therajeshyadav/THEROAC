const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Hackathon extends Model {}

Hackathon.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  bannerImage: { type: DataTypes.TEXT, allowNull: true },
  problemStatement: { type: DataTypes.TEXT, allowNull: true },
  rules: { type: DataTypes.TEXT, allowNull: true },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  registrationDeadline: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('upcoming','ongoing','completed','cancelled'), defaultValue: 'upcoming' },
  locationType: { type: DataTypes.ENUM('online','offline','hybrid'), defaultValue: 'online' },
  prizes: { type: DataTypes.JSON, allowNull: true },
  eligibility: { type: DataTypes.JSON, allowNull: true },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  teamSizeMin: { type: DataTypes.INTEGER, allowNull: true },
  teamSizeMax: { type: DataTypes.INTEGER, allowNull: true },
  submissionType: { type: DataTypes.ENUM('idea','ppt','code','prototype'), allowNull: true },
  submissionLink: { type: DataTypes.TEXT, allowNull: true },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  registrations: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdBy: { type: DataTypes.UUID, allowNull: false }
}, {
  sequelize,
  modelName: 'Hackathon',
  tableName: 'hackathons',
  timestamps: true,
  paranoid: true
});

module.exports = Hackathon;
