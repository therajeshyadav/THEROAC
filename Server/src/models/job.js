const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Job extends Model {}

Job.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  companyName: { type: DataTypes.STRING, allowNull: false },
  companyLogo: { type: DataTypes.TEXT, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  responsibilities: { type: DataTypes.TEXT, allowNull: true },
  requirements: { type: DataTypes.TEXT, allowNull: true },
  jobType: { type: DataTypes.ENUM('full-time','part-time','internship','contract'), defaultValue: 'full-time' },
  experienceLevel: { type: DataTypes.ENUM('fresher','junior','mid','senior'), defaultValue: 'fresher' },
  locationType: { type: DataTypes.ENUM('remote','onsite','hybrid'), defaultValue: 'remote' },
  location: { type: DataTypes.STRING, allowNull: true },
  salary: { type: DataTypes.JSON, allowNull: true },
  applicationDeadline: { type: DataTypes.DATE, allowNull: true },
  applyLink: { type: DataTypes.TEXT, allowNull: true },
  skills: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  status: { type: DataTypes.ENUM('open','closed','paused'), defaultValue: 'open' },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  applications: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdBy: { type: DataTypes.UUID, allowNull: false }
}, {
  sequelize,
  modelName: 'Job',
  tableName: 'jobs',
  timestamps: true,
  paranoid: true
});

module.exports = Job;
