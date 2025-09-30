const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class JobApplication extends Model {}

JobApplication.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  jobId: { type: DataTypes.UUID, allowNull: false },
  resumeLink: { type: DataTypes.TEXT, allowNull: true },
  coverLetter: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('applied','shortlisted','interview','offered','hired','rejected'), defaultValue: 'applied' },
  metadata: { type: DataTypes.JSON, allowNull: true }
}, {
  sequelize,
  modelName: 'JobApplication',
  tableName: 'job_applications',
  timestamps: true,
  paranoid: true
});

module.exports = JobApplication;
